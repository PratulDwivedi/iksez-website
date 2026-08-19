import { parseMarkdownTable, type BlogBlock, type TableAlign } from '@/lib/blogBody';
import { renderInlineMarkdown } from '@/lib/inlineMarkdown';

// Public-site renderer for website_blogs.body — a separate component from
// components/BlogBody.tsx (which the admin editor's Preview tab uses)
// because that one is styled in Tailwind for the admin console (admin.css
// loads Tailwind); the public marketing site does not, so this one targets
// the site's own .blog-post-body/.table classes instead. Both share the
// same block-parsing logic (lib/blogBody.ts, lib/inlineMarkdown.tsx).
export function PostBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-post-body">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h2 key={index}>{renderInlineMarkdown(block.text)}</h2>;
        }

        if (block.type === 'table') {
          const table = parseMarkdownTable(block.text);
          return (
            <div key={index} className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {table.header.map((cell, i) => (
                      <th key={i} className={alignClass(table.align[i])}>
                        {renderInlineMarkdown(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className={alignClass(table.align[cellIndex])}>
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
    </div>
  );
}

function alignClass(align: TableAlign): string | undefined {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  return undefined;
}
