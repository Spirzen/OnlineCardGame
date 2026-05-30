import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { useFx } from '../hooks/useFx';
import { LOCALE } from '../game/locale';
import { CardView } from './CardView';
import { EnemyPanel } from './EnemyPanel';
import { PlayerHUD, RelicBar } from './PlayerHUD';

export function CombatScreen() {
  const { run, dispatch, tick } = useGame();
  const { spawn, shake } = useFx();
  const prevHp = useRef<number | null>(null);
  const combat = run.combat;
  void tick;

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, [dispatch]);

  useEffect(() => {
    if (!combat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
        if (!combat.combatOver) handleEndTurn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combat, handleEndTurn]);

  useEffect(() => {
    if (!combat) return;
    if (prevHp.current !== null && combat.player.hp < prevHp.current) {
      spawn('damage', { value: prevHp.current - combat.player.hp, x: '50%', y: '55%' });
      shake();
    }
    prevHp.current = combat.player.hp;
  }, [combat?.player.hp, combat, spawn, shake]);

  if (!combat) return null;

  const targeting = combat.selectedCardIndex !== null;
  const living = combat.encounter.getLivingEnemies();

  const playCard = (cardIndex: number, targetIndex: number | null) => {
    const card = combat.player.hand.cards[cardIndex];
    if (card?.type === 'attack' || card?.type === 'creature') {
      spawn('slash', { x: '50%', y: '42%' });
    }
    dispatch({ type: 'PLAY_CARD', cardIndex, targetIndex });
  };

  const onCardClick = (i: number) => {
    const card = combat.player.hand.cards[i];
    if (!combat.canPlayCard(i)) return;
    if (combat.cardNeedsTarget(card)) {
      if (combat.selectedEnemyIndex !== null) playCard(i, combat.selectedEnemyIndex);
      else if (living.length === 1) playCard(i, 0);
      else dispatch({ type: 'SELECT_CARD', index: i });
    } else {
      playCard(i, null);
    }
  };

  const onEnemyClick = (i: number) => {
    if (combat.selectedCardIndex !== null) playCard(combat.selectedCardIndex, i);
    else dispatch({ type: 'SELECT_ENEMY', index: i });
  };

  return (
    <div className="screen combat-area">
      <header className="combat-top">
        <div className="combat-top__meta">
          <span className="combat-turn-label">{LOCALE.COMBAT_TURN} {combat.turn}</span>
          <span className="combat-deck-label">
            🃏 {combat.player.deck.drawPile.length}
            <span className="combat-deck-sep">/</span>
            {combat.player.deck.discardPile.length}
          </span>
        </div>

        <PlayerHUD player={combat.player} variant="combat" />

        <div className="combat-top__tools">
          <RelicBar relics={combat.player.relics} compact />
          <button
            className="btn btn--ghost btn--sm combat-top__deck"
            onClick={() => dispatch({ type: 'TOGGLE_DECK', open: true })}
            title={LOCALE.DECK_VIEW}
          >
            📚
          </button>
        </div>
      </header>

      <div className="combat-arena">
        <div className="combat-arena__bg" aria-hidden />
        {targeting && (
          <div className="target-hint target-hint--arena">{LOCALE.COMBAT_SELECT_TARGET}</div>
        )}
        <div className="combat-enemies">
          {living.map((enemy, i) => (
            <EnemyPanel
              key={enemy.id + i}
              enemy={enemy}
              index={i}
              selected={combat.selectedEnemyIndex === i}
              targetable={targeting}
              onClick={() => onEnemyClick(i)}
            />
          ))}
        </div>
        <div className="combat-log panel">
          {combat.log.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      </div>

      <div className="combat-hand-row">
        <div className="combat-hand-scroll">
          <div className="hand hand--combat">
            {combat.player.hand.cards.map((card, i) => (
              <CardView
                key={`${card.id}-${i}-${card.name}`}
                card={card}
                variant="combat"
                playable={combat.canPlayCard(i)}
                selected={combat.selectedCardIndex === i}
                onClick={() => onCardClick(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="combat-bottom">
        <button
          className="btn btn--gold combat-bottom__end"
          onClick={handleEndTurn}
          disabled={combat.combatOver}
        >
          {LOCALE.COMBAT_END_TURN}
          <span className="combat-bottom__hint">E</span>
        </button>
      </footer>
    </div>
  );
}
