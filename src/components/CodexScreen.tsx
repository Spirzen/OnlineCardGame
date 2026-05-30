import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { loadMetaCodexUnlocks } from '../game/metaCodex';
import {
  CODEX_BY_ID,
  CODEX_CATEGORY_LABELS,
  getCodexEntriesByCategory,
  type CodexCategory,
} from '../game/codex';

const CATEGORY_ORDER: CodexCategory[] = ['epic', 'hero', 'place', 'creature'];

function CodexEntryCard({ title, icon, body }: { title: string; icon: string; body: string }) {
  return (
    <article className="codex-entry panel">
      <div className="codex-entry__header">
        <span className="codex-entry__icon">{icon}</span>
        <h3 className="codex-entry__title">{title}</h3>
      </div>
      <p className="codex-entry__body">{body}</p>
    </article>
  );
}

export function CodexScreen() {
  const { run, dispatch } = useGame();
  const isBrowse = run.codexBrowseMode;
  const queue = run.codexDisplayQueue;
  const unlocked = run.codexMenuMode
    ? loadMetaCodexUnlocks()
    : run.unlockedCodexIds;

  const entriesToShow = isBrowse
    ? unlocked.map((id) => CODEX_BY_ID[id]).filter(Boolean)
    : queue;

  const grouped = getCodexEntriesByCategory(entriesToShow.map((e) => e.id));
  const backLabel = run.codexMenuMode ? LOCALE.CODEX_BACK_MENU : LOCALE.CODEX_BACK;

  return (
    <div className="screen codex-screen-wrap">
      <div className="codex-screen">
        <h2 className="title-display">
          {isBrowse ? LOCALE.CODEX_TITLE : LOCALE.CODEX_NEW_TITLE}
        </h2>
        {!isBrowse && queue.length > 0 && (
          <p className="codex-intro">
            {run.codexStoryReveal ? LOCALE.CODEX_STORY_INTRO : LOCALE.CODEX_INTRO}
          </p>
        )}
        {isBrowse && unlocked.length === 0 && (
          <p className="codex-empty">{LOCALE.CODEX_EMPTY_MENU}</p>
        )}

        <div className="codex-scroll">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <section key={cat} className="codex-section">
                <h3 className="codex-section__title">{CODEX_CATEGORY_LABELS[cat]}</h3>
                {items.map((entry) => (
                  <CodexEntryCard
                    key={entry.id}
                    title={entry.title}
                    icon={entry.icon}
                    body={entry.body}
                  />
                ))}
              </section>
            );
          })}
        </div>

        <div className="codex-actions">
          {isBrowse ? (
            <button className="btn btn--gold" onClick={() => dispatch({ type: 'DISMISS_CODEX' })}>
              {backLabel}
            </button>
          ) : (
            <button className="btn btn--gold" onClick={() => dispatch({ type: 'DISMISS_CODEX' })}>
              {run.codexStoryReveal ? LOCALE.CODEX_STORY_CONTINUE : LOCALE.CODEX_CONTINUE}
            </button>
          )}
        </div>

        <p className="codex-footer">
          {LOCALE.CODEX_FOOTER}{' '}
          <button
            type="button"
            className="codex-footer__link"
            onClick={() => dispatch({ type: 'OPEN_EPIC_NOVEL', from: 'codex' })}
          >
            {LOCALE.CODEX_OPEN_NOVEL}
          </button>
        </p>
      </div>
    </div>
  );
}
