import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { useFx } from '../hooks/useFx';
import { LOCALE } from '../game/locale';
import { CardView } from './CardView';
import { Tooltip } from './Tooltip';

export function RewardScreen() {
  const { run, dispatch } = useGame();
  const gold = run.combat?.goldReward ?? 0;

  return (
    <div className="screen">
      <div className="center-content">
        <h2 className="title-display">{LOCALE.REWARD_VICTORY}</h2>
        <p style={{ color: 'var(--gold)' }}>+{gold} {LOCALE.REWARD_GOLD}</p>
        <p className="subtitle">{LOCALE.REWARD_CHOOSE}</p>
        <div className="card-grid">
          {run.rewardCards.map((card, i) => (
            <CardView key={i} card={card} variant="reward" onClick={() => dispatch({ type: 'PICK_REWARD', index: i })} />
          ))}
        </div>
        <button className="btn btn--ghost" onClick={() => dispatch({ type: 'SKIP_REWARD' })}>{LOCALE.REWARD_SKIP}</button>
      </div>
    </div>
  );
}

export function ShopScreen() {
  const { run, dispatch } = useGame();
  const deckPreview = run.player.deck.getAllCards().slice(0, 8);

  return (
    <div className="screen screen--scroll">
      <div className="screen-header">
        <h2>{LOCALE.SHOP_TITLE}</h2>
        <span className="stat-pill stat-pill--gold">🪙 {run.player.gold}</span>
      </div>
      <div className="center-content" style={{ justifyContent: 'flex-start', paddingTop: '1rem' }}>
        <p className="subtitle">{LOCALE.SHOP_CARDS}</p>
        <div className="card-grid">
          {run.shopCards.map((card, i) => (
            <CardView key={i} card={card} variant="shop" onClick={() => dispatch({ type: 'BUY_CARD', index: i })} />
          ))}
        </div>
        <p className="subtitle">{LOCALE.SHOP_RELICS}</p>
        <div className="relic-grid">
          {run.shopRelics.map((relic, i) => (
            <Tooltip key={i} content={relic.description} wide>
              <div className="relic-card panel" onClick={() => dispatch({ type: 'BUY_RELIC', index: i })}>
                <h3>{relic.name}</h3>
                <p>{relic.description}</p>
              </div>
            </Tooltip>
          ))}
        </div>
        <p className="subtitle">{LOCALE.SHOP_REMOVE}</p>
        <div className="chip-row">
          {deckPreview.map((card, i) => (
            <button key={i} className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'REMOVE_CARD', index: i })}>
              {card.name}
            </button>
          ))}
        </div>
        <button className="btn btn--gold" style={{ marginTop: '1rem' }} onClick={() => dispatch({ type: 'LEAVE_SHOP' })}>{LOCALE.SHOP_LEAVE}</button>
      </div>
    </div>
  );
}

export function RestScreen() {
  const { run, dispatch } = useGame();

  return (
    <div className="screen">
      <div className="center-content">
        <h2 className="title-display">{LOCALE.REST_TITLE}</h2>
        <div className="rest-options">
          <div className="rest-option panel" onClick={() => dispatch({ type: 'REST_HEAL' })}>
            <div className="rest-option__icon">🔥</div>
            <h3>{LOCALE.REST_HEAL}</h3>
            <p className="rest-option__hint">+{Math.floor(run.player.maxHp / 4)} HP</p>
          </div>
          <div className="rest-option panel" onClick={() => dispatch({ type: 'OPEN_SMITH' })}>
            <div className="rest-option__icon">⚒</div>
            <h3>{LOCALE.REST_SMITH}</h3>
            <p className="rest-option__hint">{LOCALE.REST_SMITH_HINT}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventScreen() {
  const { run, dispatch } = useGame();
  const ev = run.currentEvent;

  return (
    <div className="screen">
      <div className="center-content">
        <h2 className="title-display">{ev?.title ?? LOCALE.EVENT_TITLE}</h2>
        <p className="event-text">{ev?.description}</p>
        {run.eventMessage && <p className="event-result panel">{run.eventMessage}</p>}
        <div className="event-choices">
          {!run.eventMessage && ev?.choices.map((c, i) => (
            <button key={i} className="btn" onClick={() => dispatch({ type: 'PICK_EVENT', index: i })}>{c.text}</button>
          ))}
        </div>
        {run.eventMessage && (
          <button className="btn btn--gold" onClick={() => dispatch({ type: 'CONTINUE_EVENT' })}>{LOCALE.EVENT_CONTINUE}</button>
        )}
      </div>
    </div>
  );
}

export function TreasureScreen() {
  const { run, dispatch } = useGame();

  return (
    <div className="screen">
      <div className="center-content">
        <h2 className="title-display">{LOCALE.TREASURE_TITLE}</h2>
        <p className="subtitle">{LOCALE.TREASURE_CHOOSE}</p>
        <div className="relic-grid">
          {run.treasureRelics.map((relic, i) => (
            <div key={i} className="relic-card panel" onClick={() => dispatch({ type: 'PICK_TREASURE', index: i })}>
              <h3>{relic.name}</h3>
              <p>{relic.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GameOverScreen({ victory }: { victory: boolean }) {
  const { run, dispatch } = useGame();
  const { spawn } = useFx();
  const [floor] = run.gameMap?.getFloorProgress() ?? [0, 15];

  useEffect(() => {
    if (victory) spawn('confetti');
  }, [victory, spawn]);

  return (
    <div className={`screen game-over-screen ${victory ? 'game-over-screen--win' : ''}`}>
      <div className="center-content">
        <h2 className={`result-title ${victory ? 'result-title--win title-display' : 'result-title--lose'}`}>
          {victory ? LOCALE.VICTORY : LOCALE.GAME_OVER}
        </h2>
        <div className="result-stats">
          {!victory && <span>{LOCALE.GAME_OVER_FLOOR}: {floor}</span>}
          <span>{LOCALE.GAME_OVER_KILLS}: {run.kills}</span>
        </div>
        <button className="btn btn--gold" onClick={() => dispatch({ type: 'GO_MENU' })}>{LOCALE.BACK_TO_MENU}</button>
      </div>
    </div>
  );
}
