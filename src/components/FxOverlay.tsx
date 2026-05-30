import { useFx } from '../hooks/useFx';

export function FxOverlay() {
  const { effects, shaking } = useFx();

  return (
    <div className={`fx-layer ${shaking ? 'fx-layer--shake' : ''}`} aria-hidden>
      {effects.map((fx) => {
        if (fx.kind === 'confetti') {
          return (
            <div key={fx.id} className="confetti-burst">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="confetti-piece" style={{ '--i': i } as Record<string, number>} />
              ))}
            </div>
          );
        }

        if (fx.kind === 'damage' || fx.kind === 'heal' || fx.kind === 'block') {
          const cls = fx.kind === 'damage' ? 'fx-damage' : fx.kind === 'heal' ? 'fx-heal' : 'fx-block';
          const prefix = fx.kind === 'damage' ? '−' : '+';
          return (
            <span
              key={fx.id}
              className={`fx-float ${cls}`}
              style={{ left: fx.x ?? '50%', top: fx.y ?? '40%' }}
            >
              {prefix}{fx.value}
            </span>
          );
        }

        if (fx.kind === 'slash') {
          return (
            <div
              key={fx.id}
              className="fx-slash"
              style={{ left: fx.x ?? '50%', top: fx.y ?? '30%' }}
            />
          );
        }

        if (fx.kind === 'fire') {
          return (
            <div key={fx.id} className="fx-burst fx-burst--fire" style={{ left: fx.x ?? '50%', top: fx.y ?? '38%' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="fx-particle fx-particle--fire" style={{ '--i': i } as Record<string, number>} />
              ))}
            </div>
          );
        }

        if (fx.kind === 'ice') {
          return (
            <div key={fx.id} className="fx-burst fx-burst--ice" style={{ left: fx.x ?? '50%', top: fx.y ?? '38%' }}>
              <span className="fx-ice-shard" />
              <span className="fx-ice-shard fx-ice-shard--2" />
              <span className="fx-ice-shard fx-ice-shard--3" />
            </div>
          );
        }

        if (fx.kind === 'lightning') {
          return (
            <div
              key={fx.id}
              className="fx-lightning"
              style={{ left: fx.x ?? '50%', top: fx.y ?? '28%' }}
            />
          );
        }

        if (fx.kind === 'blood') {
          return (
            <div key={fx.id} className="fx-burst fx-burst--blood" style={{ left: fx.x ?? '50%', top: fx.y ?? '38%' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="fx-particle fx-particle--blood" style={{ '--i': i } as Record<string, number>} />
              ))}
            </div>
          );
        }

        if (fx.kind === 'holy') {
          return (
            <div key={fx.id} className="fx-holy" style={{ left: fx.x ?? '50%', top: fx.y ?? '42%' }}>
              <span className="fx-holy__ring" />
              <span className="fx-holy__core">✦</span>
            </div>
          );
        }

        if (fx.kind === 'shield') {
          return (
            <div key={fx.id} className="fx-shield" style={{ left: fx.x ?? '50%', top: fx.y ?? '55%' }}>
              🛡
            </div>
          );
        }

        if (fx.kind === 'buff') {
          return (
            <div key={fx.id} className="fx-aura fx-aura--buff" style={{ left: fx.x ?? '50%', top: fx.y ?? '55%' }} />
          );
        }

        if (fx.kind === 'debuff') {
          return (
            <div key={fx.id} className="fx-aura fx-aura--debuff" style={{ left: fx.x ?? '50%', top: fx.y ?? '38%' }}>
              ☠
            </div>
          );
        }

        if (fx.kind === 'spark') {
          return (
            <div key={fx.id} className="fx-spark" style={{ left: fx.x ?? '50%', top: fx.y ?? '50%' }}>
              ✦
            </div>
          );
        }

        if (fx.kind === 'impact') {
          return (
            <div key={fx.id} className="fx-impact" style={{ left: fx.x ?? '50%', top: fx.y ?? '38%' }} />
          );
        }

        return null;
      })}
    </div>
  );
}
