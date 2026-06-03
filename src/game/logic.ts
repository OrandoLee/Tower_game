import { ENEMY_NAMES, ENEMY_TYPE_LABELS, LOG_LIMIT, MAX_FLOOR, SHOP_FLOORS } from './constants';
import { generateRewards } from './rewards';
import { createStarterDeck, generateShop } from './shop';
import { loadRecords, saveRecords } from './storage';
import type { DamageResult, Enemy, EnemyIntent, EnemyType, GameState, Player, PlayerCard, Records } from './types';

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function hasRelic(player: Player, relicId: string): boolean {
  return player.relics.some((relic) => relic.id === relicId);
}

function clampHp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.floor(value)));
}

function addLogs(existing: string[], next: string[]): string[] {
  return [...existing, ...next].slice(-LOG_LIMIT);
}

function enemyTypeLabel(type: EnemyType): string {
  return ENEMY_TYPE_LABELS[type];
}

function isShopFloor(floor: number): boolean {
  return SHOP_FLOORS.includes(floor);
}

function pickWeighted<T extends string>(entries: Array<[T, number]>): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;

  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return value;
    }
  }

  return entries[0][0];
}

function getIntentWeights(type: EnemyType): Array<[EnemyIntent['type'], number]> {
  if (type === 'normal') {
    return [
      ['attack', 70],
      ['heavy', 15],
      ['defend', 10],
      ['charge', 5],
    ];
  }

  if (type === 'elite') {
    return [
      ['attack', 50],
      ['heavy', 25],
      ['defend', 15],
      ['charge', 10],
    ];
  }

  return [
    ['attack', 45],
    ['heavy', 30],
    ['defend', 10],
    ['charge', 15],
  ];
}

function createEnemyIntent(enemyType: EnemyType, atk: number, charged = false): EnemyIntent {
  const intentType = charged ? 'heavy' : pickWeighted(getIntentWeights(enemyType));
  const chargeBonus = charged ? Math.floor(atk * 0.55) : 0;

  if (intentType === 'heavy') {
    const value = Math.floor(atk * 1.55) + chargeBonus;
    return {
      type: 'heavy',
      label: `强击 ${value}`,
      value,
      description: '敌人下回合造成较高伤害。',
    };
  }

  if (intentType === 'charge') {
    return {
      type: 'charge',
      label: '蓄力',
      value: 0,
      description: '本回合不攻击，但下回合攻击提高。',
    };
  }

  if (intentType === 'defend') {
    const value = Math.max(6, Math.floor(atk * 0.75));
    return {
      type: 'defend',
      label: '防御',
      value,
      description: '敌人获得护甲。',
    };
  }

  const value = atk + chargeBonus;
  return {
    type: 'attack',
    label: `攻击 ${value}`,
    value,
    description: '敌人下回合造成伤害。',
  };
}

