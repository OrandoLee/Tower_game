import type { PlayerCard } from '../game/types';

interface DeckListProps {
  deck: PlayerCard[];
  embedded?: boolean;
}

export function DeckList({ deck, embedded = false }: DeckListProps) {
  return (
    <section className={embedded ? 'embedded-panel' : 'panel'}>
      <div className="panel-title">
        <p>牌组</p>
        <span>{deck.length} 张</span>
      </div>

      <div className="deck-list">
        {deck.map((card) => (
          <article className="deck-card" key={card.instanceId}>
            <strong>{card.name}</strong>
            <span>{card.kind} / 费用 {card.cost}</span>
            <small>{card.description}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
