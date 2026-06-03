import type { Relic } from '../game/types';

interface RelicListProps {
  relics: Relic[];
  embedded?: boolean;
}

export function RelicList({ relics, embedded = false }: RelicListProps) {
  return (
    <section className={embedded ? 'embedded-panel' : 'panel'}>
      <div className="panel-title">
        <p>遗物列表</p>
        <span>{relics.length} 件</span>
      </div>

      {relics.length === 0 ? (
        <p className="empty-text">尚未获得遗物。</p>
      ) : (
        <div className="relic-list">
          {relics.map((relic) => (
            <article className="relic-item" key={relic.id}>
              <strong>{relic.name}</strong>
              <span>{relic.description}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
