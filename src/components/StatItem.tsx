interface StatItemProps {
  label: string;
  value: string | number;
}

export function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="stat-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
