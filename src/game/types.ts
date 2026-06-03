export type EnemyType = 'normal' | 'elite' | 'boss' | 'finalBoss';

export type GamePhase = 'battle' | 'reward' | 'shop' | 'defeated' | 'cleared';

export type RewardType = 'stat' | 'relic';

export type RewardRarity = '常规' | '稀有';

export type CardRarity = '基础' | '普通' | '强力';

export type ShopServiceId = 'remove-card' | 'heal' | 'max-hp';

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
  deck: PlayerCard[];
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
  goldAmount?: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  attackBonus?: number;
  guardBonus?: number;
  critRateBonus?: number;
  critDamageBonus?: number;
  lifestealBonus?: number;
  healOnGuard?: number;
}

export interface PlayerCard extends CardDefinition {
  instanceId: string;
}

export interface ShopCardOffer {
  id: string;
  card: CardDefinition;
  price: number;
}

export interface ShopRelicOffer {
  id: string;
  relic: Relic;
  price: number;
}

export interface ShopState {
  cardOffers: ShopCardOffer[];
  relicOffers: ShopRelicOffer[];
  purchasedIds: string[];
  removingCard: boolean;
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
  shop: ShopState | null;
  phase: GamePhase;
  records: Records;
}

export interface DamageResult {
  damage: number;
  critical: boolean;
  card: PlayerCard;
  lifesteal: number;
}
