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
    description: '敌人攻击玩家后，受到玩家防御 * 2 的反伤。',
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
    description: '攻击时伤害增加 2。',
    rarity: '基础',
    attackBonus: 2,
  },
  {
    id: 'guard-step',
    name: '守势',
    description: '防御时额外减少 2 点伤害。',
    rarity: '基础',
    guardBonus: 2,
  },
  {
    id: 'heavy-hit',
    name: '重击',
    description: '攻击时伤害增加 8。',
    rarity: '普通',
    attackBonus: 8,
  },
  {
    id: 'steady-cut',
    name: '稳定斩击',
    description: '攻击时暴击率增加 10%。',
    rarity: '普通',
    critRateBonus: 0.1,
  },
  {
    id: 'blood-cut',
    name: '回血刺',
    description: '攻击时伤害增加 4，临时吸血增加 8%。',
    rarity: '普通',
    attackBonus: 4,
    lifestealBonus: 0.08,
  },
  {
    id: 'iron-guard',
    name: '铁壁姿态',
    description: '防御时额外减少 8 点伤害。',
    rarity: '普通',
    guardBonus: 8,
  },
  {
    id: 'piercing-hit',
    name: '贯穿重击',
    description: '攻击时伤害增加 16。',
    rarity: '强力',
    attackBonus: 16,
  },
  {
    id: 'focus-burst',
    name: '集中爆发',
    description: '攻击时暴击率增加 12%，暴击伤害增加 50%。',
    rarity: '强力',
    critRateBonus: 0.12,
    critDamageBonus: 0.5,
  },
  {
    id: 'blood-edge',
    name: '血刃',
    description: '攻击时伤害增加 8，临时吸血增加 15%。',
    rarity: '强力',
    attackBonus: 8,
    lifestealBonus: 0.15,
  },
  {
    id: 'alloy-wall',
    name: '合金壁垒',
    description: '防御时额外减少 14 点伤害，并回复 5 点生命值。',
    rarity: '强力',
    guardBonus: 14,
    healOnGuard: 5,
  },
];

export const STARTER_DECK_IDS = ['strike', 'strike', 'strike', 'guard-step', 'guard-step'];

export const ENEMY_TYPE_LABELS = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
  finalBoss: '最终首领',
} as const;
