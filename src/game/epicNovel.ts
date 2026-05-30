import novelRaw from '../data/epic-novel.txt?raw';

export const NOVEL_TITLE = 'Бессмертная земля';

export interface NovelSection {
  id: string;
  title: string;
  body: string;
}

function slugForTitle(title: string): string {
  if (title === 'Пролог') return 'prolog';
  const m = title.match(/^Глава (\d+)$/);
  if (m) return `chapter-${m[1]}`;
  return title.toLowerCase().replace(/\s+/g, '-');
}

function parseNovel(text: string): NovelSection[] {
  const sections: NovelSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  const flush = () => {
    const body = currentLines.join('\n').trim();
    if (currentTitle && body) {
      sections.push({
        id: slugForTitle(currentTitle),
        title: currentTitle,
        body,
      });
    }
  };

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === NOVEL_TITLE) continue;
    if (trimmed === 'Пролог' || /^Глава \d+$/.test(trimmed)) {
      flush();
      currentTitle = trimmed;
      currentLines = [];
    } else if (currentTitle) {
      currentLines.push(line);
    }
  }
  flush();
  return sections;
}

export const NOVEL_SECTIONS = parseNovel(novelRaw);

export function getNovelSection(id: string): NovelSection | undefined {
  return NOVEL_SECTIONS.find((s) => s.id === id);
}
