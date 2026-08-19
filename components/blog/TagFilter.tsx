'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search, X } from 'lucide-react';

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
}

// The rest of /blog/'s filter bar (category tabs, search box) is plain
// links/forms — no client JS required, every view a real crawlable URL (see
// app/(marketing)/blog/page.tsx). A type-to-search dropdown needs local UI
// state that plain links can't give us, so this one piece is a client
// component; it still drives the same URL query-param model (tags=) so the
// result stays bookmarkable/shareable.
export function TagFilter({ allTags, selectedTags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (allTags.length === 0) return null;

  const filteredTags = allTags.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  function applyTags(next: string[]) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('page');
    if (next.length > 0) {
      sp.set('tags', next.join(','));
    } else {
      sp.delete('tags');
    }
    router.push(`/blog/?${sp.toString()}`);
  }

  function toggleTag(tag: string) {
    applyTags(
      selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
    );
  }

  return (
    <div ref={containerRef} className="blog-tagfilter">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`blog-tagfilter__btn${selectedTags.length > 0 ? ' has-selection' : ''}`}
      >
        <span className="truncate">
          {selectedTags.length > 0 ? `Tags (${selectedTags.length})` : 'Filter by tag'}
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="blog-tagfilter__panel">
          <div className="blog-tagfilter__search">
            <Search size={13} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tags..."
              autoFocus
            />
          </div>

          <div className="blog-tagfilter__list">
            {filteredTags.length === 0 ? (
              <p className="blog-tagfilter__empty">No tags match.</p>
            ) : (
              filteredTags.map((tag) => (
                <label key={tag} className="blog-tagfilter__item">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  <span className="truncate">{tag}</span>
                </label>
              ))
            )}
          </div>

          {selectedTags.length > 0 && (
            <button type="button" onClick={() => applyTags([])} className="blog-tagfilter__clear">
              <X size={12} /> Clear tags
            </button>
          )}
        </div>
      )}
    </div>
  );
}
