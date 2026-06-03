import { CARD_DEFINITIONS, MIN_DECK_SIZE, RELICS } from './constants';
import { applyRelic } from './rewards';
import type { CardDefinition, GameState, Player, PlayerCard, ShopServiceId, ShopState } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function createPlayerCard(card: CardDefinition): PlayerCard {
  return {
    ...card,
    instanceId: `${card.id}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

export function createStarterDeck(): PlayerCard[] {
  const starterIds = ['strike', 'strike', 'strike', 'guard-step', 'guard-step'];

  return starterIds.map((id) => {
    const card = CARD_DEFINITIONS.find((item) => item.id === id);
    if (!card) {
      throw new Error(`缺少起始牌定义：${id}`);
    }

    return createPlayerCard(card);
  });
}

export function generateShop(player: Player): ShopState {
  const cardPool = CARD_DEFINITIONS.filter((card) => card.rarity !== '基础');
  const cardOffers = shuffle(cardPool)
    .slice(0, 3)
    .map((card) => ({
      id: `card-${card.id}`,
      card,
      price: card.rarity === '强力' ? randomInt(60, 85) : randomInt(35, 55),
    }));

  const availableRelics = RELICS.filter((relic) => !player.relics.some((owned) => owned.id === relic.id));
  const relicCount = Math.min(availableRelics.length, Math.random() < 0.55 ? 1 : 2);
  const relicOffers = shuffle(availableRelics)
    .slice(0, relicCount)
    .map((relic) => {
      const strongRelic = ['rage-core', 'greedy-coin', 'spike-armor', 'crimson-heart'].includes(relic.id);

      return {
        id: `relic-${relic.id}`,
        relic,
        price: strongRelic ? randomInt(150, 200) : randomInt(100, 140),
      };
    });

  return {
    cardOffers,
    relicOffers,
    purchasedIds: [],
    removingCard: false,
  };
}

function markPurchased(shop: ShopState, id: string): ShopState {
  return {
    ...shop,
    purchasedIds: [...shop.purchasedIds, id],
  };
}

export function buyShopCard(state: GameState, offerId: string): GameState {
  if (state.phase !== 'shop' || !state.shop || state.shop.purchasedIds.includes(offerId)) {
    return state;
  }

  const offer = state.shop.cardOffers.find((item) => item.id === offerId);
  if (!offer || state.player.gold < offer.price) {
    return state;
  }

  const player = {
    ...state.player,
    gold: state.player.gold - offer.price,
    deck: [...state.player.deck, createPlayerCard(offer.card)],
  };

  return {
    ...state,
    player,
    shop: markPurchased(state.shop, offerId),
    logs: [...state.logs, `你购买了卡牌：${offer.card.name}。`].slice(-8),
  };
}

export function buyShopRelic(state: GameState, offerId: string): GameState {
  if (state.phase !== 'shop' || !state.shop || state.shop.purchasedIds.includes(offerId)) {
    return state;
  }

  const offer = state.shop.relicOffers.find((item) => item.id === offerId);
  if (!offer || state.player.gold < offer.price || state.player.relics.some((relic) => relic.id === offer.relic.id)) {
    return state;
  }

  const player = applyRelic(
    {
      ...state.player,
      gold: state.player.gold - offer.price,
      relics: [...state.player.relics, offer.relic],
    },
    offer.relic.id,
  );

  return {
    ...state,
    player,
    shop: markPurchased(state.shop, offerId),
    logs: [...state.logs, `你购买了遗物：${offer.relic.name}。`].slice(-8),
  };
}

export function buyShopService(state: GameState, serviceId: ShopServiceId): GameState {
  if (state.phase !== 'shop' || !state.shop || state.shop.purchasedIds.includes(serviceId)) {
    return state;
  }

  if (serviceId === 'remove-card') {
    if (state.player.gold < 75 || state.player.deck.length <= MIN_DECK_SIZE) {
      return state;
    }

    return {
      ...state,
      shop: {
        ...state.shop,
        removingCard: true,
      },
      logs: [...state.logs, '选择一张牌删除。'].slice(-8),
    };
  }

  if (serviceId === 'heal') {
    if (state.player.gold < 50) {
      return state;
    }

    const heal = Math.floor(state.player.maxHp * 0.25);
    return {
      ...state,
      player: {
        ...state.player,
        gold: state.player.gold - 50,
        hp: Math.min(state.player.maxHp, state.player.hp + heal),
      },
      shop: markPurchased(state.shop, serviceId),
      logs: [...state.logs, `你购买了服务：回复生命，回复了 ${heal} 点生命值。`].slice(-8),
    };
  }

  if (serviceId === 'max-hp') {
    if (state.player.gold < 90) {
      return state;
    }

    return {
      ...state,
      player: {
        ...state.player,
        gold: state.player.gold - 90,
        maxHp: state.player.maxHp + 8,
        hp: Math.min(state.player.maxHp + 8, state.player.hp + 8),
      },
      shop: markPurchased(state.shop, serviceId),
      logs: [...state.logs, '你购买了服务：最大生命值 +8。'].slice(-8),
    };
  }

  return state;
}

export function removeShopCard(state: GameState, instanceId: string): GameState {
  if (
    state.phase !== 'shop' ||
    !state.shop ||
    !state.shop.removingCard ||
    state.player.gold < 75 ||
    state.player.deck.length <= MIN_DECK_SIZE
  ) {
    return state;
  }

  const removed = state.player.deck.find((card) => card.instanceId === instanceId);
  if (!removed) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - 75,
      deck: state.player.deck.filter((card) => card.instanceId !== instanceId),
    },
    shop: markPurchased(
      {
        ...state.shop,
        removingCard: false,
      },
      'remove-card',
    ),
    logs: [...state.logs, `你删除了一张牌：${removed.name}。`].slice(-8),
  };
}

export function cancelRemoveCard(state: GameState): GameState {
  if (state.phase !== 'shop' || !state.shop) {
    return state;
  }

  return {
    ...state,
    shop: {
      ...state.shop,
      removingCard: false,
    },
  };
}
