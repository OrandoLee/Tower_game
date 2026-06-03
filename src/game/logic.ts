import { ENEMY_NAMES, ENEMY_TYPE_LABELS, LOG_LIMIT, MAX_FLOOR, SHOP_FLOORS } from './constants';
import { generateRewards } from './rewards';
import { createStarterDeck, generateShop } from './shop';
import { loadRecords, saveRecords } from './storage';
import type { DamageResult, Enemy, EnemyType, GameState, Player, PlayerCard, Records } from './types';

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

function drawCard(player: Player): PlayerCard {
  return player.deck[Math.floor(Math.random() * player.deck.length)];
}

function isShopFloor(floor: number): boolean {
  return SHOP_FLOORS.includes(floor);
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

export function createInitialPlayer(): Player {
  return {
    hp: 100,
    maxHp: 100,
    atk: 12,
    def: 3,
    critRate: 0.1,
    critDamage: 2,
    lifesteal: 0,
    gold: 0,
    relics: [],
    deck: createStarterDeck(),
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

  return {
    name,
    type,
    hp: Math.floor(baseHp * hpMultiplier),
    maxHp: Math.floor(baseHp * hpMultiplier),
    atk: Math.floor(baseAtk * atkMultiplier),
    floor,
  };
}

export function createInitialGameState(records = loadRecords()): GameState {
  return {
    player: createInitialPlayer(),
    enemy: generateEnemy(1),
    floor: 1,
    kills: 0,
    maxDamage: 0,
    logs: ['你进入了第 1 层。'],
    rewardChoices: [],
    shop: null,
    phase: 'battle',
    records: updateRecords(records, 1, 0),
  };
}

export function calculatePlayerDamage(player: Player): DamageResult {
  const card = drawCard(player);
  const lowHpRage = hasRelic(player, 'rage-core') && player.hp / player.maxHp < 0.3;
  const effectiveAtk = (lowHpRage ? player.atk * 1.5 : player.atk) + (card.attackBonus ?? 0);
  let damage = Math.max(1, Math.floor(effectiveAtk * randomBetween(0.85, 1.15)));
  const critRate = player.critRate + (card.critRateBonus ?? 0);
  const critDamage = player.critDamage + (card.critDamageBonus ?? 0);
  const critical = Math.random() < critRate;

  if (critical) {
    damage = Math.floor(damage * critDamage);
  }

  return {
    damage,
    critical,
    card,
    lifesteal: player.lifesteal + (card.lifestealBonus ?? 0),
  };
}

export function calculateEnemyDamage(enemy: Enemy, player: Player, guarded = false, card?: PlayerCard): number {
  const cardGuard = guarded ? (card?.guardBonus ?? 0) : 0;
  const baseDamage = Math.max(1, Math.floor(enemy.atk - player.def - cardGuard));
  return guarded ? Math.max(1, Math.floor(baseDamage * 0.5)) : baseDamage;
}

export function applyEnemyAttack(
  player: Player,
  enemy: Enemy,
  guarded = false,
  card?: PlayerCard,
): { player: Player; enemy: Enemy; logs: string[]; playerDefeated: boolean; enemyDefeated: boolean } {
  const damage = calculateEnemyDamage(enemy, player, guarded, card);
  let nextPlayer = {
    ...player,
    hp: clampHp(player.hp - damage, player.maxHp),
  };
  const logs = [`敌人造成了 ${damage} 点伤害。`];

  if (guarded && card?.healOnGuard) {
    nextPlayer = {
      ...nextPlayer,
      hp: Math.min(nextPlayer.maxHp, nextPlayer.hp + card.healOnGuard),
    };
    logs.push(`${card.name} 回复了 ${card.healOnGuard} 点生命值。`);
  }

  if (hasRelic(player, 'spike-armor')) {
    const reflected = player.def * 2;
    const nextEnemy = {
      ...enemy,
      hp: clampHp(enemy.hp - reflected, enemy.maxHp),
    };
    logs.push(`尖刺甲反弹了 ${reflected} 点伤害。`);
    return {
      player: nextPlayer,
      enemy: nextEnemy,
      logs,
      playerDefeated: nextPlayer.hp <= 0,
      enemyDefeated: nextEnemy.hp <= 0,
    };
  }

  return {
    player: nextPlayer,
    enemy,
    logs,
    playerDefeated: nextPlayer.hp <= 0,
    enemyDefeated: enemy.hp <= 0,
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

  const result = calculatePlayerDamage(state.player);
  const enemy = {
    ...state.enemy,
    hp: clampHp(state.enemy.hp - result.damage, state.enemy.maxHp),
  };
  const maxDamage = Math.max(state.maxDamage, result.damage);
  const attackLogs = [`你抽到了卡牌：${result.card.name}。`, `你造成了 ${result.damage} 点伤害。`];

  if (result.critical) {
    attackLogs.push('暴击。');
  }

  let player = state.player;
  const heal = Math.floor(result.damage * result.lifesteal);
  if (heal > 0) {
    player = { ...player, hp: Math.min(player.maxHp, player.hp + heal) };
    attackLogs.push(`你回复了 ${heal} 点生命值。`);
  }

  if (enemy.hp <= 0) {
    return handleVictory({ ...state, maxDamage }, player, enemy, attackLogs);
  }

  const counter = applyEnemyAttack(player, enemy);
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
    records,
  };
}

export function playerGuard(state: GameState): GameState {
  if (state.phase !== 'battle') {
    return state;
  }

  const card = drawCard(state.player);
  const counter = applyEnemyAttack(state.player, state.enemy, true, card);
  const logs = [`你抽到了卡牌：${card.name}。`, '你进入防御姿态。', ...counter.logs];

  if (counter.enemyDefeated) {
    return handleVictory(state, counter.player, counter.enemy, logs);
  }

  if (counter.playerDefeated) {
    const records = updateRecords(state.records, state.floor, state.maxDamage);
    return {
      ...state,
      player: counter.player,
      enemy: counter.enemy,
      logs: addLogs(state.logs, [...logs, '你的生命值归零了。']),
      phase: 'defeated',
      records,
    };
  }

  return {
    ...state,
    player: counter.player,
    enemy: counter.enemy,
    logs: addLogs(state.logs, logs),
  };
}

export function nextFloor(state: GameState, player: Player, rewardLogs: string[]): GameState {
  const next = state.floor + 1;
  const records = updateRecords(state.records, next, state.maxDamage);

  if (isShopFloor(next)) {
    return {
      ...state,
      player,
      floor: next,
      logs: addLogs(state.logs, [...rewardLogs, `你进入了第 ${next} 层商店。`]),
      rewardChoices: [],
      shop: generateShop(player),
      phase: 'shop',
      records,
    };
  }

  return {
    ...state,
    player,
    enemy: generateEnemy(next),
    floor: next,
    logs: addLogs(state.logs, [...rewardLogs, `你进入了第 ${next} 层。`]),
    rewardChoices: [],
    shop: null,
    phase: 'battle',
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
    enemy: generateEnemy(next),
    floor: next,
    logs: addLogs(state.logs, [`你离开商店，进入了第 ${next} 层。`]),
    shop: null,
    phase: 'battle',
    records,
  };
}

export function restartGame(records = loadRecords()): GameState {
  return createInitialGameState(records);
}

export function getBuildType(player: Player): string {
  if (player.critRate >= 0.35 || player.critDamage >= 3) {
    return '暴击流';
  }

  if (player.lifesteal >= 0.15 || hasRelic(player, 'blood-fang') || hasRelic(player, 'crimson-heart')) {
    return '吸血流';
  }

  if (player.def >= 15 || hasRelic(player, 'spike-armor') || hasRelic(player, 'iron-wall')) {
    return '护甲反伤流';
  }

  return '均衡成长';
}

export function getEnemyTypeLabel(type: EnemyType): string {
  return enemyTypeLabel(type);
}
