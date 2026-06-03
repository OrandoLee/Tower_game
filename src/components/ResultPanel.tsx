import { formatHp, formatPercent } from '../game/format';
import { getBuildType } from '../game/logic';
import type { GameState } from '../game/types';
import { StatItem } from './StatItem';

interface ResultPanelProps {
  state: GameState;
  onRestart: () => void;
}

export function ResultPanel({ state, onRestart }: ResultPanelProps) {
  if (state.phase !== 'defeated' && state.phase !== 'cleared') {
    return null;
  }

  const cleared = state.phase === 'cleared';
  const relicNames = state.player.relics.map((relic) => relic.name).join('、') || '无';

  return (
    <section className="panel result-panel" aria-live="polite">
      <div className="panel-title">
        <p>{cleared ? '通关' : '挑战失败'}</p>
        <span>结算</span>
      </div>

      <div className="result-grid">
        <StatItem label={cleared ? '最终层数' : '到达层数'} value={`第 ${state.floor} 层`} />
        <StatItem label="击杀数" value={state.kills} />
        <StatItem label="最高单次伤害" value={state.maxDamage} />
        <StatItem label="最终构筑判断" value={getBuildType(state.player)} />
        <StatItem label="获得遗物" value={relicNames} />
      </div>

      {cleared && (
        <div className="result-stats">
          <StatItem label="生命值" value={formatHp(state.player.hp, state.player.maxHp)} />
          <StatItem label="攻击" value={state.player.atk} />
          <StatItem label="防御" value={state.player.def} />
          <StatItem label="暴击率" value={formatPercent(state.player.critRate)} />
          <StatItem label="暴击伤害" value={formatPercent(state.player.critDamage)} />
          <StatItem label="吸血" value={formatPercent(state.player.lifesteal)} />
        </div>
      )}

      <button type="button" className="result-restart" onClick={onRestart}>
        重新开始
      </button>
    </section>
  );
}
