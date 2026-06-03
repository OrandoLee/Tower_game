interface BattleLogProps {
  logs: string[];
  embedded?: boolean;
}

export function BattleLog({ logs, embedded = false }: BattleLogProps) {
  return (
    <section className={embedded ? 'embedded-panel log-panel' : 'panel log-panel'}>
      <div className="panel-title">
        <p>战斗日志</p>
        <span>最近记录</span>
      </div>

      <ol className="battle-log">
        {logs.map((log, index) => (
          <li key={`${log}-${index}`}>{log}</li>
        ))}
      </ol>
    </section>
  );
}
