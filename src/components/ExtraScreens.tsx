import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { CLASSES } from '../game/classes';
import { LOCALE } from '../game/locale';
import { sfx } from '../game/sfx';
import { CardView } from './CardView';
import { Card } from '../game/card';
import { loadCustomCards, addCustomCard, deleteCustomCard } from '../game/customCards';

export function ClassSelectScreen() {
  const { run, dispatch } = useGame();

  return (
    <div className="screen center-content">
      <h2 className="title-display">{LOCALE.CLASS_TITLE}</h2>
      {run.isDailyRun && <p className="subtitle">{LOCALE.DAILY_SEED}: {run.runSeed}</p>}
      <div className="class-grid">
        {CLASSES.map((cls) => (
          <button
            key={cls.id}
            className="class-card panel"
            onClick={() => {
              sfx.click();
              dispatch({ type: 'SELECT_CLASS', classId: cls.id });
            }}
          >
            <div className="class-card__icon">{cls.icon}</div>
            <h3>{cls.name}</h3>
            <p>{cls.description}</p>
            <div className="class-card__stats">❤ {cls.hp} · ⚡ {cls.energy} · 🪙 {cls.gold}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RelicPickScreen() {
  const { run, dispatch } = useGame();

  return (
    <div className="screen center-content">
      <h2 className="title-display">{LOCALE.RELIC_PICK_TITLE}</h2>
      <p className="subtitle">{LOCALE.RELIC_PICK_SUB}</p>
      <div className="relic-grid">
        {run.relicPickOptions.map((relic, i) => (
          <button
            key={relic.id + i}
            className="relic-card panel"
            onClick={() => {
              sfx.click();
              dispatch({ type: 'PICK_STARTER_RELIC', index: i });
            }}
          >
            <h3>{relic.name}</h3>
            <p>{relic.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatsScreen() {
  const { run, dispatch } = useGame();
  const s = run.stats;

  return (
    <div className="screen center-content">
      <h2 className="title-display">{LOCALE.STATS_TITLE}</h2>
      <div className="panel menu-stats" style={{ minWidth: 360 }}>
        <div className="menu-stat"><div className="menu-stat__value">{s.totalRuns}</div><div className="menu-stat__label">{LOCALE.STAT_RUNS}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{s.totalWins}</div><div className="menu-stat__label">{LOCALE.STAT_WINS}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{s.bestFloor}</div><div className="menu-stat__label">{LOCALE.STAT_BEST_FLOOR}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{s.dailyBestFloor}</div><div className="menu-stat__label">{LOCALE.STAT_DAILY_BEST}</div></div>
        <div className="menu-stat"><div className="menu-stat__value">{s.totalKills}</div><div className="menu-stat__label">{LOCALE.STAT_KILLS}</div></div>
      </div>
      {s.leaderboard.length > 0 && (
        <div className="leaderboard panel">
          <h3>{LOCALE.LEADERBOARD}</h3>
          {s.leaderboard.map((e, i) => (
            <div key={i} className="leaderboard__row">
              <span>#{i + 1}</span>
              <span>{LOCALE.MAP_FLOOR} {e.floor}</span>
              <span>{e.kills} ⚔</span>
              <span>{e.classId}</span>
              {e.daily && <span className="badge-daily">daily</span>}
            </div>
          ))}
        </div>
      )}
      <button className="btn btn--gold" onClick={() => dispatch({ type: 'GO_MENU' })}>{LOCALE.BACK_TO_MENU}</button>
    </div>
  );
}

export function SmithScreen() {
  const { run, dispatch } = useGame();

  return (
    <div className="screen center-content">
      <h2 className="title-display">{LOCALE.SMITH_TITLE}</h2>
      <p className="subtitle">{LOCALE.SMITH_CHOOSE}</p>
      <div className="card-grid">
        {run.smithCards.map((card, i) => (
          <CardView key={i} card={card} variant="reward" onClick={() => dispatch({ type: 'SMITH_UPGRADE', index: i })} />
        ))}
      </div>
      <button className="btn btn--ghost" onClick={() => dispatch({ type: 'GO_MAP' })}>{LOCALE.SMITH_SKIP}</button>
    </div>
  );
}

export function CardEditorScreen() {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cost, setCost] = useState(1);
  const [value, setValue] = useState(6);
  const [type, setType] = useState<'attack' | 'block' | 'buff' | 'draw'>('attack');
  const [refresh, setRefresh] = useState(0);
  void refresh;
  const custom = loadCustomCards();

  const handleAdd = () => {
    if (!name.trim()) return;
    addCustomCard({ name, description: desc, cost, value, type });
    setName('');
    setDesc('');
    setRefresh((r) => r + 1);
  };

  return (
    <div className="screen center-content screen--scroll">
      <h2 className="title-display">{LOCALE.EDITOR_TITLE}</h2>
      <div className="editor-form panel">
        <input className="input" placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="attack">Атака</option>
          <option value="block">Защита</option>
          <option value="buff">Бафф</option>
          <option value="draw">Добор</option>
        </select>
        <div className="editor-form__nums">
          <label>Cost <input type="number" min={0} max={10} value={cost} onChange={(e) => setCost(+e.target.value)} className="input input--sm" /></label>
          <label>Value <input type="number" min={0} value={value} onChange={(e) => setValue(+e.target.value)} className="input input--sm" /></label>
        </div>
        <button className="btn btn--gold" onClick={handleAdd}>{LOCALE.EDITOR_ADD}</button>
      </div>
      <div className="deck-grid">
        {custom.map((c) => (
          <div key={c.id} className="editor-card-wrap">
            <CardView card={new Card(c)} variant="shop" playable={false} />
            <button className="btn btn--ghost btn--sm" onClick={() => { deleteCustomCard(c.id); setRefresh((r) => r + 1); }}>✕</button>
          </div>
        ))}
      </div>
      <button className="btn" onClick={() => dispatch({ type: 'GO_MENU' })}>{LOCALE.BACK_TO_MENU}</button>
    </div>
  );
}
