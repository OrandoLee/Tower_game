export type EnemyType = 'normal' | 'elite' | 'boss' | 'finalBoss';

export type GamePhase = 'battle' | 'reward' | 'defeated' | 'cleared';

export type RewardType = 'stat' | 'relic';

export type RewardRarity = '常规' | '稀有';

export interface Relic {
  id: string;
  name: string;
  description: string;
}

export interface Player {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  critRate: number;
  critDamage: number;
  lifesteal: number;
  gold: number;
  relics: Relic[];
}

export interface Enemy {
  name: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  atk: number;
  floor: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  type: RewardType;
  rarity: RewardRarity;
  relicId?: string;
}

export interface Records {
  bestFloor: number;
  bestDamage: number;
  clearCount: number;
}

export interface GameState {
  player: Player;
  enemy: Enemy;
  floor: number;
  kills: number;
  maxDamage: number;
  logs: string[];
  rewardChoices: Reward[];
  phase: GamePhase;
  records: Records;
}

export interface DamageResult {
  damage: number;
  critical: boolean;
}
