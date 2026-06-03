import { formatHp, formatPercent } from '../game/format';
import type { Player } from '../game/types';
import { StatItem } from './StatItem';

interface PlayerPanelProps {
  player: Player;
  floor: number;
  turn: number;
  targetState: 'idle' | 'valid' | 'invalid';
  targetActive: boolean;
  onTargetClick: () => void;
}

export function PlayerPanel({ player, floor, turn, targetState, targetActive, onTargetClick }: PlayerPanelProps) {
  return (
    <section
      className={`panel target-zone target-zone-${targetState}${targetActive ? ' target-zone-armed' : ''}`}
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
      aria-label="玩家目标区"
      data-target-area="player"
    >
      <div className="panel-title">
        <p>玩家面板</p>
        <span>局内属性</span>
      </div>

      <div className="player-quick-status" aria-label="玩家简要状态">
        <div className="quick-hp">
          <span>生命值</span>
          <strong>{formatHp(player.hp, player.maxHp)}</strong>
        </div>
        <div>
          <span>护甲</span>
          <strong>{player.block}</strong>
        </div>
        <div>
          <span>能量</span>
          <strong>1 / 1</strong>
        </div>
        <div className="quick-deck-state">
          <span>牌堆</span>
          <strong>抽牌 {player.deck.length}｜弃牌 {turn}</strong>
        </div>
      </div>

      <div className="hp-block player-full-stats">
        <div>
          <span>生命值</span>
          <strong>{formatHp(player.hp, player.maxHp)}</strong>
        </div>
        <meter min="0" max={player.maxHp} value={Math.max(0, player.hp)} />
      </div>

      <div className="stat-grid player-full-stats">
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
