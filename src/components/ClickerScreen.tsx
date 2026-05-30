import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { useFx } from '../hooks/useFx';
import { LOCALE } from '../game/locale';
import { CLICKER_UPGRADES_BY_TIER, type ClickerUpgradeDef } from '../game/clickerUpgrades';
import { getClickerBestLevel } from '../game/clickerState';
import { getClickerSaveSummary } from '../game/clickerSave';
import { getGameOverLore } from '../game/clickerLore';
import { ENEMY_SPRITES } from '../game/epicTheme';
import { EVENT_ICONS } from '../game/epicTheme';

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.floor(n));
}

export function ClickerScreen() {
  const { run, dispatch, tick } = useGame();
  const { spawn } = useFx();
  const clicker = run.clicker;
  const enemyBtnRef = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);

  void tick;

  useEffect(() => {
    if (!clicker || clicker.subScreen === 'game_over') return;
    const interval = setInterval(() => {
      dispatch({ type: 'CLICKER_TICK', deltaMs: 50 });
    }, 50);
    return () => clearInterval(interval);
  }, [clicker?.subScreen, dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        enemyBtnRef.current?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleAttack = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!clicker || clicker.subScreen !== 'play') return;
      dispatch({ type: 'CLICKER_ATTACK' });
      const result = run.clicker?.lastClickResult;
      if (!result || result.damage <= 0) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = 'clientX' in e ? e.clientX : e.touches[0]?.clientX ?? rect.left + rect.width / 2;
      const y = 'clientY' in e ? e.clientY : e.touches[0]?.clientY ?? rect.top + rect.height / 2;
      spawn('damage', { x, y, value: result.damage, label: result.crit ? 'CRIT!' : undefined });
      const sprite = spriteRef.current;
      if (sprite) {
        sprite.classList.remove('clicker-enemy-sprite--hit');
        void sprite.offsetWidth;
        sprite.classList.add('clicker-enemy-sprite--hit');
      }
    },
    [clicker, dispatch, run, spawn],
  );

  if (!clicker) return null;

  if (clicker.subScreen === 'game_over') {
    const overLore = getGameOverLore();
    return (
      <div className="screen clicker-screen clicker-screen--over">
        <div className="clicker-over panel">
          <h2 className="title-display">{LOCALE.CLICKER_GAME_OVER}</h2>
          <blockquote className="clicker-over__lore">{overLore}</blockquote>
          <p className="clicker-over__sub">
            {LOCALE.CLICKER_GAME_OVER_SUB
              .replace('{level}', String(clicker.level))
              .replace('{kills}', String(clicker.totalKills))}
          </p>
          <p className="clicker-over__best">
            {LOCALE.CLICKER_BEST}: {getClickerBestLevel()}
          </p>
          <div className="clicker-over__actions">
            <button className="btn btn--gold" onClick={() => dispatch({ type: 'CLICKER_RESTART' })}>
              {LOCALE.CLICKER_RETRY}
            </button>
            <button className="btn btn--ghost" onClick={() => dispatch({ type: 'GO_MENU' })}>
              {LOCALE.BACK_TO_MENU}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (clicker.subScreen === 'event' && clicker.currentEvent) {
    const ev = clicker.currentEvent;
    return (
      <div className="screen clicker-screen clicker-screen--event">
        <div className="clicker-event panel">
          <div className="clicker-event__badge">
            {LOCALE.CLICKER_JOURNEY} · {LOCALE.CLICKER_LEVEL} {clicker.level}
          </div>
          <h2 className="title-display">{ev.title}</h2>
          <div className="event-icon">{EVENT_ICONS[ev.id] ?? '📜'}</div>
          {ev.loreSnippet && !clicker.eventMessage && (
            <div className="event-lore panel">
              <strong>{LOCALE.EVENT_LORE_LABEL}:</strong> {ev.loreSnippet}
            </div>
          )}
          <p className="event-text">{ev.description}</p>
          {clicker.eventMessage && <p className="event-result panel">{clicker.eventMessage}</p>}
          <div className="event-choices">
            {!clicker.eventMessage &&
              ev.choices.map((c, i) => (
                <button
                  key={i}
                  className="btn"
                  onClick={() => dispatch({ type: 'CLICKER_PICK_EVENT', index: i })}
                >
                  {c.text}
                </button>
              ))}
          </div>
          {clicker.eventMessage && (
            <button
              className="btn btn--gold"
              onClick={() => dispatch({ type: 'CLICKER_CONTINUE_EVENT' })}
            >
              {LOCALE.CLICKER_EVENT_CONTINUE}
            </button>
          )}
        </div>
      </div>
    );
  }

  const enemy = clicker.enemy;
  const hpPct = enemy ? (enemy.hp / enemy.maxHp) * 100 : 0;
  const playerHpPct = (clicker.player.hp / clicker.player.maxHp) * 100;
  const sprite = enemy ? ENEMY_SPRITES[enemy.id] ?? '👾' : '👾';
  const clickDmg = clicker.getClickDamagePreview();
  const autoDps = clicker.getAutoDps();
  const attackTimerPct = Math.max(
    0,
    (clicker.enemyAttackTimer / clicker.getEnemyAttackInterval()) * 100,
  );

  return (
    <div className="screen clicker-screen">
      <header className="clicker-header">
        <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'GO_MENU' })}>
          ← {LOCALE.CLICKER_MENU}
        </button>
        <div className="clicker-header__stats">
          <span className="clicker-stat">
            <span className="clicker-stat__label">{LOCALE.CLICKER_LEVEL}</span>
            <span className="clicker-stat__value">{clicker.level}</span>
          </span>
          <span className="clicker-stat clicker-stat--gold">
            <span className="clicker-stat__label">{LOCALE.CLICKER_GOLD}</span>
            <span className="clicker-stat__value">{formatNum(clicker.gold)}</span>
          </span>
          {clicker.comboCount > 1 && (
            <span className="clicker-stat clicker-stat--combo">
              <span className="clicker-stat__label">{LOCALE.CLICKER_COMBO}</span>
              <span className="clicker-stat__value">×{clicker.comboCount}</span>
            </span>
          )}
        </div>
      </header>

      <main className="clicker-main">
        <section className="clicker-arena">
          <div className="clicker-journey panel">
            <p className="clicker-journey__act">{clicker.actLabel}</p>
            <p className="clicker-journey__lore">{clicker.actLore}</p>
          </div>

          {clicker.spawnLore && (
            <p className={`clicker-spawn-lore ${clicker.isBoss ? 'clicker-spawn-lore--boss' : clicker.isElite ? 'clicker-spawn-lore--elite' : ''}`}>
              {clicker.spawnLore}
            </p>
          )}

          {(clicker.isBoss || clicker.isElite) && (
            <div className={`clicker-banner clicker-banner--${clicker.isBoss ? 'boss' : 'elite'}`}>
              {clicker.isBoss ? LOCALE.CLICKER_BOSS : LOCALE.CLICKER_ELITE}
            </div>
          )}

          <div className="clicker-player-hp">
            <div className="clicker-hp-bar">
              <div className="clicker-hp-bar__fill clicker-hp-bar__fill--player" style={{ width: `${playerHpPct}%` }} />
            </div>
            <span className="clicker-hp-text">
              {Math.ceil(clicker.player.hp)} / {clicker.player.maxHp}
            </span>
          </div>

          {enemy && (
            <div className="clicker-enemy-wrap">
              <div className="clicker-enemy-intent">
                {enemy.getIntentLabel()} · {enemy.intentValue}
                <div className="clicker-attack-timer">
                  <div className="clicker-attack-timer__fill" style={{ width: `${attackTimerPct}%` }} />
                </div>
              </div>

              <button
                ref={enemyBtnRef}
                type="button"
                className="clicker-enemy-btn"
                onClick={handleAttack}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleAttack(e);
                }}
                aria-label={LOCALE.CLICKER_ATTACK}
              >
                <span ref={spriteRef} className="clicker-enemy-sprite">{sprite}</span>
                <span className="clicker-enemy-name">{enemy.name}</span>
              </button>

              {clicker.enemyLore && (
                <div className="clicker-enemy-lore panel">
                  <span className="clicker-enemy-lore__label">{LOCALE.CLICKER_ENEMY_LORE}</span>
                  <p>{clicker.enemyLore}</p>
                </div>
              )}

              <div className="clicker-enemy-hp">
                <div className="clicker-hp-bar">
                  <div className="clicker-hp-bar__fill clicker-hp-bar__fill--enemy" style={{ width: `${hpPct}%` }} />
                </div>
                <span className="clicker-hp-text">
                  {enemy.hp} / {enemy.maxHp}
                  {enemy.block > 0 && ` · блок ${enemy.block}`}
                </span>
              </div>
            </div>
          )}

          <div className="clicker-damage-stats">
            <span title={LOCALE.CLICKER_CLICK_DMG}>
              {LOCALE.CLICKER_CLICK_DMG}: {formatNum(clickDmg)}
            </span>
            {autoDps > 0 && (
              <span title={LOCALE.CLICKER_DPS}>
                {LOCALE.CLICKER_DPS}: {autoDps.toFixed(1)}
              </span>
            )}
            <span title={LOCALE.CLICKER_UPG_CRIT}>
              {LOCALE.CLICKER_UPG_CRIT}: {(clicker.getCritChance() * 100).toFixed(0)}%
            </span>
          </div>

          {clicker.whisper && (
            <p className="clicker-whisper">
              <span className="clicker-whisper__label">{LOCALE.CLICKER_WHISPER}</span>
              {clicker.whisper}
            </p>
          )}

          {clicker.lastLog && <p className="clicker-log">{clicker.lastLog}</p>}
        </section>

        <aside className="clicker-upgrades panel">
          <h3 className="clicker-upgrades__title">{LOCALE.CLICKER_UPGRADES}</h3>
          <p className="clicker-upgrades__sub">{LOCALE.CLICKER_UPGRADES_SUB}</p>
          <div className="clicker-upgrade-list">
            <UpgradeTier
              title={LOCALE.CLICKER_UPG_TIER_STARTER}
              upgrades={CLICKER_UPGRADES_BY_TIER.starter}
              clicker={clicker}
              dispatch={dispatch}
              formatNum={formatNum}
            />
            <UpgradeTier
              title={LOCALE.CLICKER_UPG_TIER_MID}
              upgrades={CLICKER_UPGRADES_BY_TIER.mid}
              clicker={clicker}
              dispatch={dispatch}
              formatNum={formatNum}
            />
            <UpgradeTier
              title={LOCALE.CLICKER_UPG_TIER_END}
              upgrades={CLICKER_UPGRADES_BY_TIER.endgame}
              clicker={clicker}
              dispatch={dispatch}
              formatNum={formatNum}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

