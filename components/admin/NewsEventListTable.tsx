'use client';

import Link from 'next/link';
import { Eye, Pencil } from 'lucide-react';
import { AdminDataTable, type DataTableColumn } from './AdminDataTable';
import { formatAdminDate } from '@/lib/adminDate';

export interface NewsEventListRow {
  id: number;
  title: string;
  event_date: string | null;
  published: boolean;
  is_active: boolean;
  updated_at: string;
}

function statusOf(item: NewsEventListRow): 'Archived' | 'Published' | 'Draft' {
  if (!item.is_active) return 'Archived';
  return item.published ? 'Published' : 'Draft';
}

const STATUS_BADGE_CLS: Record<ReturnType<typeof statusOf>, string> = {
  Archived: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
  Published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Draft: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
};

const columns: DataTableColumn<NewsEventListRow>[] = [
  {
    key: 'title',
    header: 'Title',
    accessor: (item) => item.title,
    render: (item) => (
      <div className="text-xs font-normal text-slate-700 dark:text-slate-300">{item.title}</div>
    ),
  },
  {
    key: 'event_date',
    header: 'Event date',
    accessor: (item) => item.event_date ?? '',
    render: (item) => (
      <span className="text-xs text-slate-500">
        {item.event_date ? formatAdminDate(item.event_date) : '—'}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (item) => statusOf(item),
    render: (item) => {
      const status = statusOf(item);
      return (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${STATUS_BADGE_CLS[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    key: 'updated_at',
    header: 'Updated',
    accessor: (item) => item.updated_at,
    render: (item) => (
      <span className="text-xs text-slate-400">{formatAdminDate(item.updated_at)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    accessor: () => '',
    sortable: false,
    filterable: false,
    render: (item) => (
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/news-and-events/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="View on site"
          title="View on site"
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <Link
          href={`/admin/news-events/${item.id}`}
          onClick={(e) => e.stopPropagation()}
          aria-label="Edit"
          title="Edit"
          className="inline-flex items-center text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
        >
          <Pencil className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
];

export function NewsEventListTable({ items }: { items: NewsEventListRow[] }) {
  return (
    <AdminDataTable
      columns={columns}
      rows={items}
      getRowKey={(item) => item.id}
      exportFileName="news-events"
      emptyMessage="No News & Events items yet."
    />
  );
}
