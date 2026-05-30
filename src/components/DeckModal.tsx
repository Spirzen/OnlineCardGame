import { useGame } from '../hooks/useGame';
import { CardView } from './CardView';
import { LOCALE } from '../game/locale';

export function DeckModal() {
  const { run, dispatch } = useGame();
  if (!run.deckModalOpen) return null;

  const draw = run.player.deck.drawPile;
  const discard = run.player.deck.discardPile;
  const all = run.player.deck.getAllCards();

  return (
    <div className="modal-overlay" onClick={() => dispatch({ type: 'TOGGLE_DECK', open: false })}>
      <div className="modal panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{LOCALE.DECK_TITLE}</h3>
          <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'TOGGLE_DECK', open: false })}>✕</button>
        </div>
        <div className="deck-stats">
          <span>{LOCALE.COMBAT_DRAW}: {draw.length}</span>
          <span>{LOCALE.COMBAT_DISCARD}: {discard.length}</span>
          <span>{LOCALE.DECK_TOTAL}: {all.length}</span>
        </div>
        <div className="deck-grid">
          {all.map((card, i) => (
            <CardView key={`${card.id}-${i}`} card={card} variant="shop" playable={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
