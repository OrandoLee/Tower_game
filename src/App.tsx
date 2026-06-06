import { useEffect, useReducer, useState, type MouseEvent } from 'react';
import { ActionHand } from './components/ActionHand';
import type { ActionCardData, ActionTargetType } from './components/ActionCard';
import { BattleLog } from './components/BattleLog';
import { EnemyPanel } from './components/EnemyPanel';
import { GameHeader } from './components/GameHeader';
import { PlayerPanel } from './components/PlayerPanel';
import { RelicList } from './components/RelicList';
import { ResultPanel } from './components/ResultPanel';
import { RewardChoices } from './components/RewardChoices';
import { DeckList } from './components/DeckList';
import { ShopPanel } from './components/ShopPanel';
import { StartMenu } from './components/StartMenu';
import { applyReward } from './game/rewards';
import { createInitialGameState, leaveShop, nextFloor, playerAttack, playerGuard, restartGame } from './game/logic';
import { buyShopCard, buyShopRelic, buyShopService, cancelRemoveCard, removeShopCard } from './game/shop';
import type { GameState, Reward, ShopServiceId } from './game/types';
import labLogoUrl from './assets/lab.svg';

type InfoTab = 'log' | 'relics' | 'deck';

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

function LaunchIntro({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="launch-intro" aria-hidden="true">
      <img src={labLogoUrl} alt="" />
    </div>
  );
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () => createInitialGameState());
  const [launchIntroVisible, setLaunchIntroVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [startMenuExiting, setStartMenuExiting] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ActionCardData | null>(null);
  const [playedCardId, setPlayedCardId] = useState<string | null>(null);
  const [invalidTarget, setInvalidTarget] = useState<ActionTargetType | null>(null);
  const [interactionMessage, setInteractionMessage] = useState('');
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('log');

  const canPlayCard = state.phase === 'battle';
  const gameSceneKey = state.phase === 'battle' ? `battle-${state.floor}` : state.phase;

  useEffect(() => {
    const introTimer = window.setTimeout(() => setLaunchIntroVisible(false), 1500);
    return () => window.clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!canPlayCard) {
      setSelectedCard(null);
      setInvalidTarget(null);
      setInteractionMessage('');
    }
  }, [canPlayCard]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !selectedCard) {
        return;
      }

      setSelectedCard(null);
      setInvalidTarget(null);
      setInteractionMessage('已取消选择。');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard]);

  function isValidTarget(card: ActionCardData, target: ActionTargetType): boolean {
    return card.targetType === target;
  }

  function handleCardSelect(card: ActionCardData) {
    if (!canPlayCard) {
      return;
    }

    setInvalidTarget(null);

    if (selectedCard?.id === card.id) {
      setSelectedCard(null);
      setInteractionMessage('已取消选择。');
      return;
    }

    setSelectedCard(card);
    setInteractionMessage(`已选择：${card.title}。请选择目标。`);
  }

  function handleCardTargetConfirm(card: ActionCardData, target: ActionTargetType) {
    if (!isValidTarget(card, target)) {
      setInvalidTarget(target);
      setInteractionMessage('目标无效。');
      window.setTimeout(() => setInvalidTarget(null), 180);
      return;
    }

    setSelectedCard(null);
    setInvalidTarget(null);
    setPlayedCardId(card.id);
    setInteractionMessage(`你打出了${card.title}牌。`);
    window.setTimeout(() => setPlayedCardId(null), 160);

    if (card.actionType === 'attack') {
      dispatch({ type: 'attack' });
      return;
    }

    if (card.actionType === 'guard') {
      dispatch({ type: 'guard' });
    }
  }

  function handleTargetClick(target: ActionTargetType) {
    if (!selectedCard || !canPlayCard) {
      return;
    }

    handleCardTargetConfirm(selectedCard, target);
  }

  function handleBlankCancel(event: MouseEvent<HTMLElement>) {
    if (!selectedCard) {
      return;
    }

    const element = event.target as HTMLElement;
    if (element.closest('[data-card-control], [data-target-area]')) {
      return;
    }

    setSelectedCard(null);
    setInvalidTarget(null);
    setInteractionMessage('已取消选择。');
  }

  function getTargetState(target: ActionTargetType): 'idle' | 'valid' | 'invalid' {
    if (!selectedCard || !canPlayCard) {
      return 'idle';
    }

    if (invalidTarget === target) {
      return 'invalid';
    }

    return isValidTarget(selectedCard, target) ? 'valid' : 'idle';
  }

  function handleRestart() {
    setSelectedCard(null);
    setInvalidTarget(null);
    setInteractionMessage('');
    dispatch({ type: 'restart' });
  }

  function handleEndTurn() {
    if (!canPlayCard) {
      return;
    }

    setSelectedCard(null);
    setInvalidTarget(null);
    setInteractionMessage('');
    dispatch({ type: 'guard' });
  }

  function handleStart() {
    if (startMenuExiting) {
      return;
    }

    setStartMenuExiting(true);
    window.setTimeout(() => {
      dispatch({ type: 'restart' });
      setHasStarted(true);
      setStartMenuExiting(false);
    }, 420);
  }

  if (!hasStarted) {
    return (
      <>
        <LaunchIntro visible={launchIntroVisible} />
        <StartMenu records={state.records} exiting={startMenuExiting} onStart={handleStart} />
      </>
    );
  }

  return (
    <>
      <LaunchIntro visible={launchIntroVisible} />
      <main className="app-shell app-shell-enter" onClick={handleBlankCancel}>
      <GameHeader state={state} />

      <div className="game-layout">
        <div className="combat-area">
          <div className="enemy-area view-transition" key={`enemy-${gameSceneKey}`}>
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
              <EnemyPanel
                enemy={state.enemy}
                targetState={getTargetState('enemy')}
                targetActive={selectedCard !== null && canPlayCard}
                onTargetClick={() => handleTargetClick('enemy')}
              />
            )}
          </div>

          {state.phase === 'reward' ? (
            <div className="reward-area view-transition" key={`reward-${gameSceneKey}`}>
              <RewardChoices
                rewards={state.rewardChoices}
                visible={state.phase === 'reward'}
                onChoose={(reward) => dispatch({ type: 'chooseReward', reward })}
              />
            </div>
          ) : (
            <div className="action-area view-transition" key={`action-${gameSceneKey}`}>
              <ActionHand
                phase={state.phase}
                selectedCardId={selectedCard?.id ?? null}
                playedCardId={playedCardId}
                message={interactionMessage}
                onSelectCard={handleCardSelect}
              />
            </div>
          )}
        </div>

        <div className="player-area view-transition" key={`player-${gameSceneKey}`}>
          <PlayerPanel
            player={state.player}
            floor={state.floor}
            turn={state.turn}
            targetState={getTargetState('player')}
            targetActive={selectedCard !== null && canPlayCard}
            onTargetClick={() => handleTargetClick('player')}
          />
        </div>

        <div className="turn-action-area">
          <section className="panel turn-action-bar" aria-label="回合操作">
            <button type="button" onClick={handleEndTurn} disabled={!canPlayCard} data-card-control="true">
              结束回合
            </button>
            <button type="button" className="secondary-button" onClick={handleRestart} data-card-control="true">
              重新开始
            </button>
          </section>
        </div>

        <div className="result-area view-transition" key={`result-${gameSceneKey}`}>
          <ResultPanel state={state} onRestart={() => dispatch({ type: 'restart' })} />
        </div>

        <div className="info-area">
          <section className="panel mobile-info-tabs">
            <div className="info-tab-list" role="tablist" aria-label="辅助信息">
              <button
                type="button"
                className={activeInfoTab === 'log' ? 'info-tab-active' : ''}
                onClick={() => setActiveInfoTab('log')}
                role="tab"
                aria-selected={activeInfoTab === 'log'}
              >
                日志
              </button>
              <button
                type="button"
                className={activeInfoTab === 'relics' ? 'info-tab-active' : ''}
                onClick={() => setActiveInfoTab('relics')}
                role="tab"
                aria-selected={activeInfoTab === 'relics'}
              >
                遗物
              </button>
              <button
                type="button"
                className={activeInfoTab === 'deck' ? 'info-tab-active' : ''}
                onClick={() => setActiveInfoTab('deck')}
                role="tab"
                aria-selected={activeInfoTab === 'deck'}
              >
                牌堆
              </button>
            </div>

            <div className="info-tab-panel view-transition" key={activeInfoTab}>
              {activeInfoTab === 'log' && <BattleLog logs={state.logs} embedded />}
              {activeInfoTab === 'relics' && <RelicList relics={state.player.relics} embedded />}
              {activeInfoTab === 'deck' && <DeckList deck={state.player.deck} embedded />}
            </div>
          </section>
        </div>
      </div>
      </main>
    </>
  );
}

export default App;
