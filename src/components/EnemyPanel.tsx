import { formatHp } from '../game/format';
import { getEnemyTypeLabel } from '../game/logic';
import type { Enemy } from '../game/types';
import { StatItem } from './StatItem';

interface EnemyPanelProps {
  enemy: Enemy;
  targetState: 'idle' | 'valid' | 'invalid';
  targetActive: boolean;
  onTargetClick: () => void;
}

export function EnemyPanel({ enemy, targetState, targetActive, onTargetClick }: EnemyPanelProps) {
  return (
    <section
      className={`panel enemy-panel target-zone target-zone-${targetState}${targetActive ? ' target-zone-armed' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        onTargetClick();
      }}
      role={targetActive ? 'button' : undefined}
      tabIndex={targetActive ? 0 : undefined}
      onKeyDown={(event) => {
        if (!targetActive) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onTargetClick();
        }
      }}
      aria-label="敌人目标区"
      data-target-area="enemy"
    >
      <div className="panel-title">
        <p>敌人面板</p>
        <span>{getEnemyTypeLabel(enemy.type)}</span>
      </div>

      <div className="enemy-name">
        <span>敌人名称</span>
        <strong>{enemy.name}</strong>
      </div>

      <div className="hp-block">
        <div>
          <span>生命值</span>
          <strong>{formatHp(enemy.hp, enemy.maxHp)}</strong>
        </div>
        <meter min="0" max={enemy.maxHp} value={Math.max(0, enemy.hp)} />
      </div>

      <div className="stat-grid compact">
        <StatItem label="类型" value={getEnemyTypeLabel(enemy.type)} />
        <StatItem label="攻击" value={enemy.atk} />
        <StatItem label="护甲" value={enemy.block} />
        <StatItem label="意图" value={enemy.intent.label} />
      </div>

      <div className="intent-box">
        <span>意图说明</span>
        <strong>{enemy.intent.label}</strong>
        <small>{enemy.intent.description}</small>
      </div>
    </section>
  );
}
