import type { PlayerCard } from '../game/types';

interface DeckListProps {
  deck: PlayerCard[];
}

export function DeckList({ deck }: DeckListProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <p>牌组</p>
        <span>{deck.length} 张</span>
      </div>

      <div className="deck-list">
        {deck.map((card) => (
          <article className="deck-card" key={card.instanceId}>
            <strong>{card.name}</strong>
            <span>{card.rarity}</span>
            <small>{card.description}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
