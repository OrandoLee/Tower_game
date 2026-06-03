import type { CSSProperties, MouseEvent } from 'react';

export type ActionTargetType = 'enemy' | 'player';
export type ActionType = 'attack' | 'guard';

export interface ActionCardData {
  id: string;
  actionType: ActionType;
  targetType: ActionTargetType;
  title: string;
  typeLabel: string;
  description: string;
  cost: string;
  footer: string;
  tone: 'attack' | 'guard';
}

interface ActionCardProps {
  card: ActionCardData;
  disabled: boolean;
  selected: boolean;
  dimmed: boolean;
  played: boolean;
  index: number;
  total: number;
  onSelect: (card: ActionCardData) => void;
}

export function ActionCard({ card, disabled, selected, dimmed, played, index, total, onSelect }: ActionCardProps) {
  const spreadOffset = index - (total - 1) / 2;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (disabled) {
      return;
    }

    onSelect(card);
  }

  return (
    <button
      type="button"
      className={`action-card action-card-${card.tone}${selected ? ' action-card-selected' : ''}${dimmed ? ' action-card-dimmed' : ''}${played ? ' action-card-played' : ''}`}
      style={{ '--card-offset': spreadOffset } as CSSProperties}
      disabled={disabled}
      onClick={handleClick}
      aria-label={selected ? `取消选择${card.title}` : `选择${card.title}`}
      aria-pressed={selected}
      data-card-control="true"
    >
      <span className="action-card-cost">{card.cost}</span>
      <span className="action-card-type">{card.typeLabel}</span>
      <strong>{card.title}</strong>
      <small>{card.description}</small>
      <em>{card.footer}</em>
    </button>
  );
}
