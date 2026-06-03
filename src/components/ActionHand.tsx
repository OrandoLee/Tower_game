import type { GamePhase } from '../game/types';
import { ActionCard, type ActionCardData } from './ActionCard';
import type { CSSProperties } from 'react';

interface ActionHandProps {
  phase: GamePhase;
  onAttack: () => void;
  onGuard: () => void;
  onRestart: () => void;
}

const actionCards: ActionCardData[] = [
  {
    id: 'attack',
    title: '攻击',
    typeLabel: '攻击牌',
    description: '对敌人造成一次伤害。',
    cost: '1',
    footer: '基础行动',
    tone: 'attack',
  },
  {
    id: 'guard',
    title: '防御',
    typeLabel: '防御牌',
    description: '获得护甲，抵挡敌人的下一次行动伤害。',
    cost: '1',
    footer: '基础行动',
    tone: 'guard',
  },
];

function phaseLabel(phase: GamePhase): string {
  if (phase === 'battle') {
    return '选择一张行动牌';
  }

  if (phase === 'reward') {
    return '选择奖励后继续';
  }

  if (phase === 'shop') {
    return '商店中';
  }

  return '结算中';
}

export function ActionHand({ phase, onAttack, onGuard, onRestart }: ActionHandProps) {
  const canAct = phase === 'battle';

  return (
    <section className="panel action-hand" aria-label="底部手牌区">
      <div className="action-hand-header">
        <div>
          <p>当前手牌</p>
          <span>{phaseLabel(phase)}</span>
        </div>
        <button type="button" className="hand-restart-button" onClick={onRestart}>
          重新开始
        </button>
      </div>

      <div className="hand-stage">
        <div className="hand-card-row" style={{ '--hand-count': actionCards.length } as CSSProperties}>
          {actionCards.map((card, index) => (
            <ActionCard
              key={card.id}
              card={card}
              disabled={!canAct}
              index={index}
              total={actionCards.length}
              onPlay={card.id === 'attack' ? onAttack : onGuard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