function drawCard(player: Player, mode: 'attack' | 'guard'): PlayerCard {
  const pool =
    mode === 'attack'
      ? player.deck.filter((card) => card.kind === '攻击牌')
      : player.deck.filter((card) => card.kind === '防御牌' || card.kind === '技能牌');
  const fallback = player.deck.length > 0 ? player.deck : createStarterDeck();
  const candidates = pool.length > 0 ? pool : fallback;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getGoldReward(enemy: Enemy, player: Player): number {
  const base =
    enemy.type === 'normal'
      ? 8 + enemy.floor
      : enemy.type === 'elite'
        ? 18 + enemy.floor * 2
        : 35 + enemy.floor * 3;

  return hasRelic(player, 'greedy-coin') ? Math.floor(base * 1.5) : base;
}

function updateRecords(records: Records, floor: number, maxDamage: number, cleared = false): Records {
  const updated = {
    bestFloor: Math.max(records.bestFloor, floor),
    bestDamage: Math.max(records.bestDamage, maxDamage),
    clearCount: cleared ? records.clearCount + 1 : records.clearCount,
  };
  saveRecords(updated);
  return updated;
}

function gainPlayerBlock(player: Player, amount: number): { player: Player; gained: number } {
  if (amount <= 0) {
    return { player, gained: 0 };
  }

  const bonus = hasRelic(player, 'guard-module') && !player.gainedBlockThisTurn ? 3 : 0;
  const gained = amount + bonus;

  return {
    player: {
      ...player,
      block: Math.max(0, player.block + gained),
      gainedBlockThisTurn: true,
    },
    gained,
  };
}

function preparePlayerTurn(state: GameState): { player: Player; logs: string[] } {
  const logs: string[] = [];
  let player = {
    ...state.player,
    gainedBlockThisTurn: false,
  };

  if (state.turn > 0) {
    const shouldRetain = player.retainBlockNextTurn || hasRelic(player, 'stabilizer');
    const retained = shouldRetain ? Math.floor(player.block * 0.5) : 0;
    if (player.block > 0 && retained === 0) {
      logs.push('上一回合护甲已清空。');
    }
    if (retained > 0) {
      logs.push(`你保留了 ${retained} 点护甲。`);
    }
    player = {
      ...player,
      block: retained,
      retainBlockNextTurn: false,
    };
  }

  if (hasRelic(player, 'gray-amulet')) {
    const result = gainPlayerBlock(player, 2);
    player = result.player;
    logs.push(`灰色护符让你获得了 ${result.gained} 点护甲。`);
  }

  return { player, logs };
}

function prepareBattlePlayer(player: Player): Player {
  const baseBlock = hasRelic(player, 'wall-core') ? 6 : 0;
  return {
    ...player,
    block: baseBlock,
    retainBlockNextTurn: false,
    gainedBlockThisTurn: false,
    nextAttackBonus: 0,
  };
}

function dealDamageToEnemy(enemy: Enemy, damage: number): { enemy: Enemy; logs: string[] } {
  const logs: string[] = [];
  const safeDamage = Math.max(0, Math.floor(damage));
  const blocked = Math.min(enemy.block, safeDamage);
  const hpDamage = safeDamage - blocked;

  if (blocked > 0) {
    logs.push(`敌人护甲抵挡了 ${blocked} 点伤害。`);
  }

  return {
    enemy: {
      ...enemy,
      block: Math.max(0, enemy.block - blocked),
      hp: clampHp(enemy.hp - hpDamage, enemy.maxHp),
    },
    logs,
  };
}

function applyIncomingDamage(player: Player, rawDamage: number): { player: Player; logs: string[]; fullyBlocked: boolean } {
  const incoming = Math.max(1, Math.floor(rawDamage - player.def));
  const blocked = Math.min(player.block, incoming);
  const hpDamage = incoming - blocked;
  const logs: string[] = [];

  if (blocked > 0) {
    logs.push(`护甲抵挡了 ${blocked} 点伤害。`);
  }

  if (hpDamage > 0) {
    logs.push(`敌人造成了 ${hpDamage} 点伤害。`);
  } else {
    logs.push('敌人的攻击被护甲完全挡下。');
  }

  return {
    player: {
      ...player,
      block: Math.max(0, player.block - blocked),
      hp: clampHp(player.hp - hpDamage, player.maxHp),
    },
    logs,
    fullyBlocked: hpDamage === 0,
  };
}

export function createInitialPlayer(): Player {
  return {
    hp: 100,
    maxHp: 100,
    block: 0,
    atk: 12,
    def: 3,
    critRate: 0.1,
    critDamage: 2,
    lifesteal: 0,
    gold: 0,
    relics: [],
    deck: createStarterDeck(),
    retainBlockNextTurn: false,
    gainedBlockThisTurn: false,
    nextAttackBonus: 0,
  };
}

export function getEnemyType(floor: number): EnemyType {
  if (floor === MAX_FLOOR) {
    return 'finalBoss';
  }

  if (floor % 10 === 0) {
    return 'boss';
  }

  if (floor % 5 === 0) {
    return 'elite';
  }

  return 'normal';
}

export function generateEnemy(floor: number): Enemy {
  const type = getEnemyType(floor);
  const baseHp = 30 + floor * 8;
  const baseAtk = 6 + floor * 2;
  const hpMultiplier = type === 'normal' ? 1 : type === 'elite' ? 1.5 : 2.5;
  const atkMultiplier = type === 'normal' ? 1 : type === 'elite' ? 1.25 : 1.6;
  const name = type === 'finalBoss' ? '最终核心' : ENEMY_NAMES[Math.floor(Math.random() * (ENEMY_NAMES.length - 1))];
  const atk = Math.floor(baseAtk * atkMultiplier);

  return {
    name,
    type,
    hp: Math.floor(baseHp * hpMultiplier),
    maxHp: Math.floor(baseHp * hpMultiplier),
    block: 0,
    atk,
    floor,
    intent: createEnemyIntent(type, atk),
    charged: false,
  };
}

export function createInitialGameState(records = loadRecords()): GameState {
  const player = prepareBattlePlayer(createInitialPlayer());

  return {
    player,
    enemy: generateEnemy(1),
    floor: 1,
    kills: 0,
    maxDamage: 0,
    logs: ['你进入了第 1 层。'],
    rewardChoices: [],
    shop: null,
    phase: 'battle',
    turn: 0,
    records: updateRecords(records, 1, 0),
  };
}

export function calculatePlayerDamage(player: Player): DamageResult {
  const card = drawCard(player, 'attack');
  const logs = [`你打出了${card.kind}：${card.name}。`];
  let damage = 0;
  let critical = false;
  const lifesteal = player.lifesteal + (card.lifestealBonus ?? 0);

  if (card.damageFromBlock) {
    damage = Math.max(0, player.block) + player.nextAttackBonus;
    logs.push(`当前护甲转化为 ${damage} 点伤害。`);
  } else {
    const lowHpRage = hasRelic(player, 'rage-core') && player.hp / player.maxHp < 0.3;
    const effectiveAtk = (lowHpRage ? player.atk * 1.5 : player.atk) + (card.attackBonus ?? 0) + player.nextAttackBonus;
    damage = Math.max(1, Math.floor(effectiveAtk * randomBetween(0.85, 1.15)));
    const critRate = player.critRate + (card.critRateBonus ?? 0);
    const critDamage = player.critDamage + (card.critDamageBonus ?? 0);
    critical = Math.random() < critRate;

    if (critical) {
      damage = Math.floor(damage * critDamage);
    }
  }

  return {
    damage,
    critical,
    card,
    lifesteal,
    logs,
  };
}

export function resolveEnemyAction(
  player: Player,
  enemy: Enemy,
): { player: Player; enemy: Enemy; logs: string[]; playerDefeated: boolean; enemyDefeated: boolean } {
  let nextPlayer = player;
  let nextEnemy = enemy;
  const logs: string[] = [];
  const intent = enemy.intent;

  if (intent.type === 'attack' || intent.type === 'heavy') {
    const hadBlock = nextPlayer.block > 0;
    const incoming = applyIncomingDamage(nextPlayer, intent.value);
    nextPlayer = incoming.player;
    logs.push(...incoming.logs);

    if (incoming.fullyBlocked && hasRelic(nextPlayer, 'reactive-armor')) {
      const drawn = drawCard(nextPlayer, 'attack');
      const bonus = drawn.damageFromBlock ? Math.max(4, Math.floor(nextPlayer.block * 0.5)) : Math.max(2, drawn.attackBonus ?? 2);
      nextPlayer = {
        ...nextPlayer,
        nextAttackBonus: nextPlayer.nextAttackBonus + bonus,
      };
      logs.push(`反应装甲抽到了：${drawn.name}，下一次攻击伤害增加 ${bonus}。`);
    }

    if (hasRelic(nextPlayer, 'spike-armor')) {
      const reflected = hadBlock ? 6 : 3;
      const reflectedResult = dealDamageToEnemy(nextEnemy, reflected);
      nextEnemy = reflectedResult.enemy;
      logs.push(`尖刺甲反弹了 ${reflected} 点伤害。`);
      logs.push(...reflectedResult.logs);
    }
  }

  if (intent.type === 'charge') {
    logs.push('敌人正在蓄力，下回合攻击提高。');
  }

  if (intent.type === 'defend') {
    nextEnemy = {
      ...nextEnemy,
      block: nextEnemy.block + intent.value,
    };
    logs.push(`敌人获得了 ${intent.value} 点护甲。`);
  }

  const enemyDefeated = nextEnemy.hp <= 0;
  const playerDefeated = nextPlayer.hp <= 0;
  const charged = intent.type === 'charge';

  nextEnemy = {
    ...nextEnemy,
    charged,
    intent: enemyDefeated ? nextEnemy.intent : createEnemyIntent(nextEnemy.type, nextEnemy.atk, charged),
  };

  return {
    player: nextPlayer,
    enemy: nextEnemy,
    logs,
    playerDefeated,
    enemyDefeated,
  };
}

export function handleVictory(state: GameState, player: Player, enemy: Enemy, logs: string[]): GameState {
  const killLogs = [...logs, `你击败了${enemy.name}。`];
  let nextPlayer = player;
  const kills = state.kills + 1;
  const gold = getGoldReward(enemy, nextPlayer);
  nextPlayer = { ...nextPlayer, gold: nextPlayer.gold + gold };
  killLogs.push(`你获得了 ${gold} 枚金币。`);

  if (hasRelic(nextPlayer, 'crimson-heart')) {
    const heal = Math.floor(nextPlayer.maxHp * 0.15);
    nextPlayer = {
      ...nextPlayer,
      hp: Math.min(nextPlayer.maxHp, nextPlayer.hp + heal),
    };
    killLogs.push(`猩红心脏回复了 ${heal} 点生命值。`);
  }

  if (enemy.type === 'finalBoss') {
    const records = updateRecords(state.records, MAX_FLOOR, state.maxDamage, true);
    return {
      ...state,
      player: nextPlayer,
      enemy: { ...enemy, hp: 0 },
      kills,
      logs: addLogs(state.logs, [...killLogs, '最终首领倒下了。']),
      rewardChoices: [],
      shop: null,
      phase: 'cleared',
      records,
    };
  }

  const records = updateRecords(state.records, state.floor, state.maxDamage);
  return {
    ...state,
    player: nextPlayer,
    enemy: { ...enemy, hp: 0 },
    kills,
    logs: addLogs(state.logs, [...killLogs, '选择一项奖励继续前进。']),
    rewardChoices: generateRewards(nextPlayer, enemy.type),
    shop: null,
    phase: 'reward',
    records,
  };
}

export function playerAttack(state: GameState): GameState {
  if (state.phase !== 'battle') {
    return state;
  }

  const prepared = preparePlayerTurn(state);
  const result = calculatePlayerDamage(prepared.player);
  const dealt = dealDamageToEnemy(state.enemy, result.damage);
  const enemy = dealt.enemy;
  const maxDamage = Math.max(state.maxDamage, result.damage);
  const attackLogs = [...prepared.logs, ...result.logs, ...dealt.logs, `你造成了 ${result.damage} 点伤害。`];

  if (result.critical) {
    attackLogs.push('暴击。');
  }

  let player = {
    ...prepared.player,
    nextAttackBonus: 0,
  };
  const heal = Math.floor(result.damage * result.lifesteal);
  if (heal > 0) {
    player = { ...player, hp: Math.min(player.maxHp, player.hp + heal) };
    attackLogs.push(`你回复了 ${heal} 点生命值。`);
  }

  if (enemy.hp <= 0) {
    return handleVictory({ ...state, maxDamage }, player, enemy, attackLogs);
  }

  const counter = resolveEnemyAction(player, enemy);
  const logs = [...attackLogs, ...counter.logs];

  if (counter.enemyDefeated) {
    return handleVictory({ ...state, maxDamage }, counter.player, counter.enemy, logs);
  }

  if (counter.playerDefeated) {
    const records = updateRecords(state.records, state.floor, maxDamage);
    return {
      ...state,
      player: counter.player,
      enemy: counter.enemy,
      maxDamage,
      logs: addLogs(state.logs, [...logs, '你的生命值归零了。']),
      phase: 'defeated',
      records,
    };
  }

  const records = updateRecords(state.records, state.floor, maxDamage);
  return {
    ...state,
    player: counter.player,
    enemy: counter.enemy,
    maxDamage,
    logs: addLogs(state.logs, logs),
    turn: state.turn + 1,
    records,
  };
}

export function playerGuard(state: GameState): GameState {
  if (state.phase !== 'battle') {
    return state;
  }

  const prepared = preparePlayerTurn(state);
  const card = drawCard(prepared.player, 'guard');
  const logs = [...prepared.logs, `你打出了${card.kind}：${card.name}。`];
  let player = prepared.player;

  let blockGain = card.blockGain ?? 0;
  if ((state.enemy.intent.type === 'attack' || state.enemy.intent.type === 'heavy') && card.bonusBlockAgainstAttack) {
    blockGain += card.bonusBlockAgainstAttack;
  }

  if (blockGain > 0) {
    const blockResult = gainPlayerBlock(player, blockGain);
    player = blockResult.player;
    logs.push(`你获得了 ${blockResult.gained} 点护甲。`);
  }

  if (card.healOnGuard) {
    player = {
      ...player,
      hp: Math.min(player.maxHp, player.hp + card.healOnGuard),
    };
    logs.push(`${card.name} 回复了 ${card.healOnGuard} 点生命值。`);
  }

  if (card.retainHalfBlock) {
    player = {
      ...player,
      retainBlockNextTurn: true,
    };
    logs.push('你将在下回合保留一半护甲。');
  }

  const counter = resolveEnemyAction(player, state.enemy);
  const allLogs = [...logs, ...counter.logs];

  if (counter.enemyDefeated) {
    return handleVictory(state, counter.player, counter.enemy, allLogs);
  }

  if (counter.playerDefeated) {
    const records = updateRecords(state.records, state.floor, state.maxDamage);
    return {
      ...state,
      player: counter.player,
      enemy: counter.enemy,
      logs: addLogs(state.logs, [...allLogs, '你的生命值归零了。']),
      phase: 'defeated',
      records,
    };
  }

  return {
    ...state,
    player: counter.player,
    enemy: counter.enemy,
    logs: addLogs(state.logs, allLogs),
    turn: state.turn + 1,
  };
}

export function nextFloor(state: GameState, player: Player, rewardLogs: string[]): GameState {
  const next = state.floor + 1;
  const records = updateRecords(state.records, next, state.maxDamage);

  if (isShopFloor(next)) {
    return {
      ...state,
      player: {
        ...player,
        block: 0,
        retainBlockNextTurn: false,
        gainedBlockThisTurn: false,
        nextAttackBonus: 0,
      },
      floor: next,
      logs: addLogs(state.logs, [...rewardLogs, `你进入了第 ${next} 层商店。`]),
      rewardChoices: [],
      shop: generateShop(player),
      phase: 'shop',
      turn: 0,
      records,
    };
  }

  return {
    ...state,
    player: prepareBattlePlayer(player),
    enemy: generateEnemy(next),
    floor: next,
    logs: addLogs(state.logs, [...rewardLogs, `你进入了第 ${next} 层。`]),
    rewardChoices: [],
    shop: null,
    phase: 'battle',
    turn: 0,
    records,
  };
}

export function leaveShop(state: GameState): GameState {
  if (state.phase !== 'shop') {
    return state;
  }

  const next = state.floor + 1;
  const records = updateRecords(state.records, next, state.maxDamage);

  return {
    ...state,
    player: prepareBattlePlayer(state.player),
    enemy: generateEnemy(next),
    floor: next,
    logs: addLogs(state.logs, [`你离开商店，进入了第 ${next} 层。`]),
    shop: null,
    phase: 'battle',
    turn: 0,
    records,
  };
}

export function restartGame(records = loadRecords()): GameState {
  return createInitialGameState(records);
}

export function getBuildType(player: Player): string {
  if (player.def >= 15 || hasRelic(player, 'spike-armor') || hasRelic(player, 'iron-wall') || hasRelic(player, 'wall-core')) {
    return '护甲反击流';
  }

  if (player.critRate >= 0.35 || player.critDamage >= 3) {
    return '暴击流';
  }

  if (player.lifesteal >= 0.15 || hasRelic(player, 'blood-fang') || hasRelic(player, 'crimson-heart')) {
    return '吸血流';
  }

  return '均衡成长';
}

export function getEnemyTypeLabel(type: EnemyType): string {
  return enemyTypeLabel(type);
}
