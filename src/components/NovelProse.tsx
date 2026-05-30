import { useMemo } from 'react';
import { parseNovelBlocks } from '../game/novelFormat';

interface NovelProseProps {
  body: string;
}

export function NovelProse({ body }: NovelProseProps) {
  const blocks = useMemo(() => parseNovelBlocks(body), [body]);

  let leadUsed = false;

  return (
    <div className="novel-prose" lang="ru">
      {blocks.map((block, index) => {
        if (block.type === 'divider') {
          return (
            <div key={index} className="novel-prose__divider" aria-hidden="true">
              <span className="novel-prose__divider-line" />
              <span className="novel-prose__divider-glyph">✦</span>
              <span className="novel-prose__divider-line" />
            </div>
          );
        }

        if (block.type === 'dialogue') {
          return (
            <p key={index} className="novel-prose__dialogue">
              {block.text}
            </p>
          );
        }

        const isLead = !leadUsed;
        if (isLead) leadUsed = true;

        return (
          <p
            key={index}
            className={`novel-prose__paragraph${isLead ? ' novel-prose__paragraph--lead' : ''}`}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
