// website_blogs.body is jsonb: [{"type":"paragraph"|"heading"|"table","text":"..."}]
// (see supabase/tables/website_blogs.sql). The admin editor represents this
// as one plain-text field, using the same "### " heading convention already
// used by BlogPostPage.tsx's renderer, so authors don't need a block editor
// for a two-post-a-month blog. Within paragraph/heading/table cell text,
// inline **bold**, *italic*, and `code` spans are supported at render time
// (see src/lib/inlineMarkdown.tsx) — the block text itself is stored with
// that markdown syntax intact, not pre-rendered.

export interface BlogBlock {
  type: 'paragraph' | 'heading' | 'table';
  text: string;
}

export function blocksToText(blocks: BlogBlock[] | null | undefined): string {
  if (!blocks?.length) return '';
  return blocks
    .map((b) => (b.type === 'heading' ? `### ${b.text}` : b.text))
    .join('\n\n');
}

// A chunk is a GFM-style pipe table if its second non-empty line is a
// separator row (dashes, optionally with leading/trailing colons for
// alignment, one per column) — e.g. "|---|:---:|---:|". This mirrors GFM's
// own table detection so authors can paste a standard markdown table as-is.
const TABLE_SEPARATOR_RE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

function isMarkdownTable(chunk: string): boolean {
  const lines = chunk
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return false;
  if (!lines[0].includes('|')) return false;
  return TABLE_SEPARATOR_RE.test(lines[1]);
}

export function textToBlocks(text: string): BlogBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): BlogBlock => {
      if (chunk.startsWith('### ')) {
        return { type: 'heading', text: chunk.slice(4).trim() };
      }
      if (isMarkdownTable(chunk)) {
        return { type: 'table', text: chunk };
      }
      return { type: 'paragraph', text: chunk };
    });
}

export type TableAlign = 'left' | 'center' | 'right' | null;

export interface ParsedTable {
  header: string[];
  align: TableAlign[];
  rows: string[][];
}

function splitTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((cell) => cell.trim());
}

function parseAlign(cell: string): TableAlign {
  const left = cell.startsWith(':');
  const right = cell.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return null;
}

// Parses a raw table block's text (as stored by textToBlocks above) into
// header/align/rows for rendering. Only called on blocks already tagged
// type: 'table', so the shape is assumed valid.
export function parseMarkdownTable(text: string): ParsedTable {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const header = splitTableRow(lines[0]);
  const align = splitTableRow(lines[1]).map(parseAlign);
  const rows = lines.slice(2).map(splitTableRow);
  return { header, align, rows };
}
