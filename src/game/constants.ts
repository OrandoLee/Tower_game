import type { Relic } from './types';

export const MAX_FLOOR = 30;
export const LOG_LIMIT = 8;

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

export const ENEMY_TYPE_LABELS = {
  normal: '普通',
  elite: '精英',
  boss: '首领',
  finalBoss: '最终首领',
} as const;