function UpgradeTier({
  title,
  upgrades,
  clicker,
  dispatch,
  formatNum,
}: {
  title: string;
  upgrades: ClickerUpgradeDef[];
  clicker: NonNullable<ReturnType<typeof useGame>['run']['clicker']>;
  dispatch: ReturnType<typeof useGame>['dispatch'];
  formatNum: (n: number) => string;
}) {
  return (
    <div className="clicker-upgrade-tier">
      <h4 className="clicker-upgrade-tier__title">{title}</h4>
      {upgrades.map((upg) => {
        const level = clicker.getUpgradeLevel(upg.id);
        const owned = level >= upg.maxLevel;
        const cost = clicker.getUpgradeCost(upg.id);
        const canBuy = !owned && clicker.gold >= cost;
        return (
          <button
            key={upg.id}
            className={`clicker-upgrade ${canBuy ? 'clicker-upgrade--affordable' : ''} ${owned ? 'clicker-upgrade--maxed' : ''}`}
            disabled={owned || !canBuy}
            onClick={() => dispatch({ type: 'CLICKER_BUY_UPGRADE', id: upg.id })}
          >
            <span className="clicker-upgrade__icon">{upg.icon}</span>
            <span className="clicker-upgrade__info">
              <span className="clicker-upgrade__name">{upg.name}</span>
              <span className="clicker-upgrade__desc">{upg.description}</span>
            </span>
            <span className="clicker-upgrade__meta">
              {owned ? (
                <span className="clicker-upgrade__owned">{LOCALE.CLICKER_UPG_OWNED}</span>
              ) : (
                <span className="clicker-upgrade__cost">{formatNum(cost)}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ClickerMenuButton({
  onFire,
}: {
  onFire: (action: { type: 'BEGIN_CLICKER' } | { type: 'CONTINUE_CLICKER' }) => void;
}) {
  const { clickerSaveAvailable } = useGame();
  const summary = clickerSaveAvailable ? getClickerSaveSummary() : null;
  const best = getClickerBestLevel();

  return (
    <>
      {clickerSaveAvailable && summary && (
        <button
          className="btn btn--gold menu-continue"
          onClick={() => onFire({ type: 'CONTINUE_CLICKER' })}
        >
          {LOCALE.MENU_CLICKER_CONTINUE}
          <span className="menu-continue__meta">
            {LOCALE.CLICKER_LEVEL} {summary.level} · {summary.kills} {LOCALE.STAT_KILLS.toLowerCase()}
          </span>
        </button>
      )}
      <button className="btn" onClick={() => onFire({ type: 'BEGIN_CLICKER' })}>
        <span className="menu-btn__label">{LOCALE.MENU_CLICKER}</span>
        {best > 0 && (
          <span className="menu-continue__meta">
            {LOCALE.CLICKER_BEST}: {best}
          </span>
        )}
      </button>
    </>
  );
}
