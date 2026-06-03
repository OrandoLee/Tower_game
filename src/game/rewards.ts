import { RELICS } from './constants';
import type { Player, Reward } from './types';

type StatRewardTemplate = Omit<Reward, 'id'> & {
  key: string;
};

const STAT_REWARDS: StatRewardTemplate[] = [
  {
    key: 'atk-plus',
    title: '攻击 +3',
    description: '攻击增加 3。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'max-hp-plus',
    title: '最大生命值 +10',
    description: '最大生命值增加 10，并回复 10 点生命值。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'def-plus',
    title: '防御 +2',
    description: '防御增加 2。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'crit-rate-plus',
    title: '暴击率 +5%',
    description: '暴击率增加 5%。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'crit-damage-plus',
    title: '暴击伤害 +25%',
    description: '暴击伤害增加 25%。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'lifesteal-plus',
    title: '吸血 +5%',
    description: '吸血增加 5%。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'gold-plus',
    title: '金币 +15',
    description: '立即获得 15 金币。若拥有贪婪硬币，金币收益增加 50%。',
    type: 'stat',
    rarity: '常规',
  },
  {
    key: 'heal',
    title: '回复生命',
    description: '回复 20% 最大生命值。',
    type: 'stat',
    rarity: '常规',
  },
];

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createStatReward(template: StatRewardTemplate): Reward {
  return {
    id: template.key,
    title: template.title,
    description: template.description,
    type: template.type,
    rarity: template.rarity,
  };
}

export function generateRewards(player: Player, enemyType: string): Reward[] {
  const choices: Reward[] = [];
  const usedIds = new Set<string>();
  const availableRelics = RELICS.filter(
    (relic) => !player.relics.some((owned) => owned.id === relic.id),
  );
  const relicChance = enemyType === 'normal' ? 0.24 : 0.48;

  while (choices.length < 3) {
    const shouldUseRelic =
      availableRelics.length > 0 && Math.random() < relicChance && choices.some((reward) => reward.type === 'stat');

    if (shouldUseRelic) {
      const relic = pickOne(availableRelics.filter((item) => !usedIds.has(`relic-${item.id}`)));
      if (relic) {
        const reward: Reward = {
          id: `relic-${relic.id}`,
          title: `遗物：${relic.name}`,
          description: relic.description,
          type: 'relic',
          rarity: '稀有',
          relicId: relic.id,
        };
        choices.push(reward);
        usedIds.add(reward.id);
        continue;
      }
    }

    const stat = pickOne(STAT_REWARDS.filter((reward) => !usedIds.has(reward.key)));
    const reward = createStatReward(stat);
    choices.push(reward);
    usedIds.add(reward.id);
  }

  return choices;
}

export function applyReward(player: Player, reward: Reward): { player: Player; logs: string[] } {
  const logs: string[] = [`你选择了奖励：${reward.title}。`];

  if (reward.type === 'relic') {
    const relic = RELICS.find((item) => item.id === reward.relicId);
    if (!relic || player.relics.some((owned) => owned.id === relic.id)) {
      return { player, logs };
    }

    const updated = applyRelic({ ...player, relics: [...player.relics, relic] }, relic.id);
    logs.push(`你获得了遗物：${relic.name}。`);
    return { player: updated, logs };
  }

  switch (reward.id) {
    case 'atk-plus':
      return { player: { ...player, atk: player.atk + 3 }, logs };
    case 'max-hp-plus':
      return {
        player: {
          ...player,
          maxHp: player.maxHp + 10,
          hp: Math.min(player.maxHp + 10, player.hp + 10),
        },
        logs,
      };
    case 'def-plus':
      return { player: { ...player, def: player.def + 2 }, logs };
    case 'crit-rate-plus':
      return { player: { ...player, critRate: player.critRate + 0.05 }, logs };
    case 'crit-damage-plus':
      return { player: { ...player, critDamage: player.critDamage + 0.25 }, logs };
    case 'lifesteal-plus':
      return { player: { ...player, lifesteal: player.lifesteal + 0.05 }, logs };
    case 'gold-plus': {
      const gained = player.relics.some((relic) => relic.id === 'greedy-coin') ? 23 : 15;
      logs.push(`你获得了 ${gained} 枚金币。`);
      return { player: { ...player, gold: player.gold + gained }, logs };
    }
    case 'heal': {
      const heal = Math.floor(player.maxHp * 0.2);
      logs.push(`你回复了 ${heal} 点生命值。`);
      return { player: { ...player, hp: Math.min(player.maxHp, player.hp + heal) }, logs };
    }
    default:
      return { player, logs };
  }
}

export function applyRelic(player: Player, relicId: string): Player {
  switch (relicId) {
    case 'glass-dagger':
      return { ...player, critDamage: player.critDamage + 0.5 };
    case 'blood-fang':
      return { ...player, lifesteal: player.lifesteal + 0.1 };
    case 'iron-wall':
      return { ...player, def: player.def + 5 };
    case 'hunter-eye':
      return { ...player, critRate: player.critRate + 0.15 };
    default:
      return player;
  }
}
