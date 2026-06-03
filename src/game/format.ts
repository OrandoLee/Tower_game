export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatHp(current: number, max: number): string {
  return `${Math.max(0, Math.floor(current))} / ${Math.max(0, Math.floor(max))}`;
}
