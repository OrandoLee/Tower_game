import type { Records } from '../game/types';

interface StartMenuProps {
  records: Records;
  onStart: () => void;
}

const GRID_TILES = [
  { x: 1, y: 1, delay: '0s' },
  { x: 3, y: 2, delay: '-1.8s' },
  { x: 5, y: 1, delay: '-3.2s' },
  { x: 2, y: 4, delay: '-4.6s' },
  { x: 4, y: 5, delay: '-2.4s' },
  { x: 6, y: 4, delay: '-5.1s' },
  { x: 1, y: 7, delay: '-3.8s' },
  { x: 5, y: 7, delay: '-0.9s' },
];

export function StartMenu({ records, onStart }: StartMenuProps) {
  return (
    <main className="start-menu">
      <div className="start-menu-glow" aria-hidden="true" />
      <div className="start-grid" aria-hidden="true">
        {GRID_TILES.map((tile, index) => (
          <span
            className="start-grid-tile"
            key={`${tile.x}-${tile.y}`}
            style={{
              '--tile-x': tile.x,
              '--tile-y': tile.y,
              '--tile-delay': tile.delay,
            } as React.CSSProperties}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        ))}
      </div>

      <section className="start-menu-content">
        <header className="start-menu-heading">
          <p className="start-menu-kicker">
            <span>ORANDO LAB</span>
            <span>呈现</span>
          </p>
          <h1 className="start-menu-title">
            <span>NUMERIC</span>
            <span>TOWER</span>
          </h1>
          <p className="start-menu-lab">LAB-02</p>
          <p className="start-menu-subtitle">数值高塔构筑实验</p>
        </header>

        <div className="start-menu-command">
          <div className="start-command-copy">
            <p>登塔指令</p>
            <strong>构筑卡组，校准数值，突破三十层防线。</strong>
          </div>

          <dl className="start-records" aria-label="历史记录">
            <div>
              <dt>最高层数</dt>
              <dd>{String(records.bestFloor).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>最高伤害</dt>
              <dd>{String(records.bestDamage).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>通关次数</dt>
              <dd>{String(records.clearCount).padStart(2, '0')}</dd>
            </div>
          </dl>

          <button className="start-command-button" type="button" onClick={onStart}>
            <span>开始登塔</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <footer className="start-menu-footer" aria-hidden="true">
        <span>NT / BUILD 0.2</span>
        <span>30F ASCENSION PROTOCOL</span>
      </footer>
    </main>
  );
}
