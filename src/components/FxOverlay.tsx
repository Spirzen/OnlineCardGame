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
          return <div key={fx.id} className="fx-slash" style={{ left: fx.x ?? '50%', top: fx.y ?? '30%' }} />;
        }
        return null;
      })}
    </div>
  );
}
