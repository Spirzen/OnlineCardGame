import { useState, useEffect } from 'react';
import { LOCALE } from '../game/locale';

const TUTORIAL_KEY = 'ural_batyr_tutorial_done';

export function isTutorialDone(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch {
    /* ignore */
  }
}

interface TutorialOverlayProps {
  active: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ active, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const steps = LOCALE.TUTORIAL_STEPS;

  useEffect(() => {
    if (active) setStep(0);
  }, [active]);

  if (!active) return null;

  const current = steps[step];
  const isLast = step >= steps.length - 1;

  const finish = () => {
    markTutorialDone();
    onClose();
  };

  return (
    <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div className="tutorial-card panel">
        <div className="tutorial-progress">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`tutorial-dot ${i === step ? 'tutorial-dot--active' : i < step ? 'tutorial-dot--done' : ''}`}
            />
          ))}
        </div>
        <h2 id="tutorial-title" className="tutorial-title">{current.title}</h2>
        <p className="tutorial-body">{current.body}</p>
        <div className="tutorial-actions">
          <button className="btn btn--ghost btn--sm" onClick={finish}>
            {LOCALE.TUTORIAL_SKIP}
          </button>
          <button
            className="btn btn--gold"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          >
            {isLast ? LOCALE.TUTORIAL_SKIP : LOCALE.TUTORIAL_NEXT}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useTutorialTrigger(screen: string) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (screen === 'map' && !isTutorialDone()) {
      const t = setTimeout(() => setShowTutorial(true), 600);
      return () => clearTimeout(t);
    }
  }, [screen]);

  return { showTutorial, closeTutorial: () => setShowTutorial(false) };
}
