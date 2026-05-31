import { useState, useCallback } from 'react';
import { LOCALE } from '../game/locale';
import {
  STORY_TUTORIAL_STEPS,
  type StoryTutorialStep,
} from '../game/storyTutorial';

const MECHANICS_HINTS: Record<string, string> = {
  map: LOCALE.STORY_MECH_MAP,
  combat: LOCALE.STORY_MECH_COMBAT,
  events: LOCALE.STORY_MECH_EVENTS,
  codex: LOCALE.STORY_MECH_CODEX,
  acts: LOCALE.STORY_MECH_ACTS,
};

interface StoryTutorialScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

function StepContent({ step }: { step: StoryTutorialStep }) {
  const mechHint = step.mechanicsTag ? MECHANICS_HINTS[step.mechanicsTag] : null;

  return (
    <>
      {step.kind === 'mechanics' && (
        <div className="story-tutorial__mechanics-badge">{LOCALE.STORY_MECH_LABEL}</div>
      )}
      {step.kind === 'choice' && (
        <div className="story-tutorial__choice-badge">{LOCALE.STORY_CHOICE_LABEL}</div>
      )}
      <div className={`story-tutorial__bubble story-tutorial__bubble--${step.kind}`}>
        {(step.speaker || (step.icon && step.kind === 'narrator')) && (
          <div className="story-tutorial__speaker">
            {step.icon && <span className="story-tutorial__speaker-icon">{step.icon}</span>}
            <span className="story-tutorial__speaker-name">
              {step.speaker ?? LOCALE.STORY_NARRATOR}
            </span>
          </div>
        )}
        <p className="story-tutorial__text">{step.text}</p>
      </div>
      {mechHint && <p className="story-tutorial__mech-hint panel">{mechHint}</p>}
    </>
  );
}

export function StoryTutorialScreen({ onComplete, onSkip }: StoryTutorialScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STORY_TUTORIAL_STEPS[stepIndex];
  const isLast = stepIndex >= STORY_TUTORIAL_STEPS.length - 1;
  const progress = ((stepIndex + 1) / STORY_TUTORIAL_STEPS.length) * 100;

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const goNext = useCallback(
    (goto?: number) => {
      if (goto !== undefined) {
        setStepIndex(goto);
        return;
      }
      if (isLast) {
        finish();
      } else {
        setStepIndex((i) => i + 1);
      }
    },
    [isLast, finish],
  );

  if (!step) return null;

  return (
    <div className="screen screen--scroll story-tutorial-screen">
      <div className="story-tutorial">
        <header className="story-tutorial__header">
          <h2 className="title-display story-tutorial__title">{LOCALE.STORY_TUTORIAL_TITLE}</h2>
          <p className="story-tutorial__subtitle">{LOCALE.STORY_TUTORIAL_SUB}</p>
          {step.chapter && (
            <p className="story-tutorial__chapter">
              {step.chapter === 1 ? LOCALE.STORY_CHAPTER_1 : LOCALE.STORY_CHAPTER_2}
            </p>
          )}
          <div className="story-tutorial__progress-track">
            <div className="story-tutorial__progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="story-tutorial__step-count">
            {stepIndex + 1} / {STORY_TUTORIAL_STEPS.length}
          </span>
        </header>

        <div className="story-tutorial__body">
          <StepContent step={step} />
        </div>

        <footer className="story-tutorial__footer">
          {step.kind === 'choice' && step.choices ? (
            <div className="story-tutorial__choices">
              {step.choices.map((c, i) => (
                <button key={i} className="btn" onClick={() => goNext(c.goto)}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="story-tutorial__actions">
              <button className="btn btn--ghost btn--sm" onClick={onSkip}>
                {LOCALE.STORY_SKIP_ALL}
              </button>
              <button className="btn btn--gold" onClick={() => goNext()}>
                {isLast ? LOCALE.STORY_FINISH : LOCALE.STORY_NEXT}
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

interface StoryTutorialOfferProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function StoryTutorialOffer({ onAccept, onDecline }: StoryTutorialOfferProps) {
  return (
    <div className="story-offer-overlay" role="dialog" aria-modal="true">
      <div className="story-offer panel">
        <div className="story-offer__icon">📖</div>
        <h2 className="story-offer__title">{LOCALE.STORY_OFFER_TITLE}</h2>
        <p className="story-offer__body">{LOCALE.STORY_OFFER_BODY}</p>
        <div className="story-offer__actions">
          <button className="btn btn--ghost" onClick={onDecline}>
            {LOCALE.STORY_OFFER_DECLINE}
          </button>
          <button className="btn btn--gold" onClick={onAccept}>
            {LOCALE.STORY_OFFER_ACCEPT}
          </button>
        </div>
      </div>
    </div>
  );
}
