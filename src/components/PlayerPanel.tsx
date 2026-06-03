import { formatHp, formatPercent } from '../game/format';
import type { Player } from '../game/types';
import { StatItem } from './StatItem';

interface PlayerPanelProps {
  player: Player;
  floor: number;
}

export function PlayerPanel({ player, floor }: PlayerPanelProps) {
  return (
    <section className="panel">
      <div className="panel-title">
        <p>玩家面板</p>
        <span>局内属性</span>
      </div>

      <div className="hp-block">
        <div>
          <span>生命值</span>
          <strong>{formatHp(player.hp, player.maxHp)}</strong>
        </div>
        <meter min="0" max={player.maxHp} value={Math.max(0, player.hp)} />
      </div>

      <div className="stat-grid">
        <StatItem label="攻击" value={player.atk} />
        <StatItem label="防御" value={player.def} />
        <StatItem label="护甲" value={player.block} />
        <StatItem label="暴击率" value={formatPercent(player.critRate)} />
        <StatItem label="暴击伤害" value={formatPercent(player.critDamage)} />
        <StatItem label="吸血" value={formatPercent(player.lifesteal)} />
        <StatItem label="金币" value={player.gold} />
        <StatItem label="牌组数量" value={`${player.deck.length} 张`} />
        <StatItem label="蓄势伤害" value={player.nextAttackBonus} />
        <StatItem label="当前层数" value={`第 ${floor} 层`} />
      </div>
    </section>
  );
}
