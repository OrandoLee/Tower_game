import type { Reward } from '../game/types';

interface RewardChoicesProps {
  rewards: Reward[];
  visible: boolean;
  onChoose: (reward: Reward) => void;
}

export function RewardChoices({ rewards, visible, onChoose }: RewardChoicesProps) {
  if (!visible) {
    return null;
  }

  return (
    <section className="panel reward-panel">
      <div className="panel-title">
        <p>奖励区</p>
        <span>选择一项奖励继续前进。</span>
      </div>

      <div className="reward-grid">
        {rewards.map((reward) => (
          <button type="button" className="reward-card" key={reward.id} onClick={() => onChoose(reward)}>
            <span>{reward.rarity}</span>
            <strong>{reward.title}</strong>
            <small>{reward.description}</small>
            <em>点击选择</em>
          </button>
        ))}
      </div>
    </section>
  );
}
