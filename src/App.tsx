import { useReducer } from 'react';
import { ActionHand } from './components/ActionHand';
import { BattleLog } from './components/BattleLog';
import { EnemyPanel } from './components/EnemyPanel';
import { GameHeader } from './components/GameHeader';
import { PlayerPanel } from './components/PlayerPanel';
import { RelicList } from './components/RelicList';
import { ResultPanel } from './components/ResultPanel';
import { RewardChoices } from './components/RewardChoices';
import { DeckList } from './components/DeckList';
import { ShopPanel } from './components/ShopPanel';
import { applyReward } from './game/rewards';
import { createInitialGameState, leaveShop, nextFloor, playerAttack, playerGuard, restartGame } from './game/logic';
import { buyShopCard, buyShopRelic, buyShopService, cancelRemoveCard, removeShopCard } from './game/shop';
import type { GameState, Reward, ShopServiceId } from './game/types';

type Action =
  | { type: 'attack' }
  | { type: 'guard' }
  | { type: 'chooseReward'; reward: Reward }
  | { type: 'buyCard'; offerId: string }
  | { type: 'buyRelic'; offerId: string }
  | { type: 'buyService'; serviceId: ShopServiceId }
  | { type: 'removeCard'; instanceId: string }
  | { type: 'cancelRemoveCard' }
  | { type: 'leaveShop' }
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
    case 'buyCard':
      return buyShopCard(state, action.offerId);
    case 'buyRelic':
      return buyShopRelic(state, action.offerId);
    case 'buyService':
      return buyShopService(state, action.serviceId);
    case 'removeCard':
      return removeShopCard(state, action.instanceId);
    case 'cancelRemoveCard':
      return cancelRemoveCard(state);
    case 'leaveShop':
      return leaveShop(state);
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
          {state.phase === 'shop' ? (
            <ShopPanel
              player={state.player}
              shop={state.shop}
              onBuyCard={(offerId) => dispatch({ type: 'buyCard', offerId })}
              onBuyRelic={(offerId) => dispatch({ type: 'buyRelic', offerId })}
              onBuyService={(serviceId) => dispatch({ type: 'buyService', serviceId })}
              onRemoveCard={(instanceId) => dispatch({ type: 'removeCard', instanceId })}
              onCancelRemoveCard={() => dispatch({ type: 'cancelRemoveCard' })}
              onLeave={() => dispatch({ type: 'leaveShop' })}
            />
          ) : (
            <EnemyPanel enemy={state.enemy} />
          )}
        </div>

        <div className="player-area">
          <PlayerPanel player={state.player} floor={state.floor} />
        </div>

        <div className="action-area">
          <ActionHand
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
          <DeckList deck={state.player.deck} />
          <RelicList relics={state.player.relics} />
        </div>
      </div>
    </main>
  );
}

export default App;
