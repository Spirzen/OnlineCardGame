import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { sfx } from '../game/sfx';

export function MenuScreen() {
  const { run, dispatch, tick } = useGame();
  void tick;
  const { stats } = run;

  return (
    <div className="screen menu-screen">
      <div>
        <p className="subtitle">{LOCALE.MENU_TAGLINE}</p>
        <h1 className="title-display menu-title">{LOCALE.MENU_TITLE}</h1>
        <p className="subtitle" style={{ marginTop: '0.5rem' }}>{LOCALE.MENU_SUBTITLE}</p>
      </div>

      <div className="menu-buttons">
        <button className="btn btn--gold" onClick={() => { sfx.click(); dispatch({ type: 'BEGIN_RUN' }); }}>
          {LOCALE.MENU_NEW_RUN}
        </button>
        <button className="btn" onClick={() => { sfx.click(); dispatch({ type: 'BEGIN_DAILY' }); }}>
          {LOCALE.MENU_DAILY}
        </button>
        <button className="btn btn--ghost" onClick={() => { sfx.click(); dispatch({ type: 'OPEN_STATS' }); }}>
          {LOCALE.MENU_STATS}
        </button>
        <button className="btn btn--ghost" onClick={() => { sfx.click(); dispatch({ type: 'OPEN_EDITOR' }); }}>
          {LOCALE.MENU_EDITOR}
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}>
          {sfx.muted ? '🔇' : '🔊'} {LOCALE.MUTE}
        </button>
      </div>

      <div className="panel menu-stats">
        <div className="menu-stat"><div className="menu-stat__value">{stats.totalRuns}</div><div className="menu-stat__label">{LOCALE.STAT_RUNS}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{stats.totalWins}</div><div className="menu-stat__label">{LOCALE.STAT_WINS}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{stats.bestFloor}</div><div className="menu-stat__label">{LOCALE.STAT_BEST_FLOOR}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{stats.totalKills}</div><div className="menu-stat__label">{LOCALE.STAT_KILLS}</div></div>
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
    const t = setTimeout(() => dispatch({ type: 'CLEAR_BANNER' }), banner.type === 'boss' ? 2200 : 1400);
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
