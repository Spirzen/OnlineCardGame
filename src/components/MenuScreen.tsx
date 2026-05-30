import { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { sfx } from '../game/sfx';
import { getSavedRunSummary } from '../game/runSave';
import { getClass } from '../game/classes';
import {
  shouldOfferStoryTutorial,
  setStoryTutorialStatus,
  getStoryTutorialStatus,
} from '../game/storyTutorial';
import { hasMetaCodexUnlocks } from '../game/metaCodex';
import { StoryTutorialOffer } from './StoryTutorialScreen';
import { ClickerMenuButton } from './ClickerScreen';

export function MenuScreen() {
  const { run, dispatch, tick, savedRunAvailable } = useGame();
  void tick;
  const { stats } = run;
  const saveSummary = savedRunAvailable ? getSavedRunSummary() : null;
  const maxAsc = stats.maxAscensionUnlocked;
  const ascLevel = stats.ascensionLevel;
  const [showStoryOffer, setShowStoryOffer] = useState(false);

  useEffect(() => {
    sfx.startAmbient();
    return () => sfx.stopAmbient();
  }, []);

  useEffect(() => {
    if (shouldOfferStoryTutorial()) {
      const t = setTimeout(() => setShowStoryOffer(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleInteraction = () => sfx.ensureAudio();

  const acceptStoryOffer = () => {
    setShowStoryOffer(false);
    setStoryTutorialStatus('in_progress');
    dispatch({ type: 'START_STORY_TUTORIAL' });
  };

  const declineStoryOffer = () => {
    setShowStoryOffer(false);
    setStoryTutorialStatus('declined');
  };

  const showCodexBtn =
    hasMetaCodexUnlocks() || getStoryTutorialStatus() === 'completed';

  const fire = (action: Parameters<typeof dispatch>[0]) => {
    handleInteraction();
    sfx.click();
    dispatch(action);
  };

  return (
    <div className="screen menu-screen">
      {showStoryOffer && (
        <StoryTutorialOffer onAccept={acceptStoryOffer} onDecline={declineStoryOffer} />
      )}

      <header className="menu-hero">
        <p className="menu-hero__eyebrow">{LOCALE.MENU_TAGLINE}</p>
        <h1 className="title-display menu-hero__title">{LOCALE.MENU_TITLE}</h1>
        <div className="menu-hero__ornament" aria-hidden />
        <p className="menu-hero__lead">{LOCALE.MENU_SUBTITLE}</p>
      </header>

      <div className="menu-layout">
        <nav className="menu-nav panel">
          <p className="menu-nav__heading">Поход</p>
          <div className="menu-nav__primary">
            {savedRunAvailable && saveSummary && (
              <button
                className="btn btn--gold menu-continue"
                onClick={() => fire({ type: 'RESUME_RUN' })}
              >
                {LOCALE.MENU_CONTINUE}
                <span className="menu-continue__meta">
                  {getClass(saveSummary.classId).name} · {LOCALE.MAP_FLOOR} {saveSummary.floor}
                  {saveSummary.ascension > 0 &&
                    ` · ${LOCALE.ASCENSION_SHORT} ${saveSummary.ascension}`}
                </span>
              </button>
            )}
            <button className="btn btn--gold" onClick={() => fire({ type: 'BEGIN_RUN' })}>
              {LOCALE.MENU_NEW_RUN}
            </button>
            <button className="btn" onClick={() => fire({ type: 'BEGIN_DAILY' })}>
              {LOCALE.MENU_DAILY}
            </button>
            <ClickerMenuButton onFire={fire} />
          </div>

          <p className="menu-nav__heading menu-nav__heading--secondary">Справочник</p>
          <div className="menu-nav__secondary">
            <button
              className="btn btn--ghost btn--menu-secondary"
              onClick={() => fire({ type: 'START_STORY_TUTORIAL' })}
            >
              {LOCALE.MENU_STORY}
            </button>
            {showCodexBtn && (
              <button
                className="btn btn--ghost btn--menu-secondary"
                onClick={() => fire({ type: 'OPEN_CODEX_MENU' })}
              >
                {LOCALE.MENU_CODEX}
              </button>
            )}
            <button
              className="btn btn--ghost btn--menu-secondary"
              onClick={() => fire({ type: 'OPEN_EPIC_NOVEL', from: 'menu' })}
            >
              {LOCALE.MENU_NOVEL}
            </button>
            <button
              className="btn btn--ghost btn--menu-secondary"
              onClick={() => fire({ type: 'OPEN_STATS' })}
            >
              {LOCALE.MENU_STATS}
            </button>
            <button
              className="btn btn--ghost btn--menu-secondary"
              onClick={() => fire({ type: 'OPEN_EDITOR' })}
            >
              {LOCALE.MENU_EDITOR}
            </button>
          </div>

          <button
            className="btn btn--ghost btn--sm menu-mute"
            onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
          >
            <span className={`menu-mute__dot ${sfx.muted ? 'menu-mute__dot--off' : ''}`} />
            {sfx.muted ? LOCALE.MUTE_OFF : LOCALE.MUTE_ON}
          </button>
        </nav>

        <aside className="menu-aside">
          {maxAsc > 0 && (
            <div className="panel ascension-picker">
              <h3 className="ascension-picker__title">{LOCALE.ASCENSION_TITLE}</h3>
              <p className="ascension-picker__desc">{LOCALE.ASCENSION_DESC}</p>
              <div className="ascension-picker__levels">
                {Array.from({ length: maxAsc + 1 }, (_, i) => (
                  <button
                    key={i}
                    className={`ascension-btn ${ascLevel === i ? 'ascension-btn--active' : ''}`}
                    onClick={() => {
                      sfx.click();
                      dispatch({ type: 'SET_ASCENSION', level: i });
                    }}
                    title={
                      i > 0
                        ? `+${Math.round(i * 12)}% ${LOCALE.ASCENSION_BONUS}`
                        : LOCALE.ASCENSION_LEVEL
                    }
                  >
                    {i === 0 ? '—' : i}
                  </button>
                ))}
              </div>
              {ascLevel > 0 && (
                <p className="ascension-picker__bonus">
                  +{Math.round(ascLevel * 12)}% {LOCALE.ASCENSION_BONUS}
                </p>
              )}
            </div>
          )}

          <div className="panel menu-stats">
            <p className="menu-stats__heading">{LOCALE.STATS_TITLE}</p>
            <div className="menu-stats__grid">
              <div className="menu-stat">
                <div className="menu-stat__value">{stats.totalRuns}</div>
                <div className="menu-stat__label">{LOCALE.STAT_RUNS}</div>
              </div>
              <div className="menu-stat">
                <div className="menu-stat__value">{stats.totalWins}</div>
                <div className="menu-stat__label">{LOCALE.STAT_WINS}</div>
              </div>
              <div className="menu-stat">
                <div className="menu-stat__value">{stats.bestFloor}</div>
                <div className="menu-stat__label">{LOCALE.STAT_BEST_FLOOR}</div>
              </div>
              <div className="menu-stat">
                <div className="menu-stat__value">{stats.totalKills}</div>
                <div className="menu-stat__label">{LOCALE.STAT_KILLS}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function BannerOverlay() {
  const { run, dispatch } = useGame();
  const banner = run.banner;

  useEffect(() => {
    if (!banner) return;
    if (banner.type === 'boss') sfx.boss();
    else if (banner.type === 'elite') sfx.elite();
    else sfx.turn();
    const t = setTimeout(
      () => dispatch({ type: 'CLEAR_BANNER' }),
      banner.type === 'boss' ? 2200 : 1400,
    );
    return () => clearTimeout(t);
  }, [banner, dispatch]);

  if (!banner) return null;

  return (
    <div className={`banner banner--slide banner--${banner.type ?? 'fight'}`}>
      <div className="banner__text">
        {banner.title}
        {banner.subtitle && <span className="banner__sub">{banner.subtitle}</span>}
      </div>
    </div>
  );
}
