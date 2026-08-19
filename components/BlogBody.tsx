'use client';

import React from 'react';
import { parseMarkdownTable, type BlogBlock, type TableAlign } from '@/lib/blogBody';
import { renderInlineMarkdown } from '@/lib/inlineMarkdown';

// Shared block renderer for website_blogs.body — used by both the live post
// page (BlogPostPage.tsx) and the admin editor's Preview tab (BlogForm.tsx),
// so the two never drift out of sync on how heading/paragraph/table blocks
// actually render.
export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h2 key={index} className="text-xl font-extrabold text-slate-900 dark:text-white pt-4">
              {renderInlineMarkdown(block.text)}
            </h2>
          );
        }

        if (block.type === 'table') {
          const table = parseMarkdownTable(block.text);
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900">
                    {table.header.map((cell, i) => (
                      <th
                        key={i}
                        className={`px-4 py-2.5 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 ${alignClass(table.align[i])}`}
                      >
                        {renderInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-4 py-2.5 align-top text-slate-700 dark:text-slate-300 ${alignClass(table.align[cellIndex])}`}
                        >
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(block.text)}</p>;
      })}
    </>
  );
}

function alignClass(align: TableAlign): string {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return 'text-left';
}
