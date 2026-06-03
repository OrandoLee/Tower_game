import { useReducer } from 'react';
import { ActionPanel } from './components/ActionPanel';
import { BattleLog } from './components/BattleLog';
import { EnemyPanel } from './components/EnemyPanel';
import { GameHeader } from './components/GameHeader';
import { PlayerPanel } from './components/PlayerPanel';
import { RelicList } from './components/RelicList';
import { ResultPanel } from './components/ResultPanel';
import { RewardChoices } from './components/RewardChoices';
import { applyReward } from './game/rewards';
import { createInitialGameState, nextFloor, playerAttack, playerGuard, restartGame } from './game/logic';
import type { GameState, Reward } from './game/types';

type Action =
  | { type: 'attack' }
  | { type: 'guard' }
  | { type: 'chooseReward'; reward: Reward }
  | { type: 'restart' };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'attack':
      return playerAttack(state);
    case 'guard':
      return playerGuard(state);
    case 'chooseReward': {
      if (state.phase !== 'reward') {
        return state;
      }

      const result = applyReward(state.player, action.reward);
      return nextFloor(state, result.player, result.logs);
    }
    case 'restart':
      return restartGame(state.records);
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialGameState());

  return (
    <main className="app-shell">
      <GameHeader state={state} />

      <div className="game-layout">
        <div className="enemy-area">
          <EnemyPanel enemy={state.enemy} />
        </div>

        <div className="player-area">
          <PlayerPanel player={state.player} floor={state.floor} />
        </div>

        <div className="action-area">
          <ActionPanel
            phase={state.phase}
            onAttack={() => dispatch({ type: 'attack' })}
            onGuard={() => dispatch({ type: 'guard' })}
            onRestart={() => dispatch({ type: 'restart' })}
          />
        </div>

        <div className="reward-area">
          <RewardChoices
            rewards={state.rewardChoices}
            visible={state.phase === 'reward'}
            onChoose={(reward) => dispatch({ type: 'chooseReward', reward })}
          />
        </div>

        <div className="result-area">
          <ResultPanel state={state} onRestart={() => dispatch({ type: 'restart' })} />
        </div>

        <div className="log-area">
          <BattleLog logs={state.logs} />
        </div>

        <div className="relic-area">
          <RelicList relics={state.player.relics} />
        </div>
      </div>
    </main>
  );
}

export default App;
