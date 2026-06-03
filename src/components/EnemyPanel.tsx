import { formatHp } from '../game/format';
import { getEnemyTypeLabel } from '../game/logic';
import type { Enemy } from '../game/types';
import { StatItem } from './StatItem';

interface EnemyPanelProps {
  enemy: Enemy;
}

export function EnemyPanel({ enemy }: EnemyPanelProps) {
  return (
    <section className="panel enemy-panel">
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
      </div>
    </section>
  );
}
