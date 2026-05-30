export type NovelBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'dialogue'; text: string }
  | { type: 'divider' };

function endsSentence(line: string): boolean {
  return /[.!?»…"«]\s*$/.test(line.trim());
}

function startsNewBlock(line: string): boolean {
  return /^[A-ZА-ЯЁ«"(-]/.test(line);
}

/** Разбивает сырой текст главы на абзацы, реплики и орнаменты. */
export function parseNovelBlocks(body: string): NovelBlock[] {
  const blocks: NovelBlock[] = [];
  let paragraph = '';

  const flushParagraph = () => {
    const text = paragraph.trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraph = '';
  };

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }
    if (line === '*') {
      flushParagraph();
      blocks.push({ type: 'divider' });
      continue;
    }

    const dialogueMatch = line.match(/^[-—–]\s*(.+)$/);
    if (dialogueMatch) {
      flushParagraph();
      blocks.push({ type: 'dialogue', text: dialogueMatch[1].trim() });
      continue;
    }

    if (paragraph) {
      if (endsSentence(paragraph) || startsNewBlock(line)) {
        flushParagraph();
        paragraph = line;
      } else {
        paragraph += ` ${line}`;
      }
    } else {
      paragraph = line;
    }
  }

  flushParagraph();
  return blocks;
}
