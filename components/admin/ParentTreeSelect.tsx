'use client';

import React from 'react';
import { Check, ChevronDown, ChevronRight, FileText, Home, Link2, Search } from 'lucide-react';
import type { AdminNavItem } from '@/lib/adminNav';

// Searchable tree dropdown for picking a navigation item's parent.
//
// Offers every item except documents (they can't have children) and the
// ids in `excluded` (when editing: the item itself and its descendants, so
// it can't be moved under itself). Typing filters to matching items plus
// their ancestors, all expanded, so a match is always shown in context.
//
// Keyboard: ↑/↓ move, → expands, ← collapses (or goes to the parent),
// Enter picks, Esc closes.

interface TreeNode {
  item: AdminNavItem;
  children: TreeNode[];
}

// A row as rendered: `id` null is the "Top level" choice.
interface Row {
  id: number | null;
  title: string;
  depth: number;
  kind: AdminNavItem['kind'] | null;
  hasChildren: boolean;
  expanded: boolean;
  parentId: number | null;
}

const TOP_LEVEL_LABEL = 'Top level (header bar)';

function buildTree(items: AdminNavItem[], excluded: Set<number>): TreeNode[] {
  const eligible = items.filter((item) => item.kind !== 'document' && !excluded.has(item.id));
  const byParent = new Map<number | null, AdminNavItem[]>();
  for (const item of eligible) {
    const list = byParent.get(item.parent_id) ?? [];
    list.push(item);
    byParent.set(item.parent_id, list);
  }
  const build = (parentId: number | null): TreeNode[] =>
    (byParent.get(parentId) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
      .map((item) => ({ item, children: build(item.id) }));
  return build(null);
}

function ancestorIds(id: number | null, byId: Map<number, AdminNavItem>): number[] {
  const ids: number[] = [];
  let current = id === null ? undefined : byId.get(id);
  while (current?.parent_id != null) {
    ids.push(current.parent_id);
    current = byId.get(current.parent_id);
  }
  return ids;
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-amber-200/70 dark:bg-amber-500/30 text-inherit">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
}

export function ParentTreeSelect({
  id,
  items,
  value,
  excluded,
  onChange,
}: {
  id?: string;
  items: AdminNavItem[];
  value: number | null;
  excluded: Set<number>;
  onChange: (parentId: number | null) => void;
}) {
  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const tree = React.useMemo(() => buildTree(items, excluded), [items, excluded]);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState<Set<number>>(() => new Set());
  // -1 = "the selected row" (where the panel starts on opening), resolved
  // against the rows below.
  const [activeState, setActiveIndex] = React.useState(-1);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const listId = React.useId();

  const trimmed = query.trim();

  // With a query: matches plus their ancestors, everything expanded.
  // Without: the tree, honoring the user's expand/collapse state.
  const rows = React.useMemo<Row[]>(() => {
    const out: Row[] = [];
    const needle = trimmed.toLowerCase();
    const matches = (node: TreeNode): boolean =>
      node.item.title.toLowerCase().includes(needle) ||
      node.item.slug.includes(needle) ||
      node.children.some(matches);

    if (!needle || TOP_LEVEL_LABEL.toLowerCase().includes(needle)) {
      out.push({ id: null, title: TOP_LEVEL_LABEL, depth: 0, kind: null, hasChildren: false, expanded: false, parentId: null });
    }
    const walk = (nodes: TreeNode[], depth: number) => {
      for (const node of nodes) {
        if (needle && !matches(node)) continue;
        const isExpanded = needle ? true : expanded.has(node.item.id);
        out.push({
          id: node.item.id,
          title: node.item.title,
          depth,
          kind: node.item.kind,
          hasChildren: node.children.length > 0,
          expanded: isExpanded,
          parentId: node.item.parent_id,
        });
        if (isExpanded) walk(node.children, depth + 1);
      }
    };
    walk(tree, 0);
    return out;
  }, [tree, expanded, trimmed]);

  const selectedIndex = rows.findIndex((row) => row.id === value);
  const activeIndex = activeState === -1 ? Math.max(selectedIndex, 0) : activeState;

  const selectedPath =
    value === null
      ? TOP_LEVEL_LABEL
      : [...ancestorIds(value, byId).reverse(), value]
          .map((ancestor) => byId.get(ancestor)?.title ?? '…')
          .join(' › ');

  function openPanel() {
    // Reveal the current parent: expand its ancestors and start on its row.
    const reveal = new Set(expanded);
    for (const ancestor of ancestorIds(value, byId)) reveal.add(ancestor);
    setExpanded(reveal);
    setQuery('');
    setActiveIndex(-1);
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function pick(row: Row) {
    onChange(row.id);
    close();
  }

  function toggle(itemId: number, force?: boolean) {
    setExpanded((prev) => {
      const next = new Set(prev);
      const shouldExpand = force ?? !next.has(itemId);
      if (shouldExpand) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }

  // Close on a click anywhere outside.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the active row visible while moving with the keyboard.
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function onKeyDown(e: React.KeyboardEvent) {
    const row = rows[activeIndex];
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(Math.min(activeIndex + 1, rows.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(Math.max(activeIndex - 1, 0));
        break;
      case 'ArrowRight':
        if (row?.id != null && row.hasChildren && !row.expanded && !trimmed) {
          e.preventDefault();
          toggle(row.id, true);
        }
        break;
      case 'ArrowLeft':
        if (row?.id != null && !trimmed) {
          e.preventDefault();
          if (row.hasChildren && row.expanded) toggle(row.id, false);
          else if (row.parentId !== null) setActiveIndex(rows.findIndex((r) => r.id === row.parentId));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (row) pick(row);
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="tree"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openPanel())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openPanel();
          }
        }}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] text-left focus:outline-none focus:border-primary-500 transition"
      >
        {value === null ? (
          <Home className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        ) : (
          <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        )}
        <span className="min-w-0 flex-1 truncate">{selectedPath}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-80 min-w-full max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="relative border-b border-slate-100 dark:border-slate-800 p-2">
            <Search className="w-3.5 h-3.5 absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search pages and links…"
              role="combobox"
              aria-controls={listId}
              aria-expanded
              aria-activedescendant={rows[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500"
            />
          </div>

          <ul ref={listRef} id={listId} role="tree" className="max-h-72 overflow-y-auto p-1.5">
            {rows.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-500">No page or link matches.</li>}
            {rows.map((row, index) => {
              const isSelected = row.id === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={row.id ?? 'top'}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="treeitem"
                  aria-level={row.depth + 1}
                  aria-selected={isSelected}
                  aria-expanded={row.hasChildren ? row.expanded : undefined}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(row)}
                  className={`flex items-center gap-1.5 rounded-lg py-1.5 pr-2 text-[13px] cursor-pointer ${
                    isActive ? 'bg-slate-100 dark:bg-slate-800' : ''
                  } ${isSelected ? 'font-bold text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}
                  style={{ paddingLeft: `${row.depth * 18 + 6}px` }}
                >
                  {row.hasChildren && !trimmed ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={row.expanded ? 'Collapse' : 'Expand'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (row.id !== null) toggle(row.id);
                      }}
                      className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${row.expanded ? 'rotate-90' : ''}`} />
                    </button>
                  ) : (
                    <span className="w-[18px] shrink-0" />
                  )}
                  <span className="shrink-0 text-slate-400">
                    {row.kind === null ? (
                      <Home className="w-3.5 h-3.5" />
                    ) : row.kind === 'link' ? (
                      <Link2 className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <Highlight text={row.title} query={trimmed} />
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
