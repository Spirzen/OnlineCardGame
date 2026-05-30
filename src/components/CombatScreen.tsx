import { useEffect, useCallback, useRef, useState } from 'react';

import { useGame } from '../hooks/useGame';

import { useFx } from '../hooks/useFx';

import { LOCALE } from '../game/locale';

import { enemyFxPosition, resolveCardFxKind } from '../game/cardFx';

import { CardView } from './CardView';

import { EnemyPanel } from './EnemyPanel';

import { PlayerHUD, RelicBar } from './PlayerHUD';



export function CombatScreen() {

  const { run, dispatch, tick } = useGame();

  const { spawn, shake } = useFx();

  const prevHp = useRef<number | null>(null);

  const [hitEnemies, setHitEnemies] = useState<Set<number>>(new Set());

  const [arenaFlash, setArenaFlash] = useState(false);

  const combat = run.combat;

  void tick;



  const handleEndTurn = useCallback(() => {

    dispatch({ type: 'END_TURN' });

  }, [dispatch]);



  const playCardAt = useCallback(

    (cardIndex: number, targetIndex: number | null) => {

      const c = run.combat;

      if (!c || c.combatOver) return;

      const card = c.player.hand.cards[cardIndex];

      if (!c.canPlayCard(cardIndex)) return;



      const prevEnemyHp = c.encounter.enemies.map((e) => e.hp);

      const prevPlayerHp = c.player.hp;

      const prevBlock = c.player.block;

      const livingBefore = c.encounter.getLivingEnemies().length;



      const fxKind = resolveCardFxKind(card);

      const targetPos =

        targetIndex !== null && livingBefore > 0

          ? enemyFxPosition(targetIndex, livingBefore)

          : { x: '50%', y: '38%' };



      spawn(fxKind, targetPos);

      if (['slash', 'fire', 'lightning', 'blood', 'impact'].includes(fxKind)) {

        spawn('impact', { ...targetPos, y: '40%' });

        shake();

      }

      setArenaFlash(true);

      setTimeout(() => setArenaFlash(false), 320);



      dispatch({ type: 'PLAY_CARD', cardIndex, targetIndex });



      const after = run.combat;

      if (!after) return;



      const newHits = new Set<number>();

      after.encounter.enemies.forEach((enemy, i) => {

        const diff = prevEnemyHp[i] - enemy.hp;

        if (diff > 0) {

          newHits.add(i);

          const pos = enemyFxPosition(i, after.encounter.enemies.length);

          spawn('damage', { value: diff, ...pos, y: '36%' });

        }

      });

      if (newHits.size > 0) {

        setHitEnemies(newHits);

        setTimeout(() => setHitEnemies(new Set()), 380);

        shake();

      }



      const healDiff = after.player.hp - prevPlayerHp;

      if (healDiff > 0) spawn('heal', { value: healDiff, x: '50%', y: '58%' });



      const blockDiff = after.player.block - prevBlock;

      if (blockDiff > 0) spawn('block', { value: blockDiff, x: '42%', y: '58%' });

    },

    [run, dispatch, spawn, shake]

  );



  const onCardClick = useCallback(

    (i: number) => {

      if (!combat) return;

      const card = combat.player.hand.cards[i];

      if (!combat.canPlayCard(i)) return;

      const living = combat.encounter.getLivingEnemies();

      if (combat.cardNeedsTarget(card)) {

        if (combat.selectedEnemyIndex !== null) playCardAt(i, combat.selectedEnemyIndex);

        else if (living.length === 1) playCardAt(i, 0);

        else dispatch({ type: 'SELECT_CARD', index: i });

      } else {

        playCardAt(i, null);

      }

    },

    [combat, dispatch, playCardAt]

  );



  useEffect(() => {

    if (!combat) return;

    const onKey = (e: KeyboardEvent) => {

      if (combat.combatOver) return;

      if (combat.activeDialogue) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 4) {
          dispatch({ type: 'RESPOND_COMBAT_DIALOGUE', choiceIndex: num - 1 });
        }
        return;
      }

      if (e.key === 'Escape') {

        dispatch({ type: 'SELECT_CARD', index: null });

        dispatch({ type: 'SELECT_ENEMY', index: null });

        return;

      }



      if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {

        handleEndTurn();

        return;

      }



      const num = parseInt(e.key, 10);

      if (num >= 1 && num <= 9) {

        const idx = num - 1;

        if (idx < combat.player.hand.cards.length) {

          onCardClick(idx);

        }

      }

    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);

  }, [combat, handleEndTurn, onCardClick, dispatch]);



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
  const dialogue = combat.activeDialogue;
  const dialogueEnemy =
    dialogue !== null ? combat.encounter.enemies[dialogue.enemyIndex] : null;
  const onEnemyClick = (i: number) => {

    if (combat.selectedCardIndex !== null) playCardAt(combat.selectedCardIndex, i);

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



      <div className={`combat-arena ${arenaFlash ? 'combat-arena--flash' : ''}`}>

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

              hitFlash={hitEnemies.has(combat.encounter.enemies.indexOf(enemy))}

              onClick={() => onEnemyClick(i)}

            />

          ))}

        </div>

        <div className="combat-log panel" aria-live="polite">

          {combat.log.map((msg, i) => (

            <p key={i}>{msg}</p>

          ))}

        </div>

      </div>



      <div className="combat-hand-row">

        <p className="combat-hotkeys-hint">
          {dialogue ? LOCALE.COMBAT_DIALOGUE_HOTKEYS : LOCALE.COMBAT_HOTKEYS}
        </p>

        <div className="combat-hand-scroll">

          <div className="hand hand--combat">

            {combat.player.hand.cards.map((card, i) => (

              <CardView

                key={`${card.id}-${i}-${card.name}`}

                card={card}

                variant="combat"

                playable={combat.canPlayCard(i)}

                selected={combat.selectedCardIndex === i}

                hotkey={i < 9 ? i + 1 : undefined}

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

          disabled={combat.combatOver || !!dialogue}

        >

          {LOCALE.COMBAT_END_TURN}

          <span className="combat-bottom__hint">E</span>

        </button>

      </footer>

      {dialogue && (
        <div className="combat-dialogue-overlay" role="dialog" aria-modal="true">
          <div className="combat-dialogue panel">
            <p className="combat-dialogue__label">{LOCALE.COMBAT_DIALOGUE_TITLE}</p>
            <div className="combat-dialogue__speaker">
              <span className="combat-dialogue__name">{dialogue.enemyName}</span>
              {dialogueEnemy && !dialogueEnemy.alive && (
                <span className="combat-dialogue__dead"> (повержен)</span>
              )}
            </div>
            <blockquote className="combat-dialogue__line">«{dialogue.line}»</blockquote>
            <p className="combat-dialogue__hint">{LOCALE.COMBAT_DIALOGUE_HINT}</p>
            <div className="combat-dialogue__choices">
              {dialogue.choices.map((choice, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn combat-dialogue__choice"
                  onClick={() =>
                    dispatch({ type: 'RESPOND_COMBAT_DIALOGUE', choiceIndex: i })
                  }
                >
                  <span className="combat-dialogue__key">{i + 1}</span>
                  {choice.text}
                </button>
              ))}
              <button
                type="button"
                className="btn btn--ghost combat-dialogue__choice combat-dialogue__choice--silence"
                onClick={() =>
                  dispatch({ type: 'RESPOND_COMBAT_DIALOGUE', choiceIndex: 3 })
                }
              >
                <span className="combat-dialogue__key">4</span>
                {LOCALE.COMBAT_DIALOGUE_SILENCE}
              </button>
            </div>
            <p className="combat-dialogue__hotkeys">{LOCALE.COMBAT_DIALOGUE_HOTKEYS}</p>
          </div>
        </div>
      )}
    </div>

  );

}


