import React from 'react';

// Deliberately supports only **bold**, *italic*, and `code` — not
// _underscore_ italics. Underscores show up inside snake_case identifiers
// and prop names in this blog's technical posts (e.g. `font-display`
// examples), and treating a mid-word `_..._` as emphasis would misfire on
// those; asterisks don't have that collision.
const INLINE_TOKEN_RE = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;

const inlineCodeCls =
  'px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-mono text-[0.9em]';

// Renders **bold**, *italic*, and `code` spans inside a single block of text
// (a paragraph, heading, or table cell) as React nodes. Block-level markdown
// (headings, tables) is handled one level up by textToBlocks/BlogBody — this
// only ever sees the text already inside one block.
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE_TOKEN_RE.lastIndex = 0;
  while ((match = INLINE_TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const [, boldItalic, bold, italic, code] = match;
    if (boldItalic !== undefined) {
      nodes.push(
        <strong key={key++}>
          <em>{boldItalic}</em>
        </strong>
      );
    } else if (bold !== undefined) {
      nodes.push(<strong key={key++}>{bold}</strong>);
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{italic}</em>);
    } else if (code !== undefined) {
      nodes.push(
        <code key={key++} className={inlineCodeCls}>
          {code}
        </code>
      );
    }

    lastIndex = INLINE_TOKEN_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
