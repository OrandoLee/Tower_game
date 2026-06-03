import type { GamePhase } from '../game/types';

interface ActionPanelProps {
  phase: GamePhase;
  onAttack: () => void;
  onGuard: () => void;
  onRestart: () => void;
}

export function ActionPanel({ phase, onAttack, onGuard, onRestart }: ActionPanelProps) {
  const canAct = phase === 'battle';

  return (
    <section className="panel action-panel">
      <div className="panel-title">
        <p>操作区</p>
        <span>{canAct ? '战斗中' : phase === 'reward' ? '选择奖励' : '结算'}</span>
      </div>

      <div className="action-buttons">
        <button type="button" onClick={onAttack} disabled={!canAct}>
          攻击
        </button>
        <button type="button" onClick={onGuard} disabled={!canAct}>
          防御
        </button>
        <button type="button" className="secondary-button" onClick={onRestart}>
          重新开始
        </button>
      </div>
    </section>
  );
}
