import { MIN_DECK_SIZE } from '../game/constants';
import type { Player, PlayerCard, ShopServiceId, ShopState } from '../game/types';

interface ShopPanelProps {
  player: Player;
  shop: ShopState | null;
  onBuyCard: (offerId: string) => void;
  onBuyRelic: (offerId: string) => void;
  onBuyService: (serviceId: ShopServiceId) => void;
  onRemoveCard: (instanceId: string) => void;
  onCancelRemoveCard: () => void;
  onLeave: () => void;
}

const services: Array<{
  id: ShopServiceId;
  title: string;
  price: number;
  description: string;
}> = [
  {
    id: 'remove-card',
    title: '删除一张牌',
    price: 75,
    description: '从牌组中选择一张牌移除。牌组不能少于 5 张。',
  },
  {
    id: 'heal',
    title: '回复生命',
    price: 50,
    description: '回复 25% 最大生命值。',
  },
  {
    id: 'max-hp',
    title: '最大生命值 +8',
    price: 90,
    description: '最大生命值增加 8，并回复 8 点生命值。',
  },
];

function priceText(price: number): string {
  return `${price} 金币`;
}

function cardLabel(card: PlayerCard): string {
  return `${card.name}（${card.rarity}）`;
}

export function ShopPanel({
  player,
  shop,
  onBuyCard,
  onBuyRelic,
  onBuyService,
  onRemoveCard,
  onCancelRemoveCard,
  onLeave,
}: ShopPanelProps) {
  if (!shop) {
    return null;
  }

  return (
    <section className="panel shop-panel">
      <div className="panel-title">
        <p>商店</p>
        <span>当前金币：{player.gold}</span>
      </div>

      {shop.removingCard && (
        <div className="remove-card-box">
          <div className="panel-title inline-title">
            <p>选择要删除的卡牌</p>
            <span>删除价格：75 金币</span>
          </div>
          <div className="remove-card-grid">
            {player.deck.map((card) => (
              <button type="button" key={card.instanceId} onClick={() => onRemoveCard(card.instanceId)}>
                <strong>{cardLabel(card)}</strong>
                <small>{card.description}</small>
              </button>
            ))}
          </div>
          <button type="button" className="shop-leave-button" onClick={onCancelRemoveCard}>
            取消删除
          </button>
        </div>
      )}

      <div className="shop-section">
        <h2>卡牌商品区</h2>
        <div className="shop-grid">
          {shop.cardOffers.map((offer) => {
            const purchased = shop.purchasedIds.includes(offer.id);
            const disabled = purchased || player.gold < offer.price;

            return (
              <article className="shop-card" key={offer.id}>
                <span>{offer.card.rarity}</span>
                <strong>{offer.card.name}</strong>
                <small>{offer.card.description}</small>
                <button type="button" disabled={disabled} onClick={() => onBuyCard(offer.id)}>
                  {purchased ? '已购买' : `购买：${priceText(offer.price)}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="shop-section">
        <h2>遗物商品区</h2>
        {shop.relicOffers.length === 0 ? (
          <p className="empty-text">暂无可购买遗物。</p>
        ) : (
          <div className="shop-grid">
            {shop.relicOffers.map((offer) => {
              const purchased = shop.purchasedIds.includes(offer.id);
              const disabled = purchased || player.gold < offer.price;

              return (
                <article className="shop-card" key={offer.id}>
                  <span>遗物</span>
                  <strong>{offer.relic.name}</strong>
                  <small>{offer.relic.description}</small>
                  <button type="button" disabled={disabled} onClick={() => onBuyRelic(offer.id)}>
                    {purchased ? '已购买' : `购买：${priceText(offer.price)}`}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="shop-section">
        <h2>服务区</h2>
        <div className="shop-grid">
          {services.map((service) => {
            const purchased = shop.purchasedIds.includes(service.id);
            const cannotRemove = service.id === 'remove-card' && player.deck.length <= MIN_DECK_SIZE;
            const disabled = purchased || cannotRemove || player.gold < service.price;

            return (
              <article className="shop-card" key={service.id}>
                <span>服务</span>
                <strong>{service.title}</strong>
                <small>{service.description}</small>
                <button type="button" disabled={disabled} onClick={() => onBuyService(service.id)}>
                  {purchased ? '已购买' : `购买：${priceText(service.price)}`}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <button type="button" className="shop-leave-button" onClick={onLeave}>
        离开商店
      </button>
    </section>
  );
}
