import type { GamePhase } from '../game/types';
import { ActionCard, type ActionCardData } from './ActionCard';
import type { CSSProperties } from 'react';

interface ActionHandProps {
  phase: GamePhase;
  selectedCardId: string | null;
  playedCardId: string | null;
  message: string;
  onSelectCard: (card: ActionCardData) => void;
}

const actionCards: ActionCardData[] = [
  {
    id: 'attack',
    actionType: 'attack',
    targetType: 'enemy',
    title: '攻击',
    typeLabel: '攻击牌',
    description: '对敌人造成一次伤害。',
    cost: '1',
    footer: '基础行动',
    tone: 'attack',
  },
  {
    id: 'guard',
    actionType: 'guard',
    targetType: 'player',
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

export function ActionHand({ phase, selectedCardId, playedCardId, message, onSelectCard }: ActionHandProps) {
  const canAct = phase === 'battle';

  return (
    <section className="panel action-hand" aria-label="底部手牌区">
      <div className="action-hand-header">
        <div>
          <p>当前手牌</p>
          <span>{message || phaseLabel(phase)}</span>
        </div>
      </div>

      <div className="hand-stage">
        <div className="hand-card-row" style={{ '--hand-count': actionCards.length } as CSSProperties}>
          {actionCards.map((card, index) => (
            <ActionCard
              key={card.id}
              card={card}
              disabled={!canAct}
              selected={selectedCardId === card.id}
              dimmed={selectedCardId !== null && selectedCardId !== card.id}
              played={playedCardId === card.id}
              index={index}
              total={actionCards.length}
              onSelect={onSelectCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
