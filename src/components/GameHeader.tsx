import type { GameState } from '../game/types';
import { getEnemyTypeLabel } from '../game/logic';

interface GameHeaderProps {
  state: GameState;
}

export function GameHeader({ state }: GameHeaderProps) {
  const currentType = state.phase === 'shop' ? '商店' : getEnemyTypeLabel(state.enemy.type);

  return (
    <header className="game-header panel">
      <div>
        <p className="kicker">独立前端小游戏</p>
        <h1>数值高塔</h1>
        <p className="subtitle">一个由纯粹数值构成的极简爬塔实验。</p>
        <p className="description">这是一个由攻击、防御、暴击、吸血和随机奖励构成的极简数值爬塔实验。</p>
      </div>

      <div className="progress-strip" aria-label="当前进度">
        <div>
          <span>当前层数</span>
          <strong>第 {state.floor} 层</strong>
        </div>
        <div>
          <span>敌人类型</span>
          <strong>{currentType}</strong>
        </div>
        <div>
          <span>历史最高层数</span>
          <strong>{state.records.bestFloor}</strong>
        </div>
        <div>
          <span>历史最高伤害</span>
          <strong>{state.records.bestDamage}</strong>
        </div>
        <div>
          <span>通关次数</span>
          <strong>{state.records.clearCount}</strong>
        </div>
      </div>
    </header>
  );
}
