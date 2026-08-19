'use client';

import React from 'react';
import {
  Search,
  X,
  Filter,
  Download,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Reusable data table — same feature set as artificial-wit-web-apps'
// DynamicReportTable.tsx (search, per-column filters, sortable columns,
// paging, CSV/XLS export), reimplemented with plain typed props instead of
// that codebase's schema-driven control/binding system (PageSection,
// binding_name, control_type_id, etc. don't exist here — this site has no
// dynamic page builder). Same interaction pattern, not the same code.
//
// XLS export lazy-loads the `xlsx` package (SheetJS) client-side only, and
// only ever WRITES a workbook from our own already-trusted row data — never
// parses an uploaded/untrusted file. package.json pins `xlsx` to SheetJS's
// own CDN build (cdn.sheetjs.com), not the npm registry — the registry copy
// (0.18.5) is years stale and carries known high-severity CVEs (prototype
// pollution, ReDoS) that SheetJS fixed but never republished to npm; the CDN
// build is their actual current release. If a parse/import feature is ever
// added on top of this package, re-verify the installed version still covers
// those CVEs before trusting it with untrusted input.
export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
  render?: (row: T) => React.ReactNode;
  numeric?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  minWidth?: number;
}

type SortDir = 'asc' | 'desc';
const PAGE_SIZES = [10, 25, 50, 100];

function cellStr(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-lg px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-slate-400">
          {start}–{end} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="px-1">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`min-w-[22px] h-[22px] rounded-lg text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  exportFileName = 'export',
  emptyMessage = 'No records found.',
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  exportFileName?: string;
  emptyMessage?: string;
}) {
  const [search, setSearch] = React.useState('');
  const [colFilters, setColFilters] = React.useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortKey, setSortKey] = React.useState('');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    setPage(1);
  }, [search, colFilters, sortKey, sortDir, pageSize]);

  const processed = React.useMemo(() => {
    let data = [...rows];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((row) => columns.some((col) => cellStr(col.accessor(row)).toLowerCase().includes(q)));
    }

    for (const [key, val] of Object.entries(colFilters)) {
      if (!val.trim()) continue;
      const col = columns.find((c) => c.key === key);
      if (!col) continue;
      const q = val.toLowerCase();
      data = data.filter((row) => cellStr(col.accessor(row)).toLowerCase().includes(q));
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col) {
        data.sort((a, b) => {
          const av = cellStr(col.accessor(a));
          const bv = cellStr(col.accessor(b));
          const an = Number(av);
          const bn = Number(bv);
          const cmp = !isNaN(an) && !isNaN(bn) && av !== '' && bv !== '' ? an - bn : av.localeCompare(bv);
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }

    return data;
  }, [rows, search, colFilters, sortKey, sortDir, columns]);

  const totalRecords = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pageRows = processed.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey('');
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function updateColFilter(key: string, val: string) {
    setColFilters((f) => ({ ...f, [key]: val }));
  }

  const activeFilterCount = Object.values(colFilters).filter((v) => v.trim()).length;
  const filtersActive = search.trim() !== '' || activeFilterCount > 0;

  function exportCSV() {
    const headers = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`);
    const csvRows = [
      headers.join(','),
      ...processed.map((row) =>
        columns
          .map((col) => {
            const str = cellStr(col.accessor(row));
            return str.includes(',') || str.includes('\n') || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportXLS() {
    const XLSX = await import('xlsx');
    const wsData = [
      columns.map((c) => c.header),
      ...processed.map((row) =>
        columns.map((col) => {
          const val = col.accessor(row);
          if (val == null) return '';
          if (typeof val === 'boolean') return cellStr(val);
          const n = Number(val);
          return !isNaN(n) && String(val).trim() !== '' ? n : cellStr(val);
        })
      ),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {filtersActive && (
          <button
            onClick={() => {
              setSearch('');
              setColFilters({});
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-500'
              : 'border-slate-200 dark:border-slate-800 text-slate-500'
          }`}
        >
          <Filter className="w-3 h-3" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>

        <button
          onClick={exportCSV}
          title="Export to CSV"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3 h-3" />
          CSV
        </button>
        <button
          onClick={exportXLS}
          title="Export to Excel"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FileSpreadsheet className="w-3 h-3" />
          XLS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide ${
                    col.numeric ? 'text-right' : 'text-left'
                  }`}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.sortable === false ? (
                    col.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={`inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${
                        col.numeric ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="w-3 h-3 text-primary-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-primary-500" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
            {showFilters && (
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-1.5 font-normal">
                    {col.filterable === false ? null : (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Filter…"
                          value={colFilters[col.key] ?? ''}
                          onChange={(e) => updateColFilter(col.key, e.target.value)}
                          className="w-full px-2 pr-6 py-1 rounded text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-primary-500"
                        />
                        {colFilters[col.key] && (
                          <button
                            onClick={() => updateColFilter(col.key, '')}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-slate-400">
                  {filtersActive ? 'No records match your search.' : emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-1.5 ${col.numeric ? 'text-right' : ''}`}>
                      {col.render ? col.render(row) : cellStr(col.accessor(row))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRecords > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={setPageSize}
        />
      )}
    </div>
  );
}
