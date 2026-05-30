import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { LOCALE } from '../game/locale';
import { NOVEL_SECTIONS, NOVEL_TITLE } from '../game/epicNovel';
import { NovelProse } from './NovelProse';

export function EpicNovelScreen() {
  const { run, dispatch } = useGame();
  const [sectionId, setSectionId] = useState(NOVEL_SECTIONS[0]?.id ?? 'prolog');
  const contentRef = useRef<HTMLElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  const sectionIndex = NOVEL_SECTIONS.findIndex((s) => s.id === sectionId);
  const section = NOVEL_SECTIONS[sectionIndex] ?? NOVEL_SECTIONS[0];
  const hasPrev = sectionIndex > 0;
  const hasNext = sectionIndex >= 0 && sectionIndex < NOVEL_SECTIONS.length - 1;

  const backLabel =
    run.epicNovelReturnScreen === 'codex' ? LOCALE.NOVEL_BACK_CODEX : LOCALE.NOVEL_BACK_MENU;

  const goToSection = useCallback((id: string) => {
    setSectionId(id);
    setReadProgress(0);
  }, []);

  const updateProgress = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setReadProgress(max > 0 ? el.scrollTop / max : 1);
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.scrollTop = 0;
    setReadProgress(0);
    updateProgress();
  }, [sectionId, updateProgress]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateProgress, { passive: true });
    return () => el.removeEventListener('scroll', updateProgress);
  }, [sectionId, updateProgress]);

  if (!section) return null;

  return (
    <div className="screen epic-novel-screen">
      <div className="epic-novel">
        <header className="epic-novel__header">
          <h2 className="title-display epic-novel__title">{NOVEL_TITLE}</h2>
          <p className="epic-novel__subtitle">{LOCALE.NOVEL_SUBTITLE}</p>
        </header>

        <div className="epic-novel__layout">
          <nav className="epic-novel__nav panel" aria-label={LOCALE.NOVEL_CHAPTERS}>
            <p className="epic-novel__nav-label">{LOCALE.NOVEL_CHAPTERS}</p>
            {NOVEL_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`epic-novel__nav-btn ${s.id === sectionId ? 'epic-novel__nav-btn--active' : ''}`}
                onClick={() => goToSection(s.id)}
              >
                <span className="epic-novel__nav-btn-text">{s.title}</span>
              </button>
            ))}
          </nav>

          <article className="epic-novel__reader panel">
            <div className="epic-novel__reader-head">
              <h3 className="epic-novel__chapter-title">{section.title}</h3>
              <span className="epic-novel__chapter-meta">
                {sectionIndex + 1} / {NOVEL_SECTIONS.length}
              </span>
            </div>

            <div className="epic-novel__progress" aria-hidden="true">
              <div
                className="epic-novel__progress-fill"
                style={{ width: `${Math.round(readProgress * 100)}%` }}
              />
            </div>

            <section ref={contentRef} className="epic-novel__content">
              <NovelProse body={section.body} />
            </section>

            <div className="epic-novel__chapter-nav">
              <button
                type="button"
                className="btn btn--ghost btn--sm epic-novel__chapter-btn"
                disabled={!hasPrev}
                onClick={() => hasPrev && goToSection(NOVEL_SECTIONS[sectionIndex - 1].id)}
              >
                {hasPrev
                  ? `← ${NOVEL_SECTIONS[sectionIndex - 1].title}`
                  : '←'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm epic-novel__chapter-btn epic-novel__chapter-btn--next"
                disabled={!hasNext}
                onClick={() => hasNext && goToSection(NOVEL_SECTIONS[sectionIndex + 1].id)}
              >
                {hasNext
                  ? `${NOVEL_SECTIONS[sectionIndex + 1].title} →`
                  : '→'}
              </button>
            </div>
          </article>
        </div>

        <footer className="epic-novel__footer">
          <button
            className="btn btn--gold"
            type="button"
            onClick={() => dispatch({ type: 'CLOSE_EPIC_NOVEL' })}
          >
            {backLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
