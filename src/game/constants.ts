import type { CardDefinition, Relic } from './types';

export const MAX_FLOOR = 30;
export const LOG_LIMIT = 8;
export const SHOP_FLOORS = [4, 9, 14, 19, 24, 29];
export const MIN_DECK_SIZE = 5;

export const ENEMY_NAMES = [
  '游荡者',
  '铁壳',
  '空洞体',
  '裂隙生物',
  '失控样本',
  '深层守卫',
  '灰质残影',
  '断层虫',
  '冷光体',
  '最终核心',
];

export const RELICS: Relic[] = [
  {
    id: 'glass-dagger',
    name: '玻璃匕首',
    description: '暴击伤害增加 50%。',
  },
  {
    id: 'blood-fang',
    name: '血牙',
    description: '吸血增加 10%。',
  },
  {
    id: 'iron-wall',
    name: '铁壁',
    description: '防御增加 5。',
  },
  {
    id: 'wall-core',
    name: '铁壁核心',
    description: '每场战斗开始时获得 6 点护甲。',
  },
  {
    id: 'rage-core',
    name: '狂怒核心',
    description: '生命值低于 30% 时，攻击变为 1.5 倍。',
  },
  {
    id: 'greedy-coin',
    name: '贪婪硬币',
    description: '金币奖励增加 50%。',
  },
  {
    id: 'spike-armor',
    name: '尖刺甲',
    description: '敌人攻击玩家时受到 3 点反伤。若玩家有护甲，反伤提高为 6 点。',
  },
  {
    id: 'guard-module',
    name: '守卫模块',
    description: '每回合第一次获得护甲时，额外获得 3 点护甲。',
  },
  {
    id: 'gray-amulet',
    name: '灰色护符',
    description: '每回合开始获得 2 点护甲。',
  },
  {
    id: 'stabilizer',
    name: '稳定器',
    description: '回合结束时保留 50% 当前护甲到下回合。',
  },
  {
    id: 'reactive-armor',
    name: '反应装甲',
    description: '每当护甲完全抵挡一次攻击，抽 1 张攻击牌，并转化为下一次攻击的蓄势伤害。',
  },
  {
    id: 'hunter-eye',
    name: '猎人之眼',
    description: '暴击率增加 15%。',
  },
  {
    id: 'crimson-heart',
    name: '猩红心脏',
    description: '每次击杀后回复 15% 最大生命值。',
  },
];

export const CARD_DEFINITIONS: CardDefinition[] = [
  {
    id: 'strike',
    name: '打击',
    kind: '攻击牌',
    cost: 1,
    description: '攻击时伤害增加 2。',
    rarity: '基础',
    attackBonus: 2,
  },
  {
    id: 'defend',
    name: '防御',
    kind: '防御牌',
    cost: 1,
    description: '获得 8 点护甲。',
    rarity: '基础',
    blockGain: 8,
  },
  {
    id: 'heavy-hit',
    name: '重击',
    kind: '攻击牌',
    cost: 1,
    description: '攻击时伤害增加 8。',
    rarity: '普通',
    attackBonus: 8,
  },
  {
    id: 'steady-cut',
    name: '稳定斩击',
    kind: '攻击牌',
    cost: 1,
    description: '攻击时暴击率增加 10%。',
    rarity: '普通',
    critRateBonus: 0.1,
  },
  {
    id: 'blood-cut',
    name: '回血刺',
    kind: '攻击牌',
    cost: 1,
    description: '攻击时伤害增加 4，临时吸血增加 8%。',
    rarity: '普通',
    attackBonus: 4,
    lifestealBonus: 0.08,
  },
  {
    id: 'iron-wall-card',
    name: '铁壁',
    kind: '防御牌',
    cost: 2,
    description: '获得 16 点护甲。',
    rarity: '普通',
    blockGain: 16,
  },
  {
    id: 'counter-guard',
    name: '反制',
    kind: '防御牌',
    cost: 1,
    description: '获得 6 点护甲。如果敌人意图是攻击或强击，额外获得 4 点护甲。',
    rarity: '普通',
    blockGain: 6,
    bonusBlockAgainstAttack: 4,
  },
  {
    id: 'reckoning',
    name: '清算',
    kind: '攻击牌',
    cost: 2,
    description: '造成等同于当前护甲数值的伤害。',
    rarity: '普通',
    damageFromBlock: true,
  },
  {
    id: 'steady',
    name: '稳固',
    kind: '技能牌',
    cost: 1,
    description: '本回合结束时，保留一半护甲到下回合。',
    rarity: '普通',
    retainHalfBlock: true,
  },
  {
    id: 'piercing-hit',
    name: '贯穿重击',
    kind: '攻击牌',
    cost: 2,
    description: '攻击时伤害增加 16。',
    rarity: '强力',
    attackBonus: 16,
  },
  {
    id: 'focus-burst',
    name: '集中爆发',
    kind: '攻击牌',
    cost: 2,
    description: '攻击时暴击率增加 12%，暴击伤害增加 50%。',
    rarity: '强力',
    critRateBonus: 0.12,
    critDamageBonus: 0.5,
  },
  {
    id: 'blood-edge',
    name: '血刃',
    kind: '攻击牌',
    cost: 2,
    description: '攻击时伤害增加 8，临时吸血增加 15%。',
    rarity: '强力',
    attackBonus: 8,
    lifestealBonus: 0.15,
  },
  {
    id: 'alloy-wall',
    name: '合金壁垒',
    kind: '防御牌',
    cost: 2,
    description: '获得 20 点护甲，并回复 5 点生命值。',
    rarity: '强力',
    blockGain: 20,
    healOnGuard: 5,
  },
];

export const STARTER_DECK_IDS = ['strike', 'strike', 'strike', 'defend', 'defend'];

export const ENEMY_TYPE_LABELS = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
  finalBoss: '最终首领',
} as const;
