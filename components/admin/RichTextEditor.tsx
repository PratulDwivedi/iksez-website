'use client';

import React from 'react';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from 'lucide-react';

// WYSIWYG HTML editor for CMS page bodies (website_nav_items.body_html).
// Output is plain HTML; the public page sanitizes it again before rendering
// (lib/sanitizePageHtml.ts), so the toolbar only offers what that allows.
// "HTML" switches to a raw-source textarea for pasting or fine-tuning markup.
//
// `value` only seeds the editor, and every edit is reported through
// onChange. To load different content (another nav item was selected), the
// parent remounts it with a new React `key`.

const inputCls =
  'w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[12px] focus:outline-none focus:border-primary-500';

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write the page content…',
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [mode, setMode] = React.useState<'visual' | 'html'>('visual');
  const [source, setSource] = React.useState(value);
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // Link defaults every link to target="_blank"; here that's opt-in
        // per link (the popover's "Open in new tab").
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      TableKit.configure({ table: { resizable: false } }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    // Rendered inside a Client Component that's still server-rendered once.
    immediatelyRender: false,
    editorProps: { attributes: { class: 'rte-content' } },
    onUpdate: ({ editor }) => onChangeRef.current(editor.isEmpty ? '' : editor.getHTML()),
  });

  function switchMode(next: 'visual' | 'html') {
    if (!editor || next === mode) return;
    if (next === 'html') {
      setSource(editor.isEmpty ? '' : editor.getHTML());
    } else {
      editor.commands.setContent(source, { emitUpdate: false });
      onChange(editor.isEmpty ? '' : editor.getHTML());
    }
    setMode(next);
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {editor && mode === 'visual' && <Toolbar editor={editor} />}
        <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
          {(['visual', 'html'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                mode === m ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {m === 'visual' ? 'Visual' : 'HTML'}
            </button>
          ))}
        </div>
      </div>
      {mode === 'visual' ? (
        <div className="px-4 py-3 bg-white dark:bg-slate-950">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <textarea
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            onChange(e.target.value);
          }}
          spellCheck={false}
          className="block w-full min-h-[18rem] px-4 py-3 bg-white dark:bg-slate-950 font-mono text-[12px] leading-relaxed focus:outline-none"
        />
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive('paragraph'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      link: e.isActive('link'),
      linkHref: (e.getAttributes('link').href as string | undefined) ?? '',
      linkNewTab: e.getAttributes('link').target === '_blank',
      table: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const [popover, setPopover] = React.useState<'link' | 'image' | null>(null);
  const chain = () => editor.chain().focus();

  return (
    <>
      <ToolButton label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()}>
        <Pilcrow />
      </ToolButton>
      <ToolButton label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <Heading2 />
      </ToolButton>
      <ToolButton label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <Heading3 />
      </ToolButton>
      <Divider />
      <ToolButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold />
      </ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic />
      </ToolButton>
      <ToolButton label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline />
      </ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough />
      </ToolButton>
      <ToolButton label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}>
        <Code2 />
      </ToolButton>
      <Divider />
      <ToolButton label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        <List />
      </ToolButton>
      <ToolButton label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered />
      </ToolButton>
      <ToolButton label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        <Quote />
      </ToolButton>
      <ToolButton label="Divider line" onClick={() => chain().setHorizontalRule().run()}>
        <Minus />
      </ToolButton>
      <Divider />
      <div className="relative">
        <ToolButton label="Link" active={state.link || popover === 'link'} onClick={() => setPopover(popover === 'link' ? null : 'link')}>
          <Link2 />
        </ToolButton>
        {popover === 'link' && (
          <LinkPopover
            initialHref={state.linkHref}
            initialNewTab={state.linkNewTab}
            hasLink={state.link}
            onApply={(href, newTab) => {
              chain()
                .extendMarkRange('link')
                .setLink({ href, target: newTab ? '_blank' : null, rel: newTab ? 'noopener noreferrer' : null })
                .run();
              setPopover(null);
            }}
            onRemove={() => {
              chain().extendMarkRange('link').unsetLink().run();
              setPopover(null);
            }}
            onClose={() => setPopover(null)}
          />
        )}
      </div>
      <div className="relative">
        <ToolButton label="Image" active={popover === 'image'} onClick={() => setPopover(popover === 'image' ? null : 'image')}>
          <ImageIcon />
        </ToolButton>
        {popover === 'image' && (
          <ImagePopover
            onApply={(src, alt) => {
              chain().setImage({ src, alt }).run();
              setPopover(null);
            }}
            onClose={() => setPopover(null)}
          />
        )}
      </div>
      <ToolButton
        label="Insert table"
        active={state.table}
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <TableIcon />
      </ToolButton>
      {state.table && (
        <>
          <TextButton onClick={() => chain().addRowAfter().run()}>+ Row</TextButton>
          <TextButton onClick={() => chain().addColumnAfter().run()}>+ Col</TextButton>
          <TextButton onClick={() => chain().deleteRow().run()}>− Row</TextButton>
          <TextButton onClick={() => chain().deleteColumn().run()}>− Col</TextButton>
          <TextButton onClick={() => chain().deleteTable().run()}>Delete table</TextButton>
        </>
      )}
      <Divider />
      <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 />
      </ToolButton>
      <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 />
      </ToolButton>
    </>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection: a mousedown on the button would blur it.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-30 [&_svg]:w-3.5 [&_svg]:h-3.5 ${
        active
          ? 'bg-primary-600/10 text-primary-700 dark:text-primary-400'
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function TextButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="px-1.5 py-1 rounded-md text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />;
}

function Popover({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 top-full z-20 mt-1 w-72 space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-lg"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {children}
    </div>
  );
}

function LinkPopover({
  initialHref,
  initialNewTab,
  hasLink,
  onApply,
  onRemove,
  onClose,
}: {
  initialHref: string;
  initialNewTab: boolean;
  hasLink: boolean;
  onApply: (href: string, newTab: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [href, setHref] = React.useState(initialHref);
  const [newTab, setNewTab] = React.useState(initialNewTab);
  const apply = () => (href.trim() ? onApply(href.trim(), newTab) : onRemove());
  return (
    <Popover onClose={onClose}>
      <input
        autoFocus
        value={href}
        onChange={(e) => setHref(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            apply();
          }
        }}
        placeholder="/contact-us/ or https://…"
        className={inputCls}
      />
      <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="rounded" />
        Open in new tab
      </label>
      <div className="flex justify-end gap-2">
        {hasLink && (
          <button type="button" onClick={onRemove} className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-500/10">
            Remove
          </button>
        )}
        <button type="button" onClick={apply} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary-600 text-white hover:bg-primary-500">
          Apply
        </button>
      </div>
    </Popover>
  );
}

function ImagePopover({ onApply, onClose }: { onApply: (src: string, alt: string) => void; onClose: () => void }) {
  const [src, setSrc] = React.useState('');
  const [alt, setAlt] = React.useState('');
  return (
    <Popover onClose={onClose}>
      <p className="text-[11px] text-slate-500">Paste an image URL, e.g. copied from Media.</p>
      <input autoFocus value={src} onChange={(e) => setSrc(e.target.value)} placeholder="https://…" className={inputCls} />
      <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (describe the image)" className={inputCls} />
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!/^https?:\/\//i.test(src.trim())}
          onClick={() => onApply(src.trim(), alt.trim())}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary-600 text-white hover:bg-primary-500 disabled:opacity-50"
        >
          Insert image
        </button>
      </div>
    </Popover>
  );
}
