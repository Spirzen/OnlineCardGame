import type { Card as CardModel } from '../game/card';
import { CARD_TYPE_COLORS, RARITY_COLORS } from '../game/settings';
import { getTypeLabel } from '../game/card';
import { getCardArt } from '../game/epicTheme';
import { Tooltip } from './Tooltip';

interface CardProps {
  card: CardModel;
  playable?: boolean;
  selected?: boolean;
  variant?: 'hand' | 'combat' | 'reward' | 'shop';
  onClick?: () => void;
}

export function getCardDetailText(card: CardModel): string {
  const parts = [card.description];
  if (card.block) parts.push(`Броня: ${card.block}`);
  if (card.draw) parts.push(`Добор: ${card.draw}`);
  if (card.aoe) parts.push('AOE');
  if (card.upgraded) parts.push('Улучшена');
  return parts.filter(Boolean).join(' · ');
}

function CardTooltipContent({ card }: { card: CardModel }) {
  const rarityColor = (RARITY_COLORS as Record<string, string>)[card.rarity] ?? '#fff';
  const typeColor = CARD_TYPE_COLORS[card.type] ?? '#888';

  return (
    <div className="card-tooltip">
      <div className="card-tooltip__head">
        <strong className="card-tooltip__name" style={{ color: rarityColor }}>
          {card.name}
        </strong>
        <span className="card-tooltip__cost">⚡ {card.cost}</span>
      </div>
      <div className="card-tooltip__type" style={{ color: typeColor }}>
        {getTypeLabel(card.type)}
        {card.upgraded && <span className="card-tooltip__upgraded"> · Улучшена</span>}
      </div>
      <p className="card-tooltip__desc">{card.description}</p>
      {(card.block || card.draw || card.aoe || card.value > 0) && (
        <div className="card-tooltip__stats">
          {card.value > 0 && ['attack', 'block', 'creature'].includes(card.type) && (
            <span>💥 {card.value}</span>
          )}
          {card.block ? <span>🛡 {card.block}</span> : null}
          {card.draw ? <span>🃏 +{card.draw}</span> : null}
          {card.aoe ? <span>🎯 AOE</span> : null}
        </div>
      )}
    </div>
  );
}

export function CardView({
  card,
  playable = true,
  selected,
  variant = 'hand',
  onClick,
}: CardProps) {
  const accent = CARD_TYPE_COLORS[card.type] ?? '#888';
  const showValue = ['attack', 'block', 'creature'].includes(card.type) && card.value > 0;
  const isCombatHand = variant === 'combat';
  const isHandLike = variant === 'hand' || isCombatHand;

  const classes = [
    'card',
    variant === 'reward' || variant === 'shop' ? `card--${variant}` : '',
    isCombatHand ? 'card--combat-hand' : '',
    playable && isHandLike ? 'card--playable' : '',
    selected ? 'card--selected' : '',
    !playable && isHandLike ? 'card--disabled' : '',
    card.upgraded ? 'card--upgraded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <div
      className={classes}
      style={{ '--card-accent': accent } as Record<string, string>}
      onClick={playable || variant !== 'hand' ? onClick : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="card__inner">
        <span className="card__cost">{card.cost}</span>
        <span className="card__type-badge">{getTypeLabel(card.type)}</span>
        <div className="card__art">{getCardArt(card.id, card.type)}</div>
        {showValue && <span className="card__value">{card.value}</span>}
        <div className="card__body">
          <div className="card__name">{card.name}</div>
          {!isCombatHand && <div className="card__desc">{card.description}</div>}
        </div>
      </div>
    </div>
  );

  if (isHandLike) {
    return (
      <Tooltip
        content={<CardTooltipContent card={card} />}
        wide
        portal={isCombatHand}
        placement="top"
      >
        {inner}
      </Tooltip>
    );
  }

  return inner;
}

