import { Tooltip } from './Tooltip';
import type { Relic } from '../game/relic';
import type { Player } from '../game/player';

interface PlayerHUDProps {
  player: Player;
  variant?: 'default' | 'combat';
}

export function PlayerHUD({ player, variant = 'default' }: PlayerHUDProps) {
  const isCombat = variant === 'combat';

  if (isCombat) {
    return (
      <div className="hud-bar hud-bar--combat">
        <span className="stat-pill stat-pill--hero stat-pill--hp" title="Здоровье">
          <span className="stat-pill__icon" aria-hidden>❤</span>
          <span className="stat-pill__value">{player.hp}</span>
          <span className="stat-pill__sep">/</span>
          <span className="stat-pill__max">{player.maxHp}</span>
        </span>
        <span className="stat-pill stat-pill--hero stat-pill--block" title="Броня">
          <span className="stat-pill__icon" aria-hidden>🛡</span>
          <span className="stat-pill__value">{player.block}</span>
        </span>
        <span className="stat-pill stat-pill--hero stat-pill--energy" title="Энергия">
          <span className="stat-pill__icon" aria-hidden>⚡</span>
          <span className="stat-pill__value">{player.energy}</span>
          <span className="stat-pill__sep">/</span>
          <span className="stat-pill__max">{player.maxEnergy}</span>
        </span>
        {player.strength > 0 && (
          <span className="stat-pill stat-pill--str" title="Сила">
            💪 {player.strength}
          </span>
        )}
        {player.vulnerable > 0 && (
          <span className="stat-pill stat-pill--debuff" title="Уязвимость">☍ {player.vulnerable}</span>
        )}
        {player.weak > 0 && (
          <span className="stat-pill stat-pill--debuff" title="Слабость">↓ {player.weak}</span>
        )}
      </div>
    );
  }

  return (
    <div className="hud-bar panel hud-bar--compact">
      <span className="stat-pill stat-pill--hp" title="Здоровье">
        ❤ {player.hp}/{player.maxHp}
      </span>
      {player.block > 0 && (
        <span className="stat-pill stat-pill--block" title="Броня">🛡 {player.block}</span>
      )}
      <span className="stat-pill stat-pill--energy" title="Энергия">
        ⚡ {player.energy}/{player.maxEnergy}
      </span>
      <span className="stat-pill stat-pill--gold" title="Золото">🪙 {player.gold}</span>
      {player.strength > 0 && (
        <span className="stat-pill stat-pill--str" title="Сила">💪 {player.strength}</span>
      )}
      {player.vulnerable > 0 && (
        <span className="stat-pill stat-pill--debuff" title="Уязвимость">☍ {player.vulnerable}</span>
      )}
      {player.weak > 0 && (
        <span className="stat-pill stat-pill--debuff" title="Слабость">↓ {player.weak}</span>
      )}
    </div>
  );
}

export function RelicBar({ relics, compact }: { relics: Relic[]; compact?: boolean }) {
  if (!relics.length) return null;
  return (
    <div className={`relic-bar ${compact ? 'relic-bar--compact' : ''}`}>
      {relics.map((r) => (
        <Tooltip key={r.id + r.name} content={r.description}>
          <div className="relic-chip">
            <div className="relic-chip__name">{r.name}</div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
