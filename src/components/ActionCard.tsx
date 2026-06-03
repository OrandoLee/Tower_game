import { useState } from 'react';
import type { CSSProperties } from 'react';

export interface ActionCardData {
  id: string;
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
  index: number;
  total: number;
  onPlay: () => void;
}

export function ActionCard({ card, disabled, index, total, onPlay }: ActionCardProps) {
  const [played, setPlayed] = useState(false);
  const spreadOffset = index - (total - 1) / 2;

  function handleClick() {
    if (disabled) {
      return;
    }

    setPlayed(true);
    window.setTimeout(() => setPlayed(false), 160);
    onPlay();
  }

  return (
    <button
      type="button"
      className={`action-card action-card-${card.tone}${played ? ' action-card-played' : ''}`}
      style={{ '--card-offset': spreadOffset } as CSSProperties}
      disabled={disabled}
      onClick={handleClick}
      aria-label={`打出${card.title}`}
    >
      <span className="action-card-cost">{card.cost}</span>
      <span className="action-card-type">{card.typeLabel}</span>
      <strong>{card.title}</strong>
      <small>{card.description}</small>
      <em>{card.footer}</em>
    </button>
  );
}
