'use client';

import Link from 'next/link';
import { Pencil, Star } from 'lucide-react';
import { AdminDataTable, type DataTableColumn } from './AdminDataTable';
import { formatAdminDate } from '@/lib/adminDate';

export interface TestimonialListRow {
  id: number;
  quote: string;
  author_name: string;
  company: string | null;
  rating: number;
  published: boolean;
  is_active: boolean;
  updated_at: string;
}

function statusOf(row: TestimonialListRow): 'Archived' | 'Published' | 'Draft' {
  if (!row.is_active) return 'Archived';
  return row.published ? 'Published' : 'Draft';
}

const STATUS_BADGE_CLS: Record<ReturnType<typeof statusOf>, string> = {
  Archived: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
  Published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Draft: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
};

const columns: DataTableColumn<TestimonialListRow>[] = [
  {
    key: 'quote',
    header: 'Quote',
    accessor: (row) => row.quote,
    render: (row) => (
      <div className="font-normal text-slate-700 dark:text-slate-300 max-w-md truncate" title={row.quote}>
        &ldquo;{row.quote}&rdquo;
      </div>
    ),
  },
  {
    key: 'author_name',
    header: 'Author',
    accessor: (row) => row.author_name,
    render: (row) => (
      <>
        <div className="font-normal text-slate-700 dark:text-slate-300">{row.author_name}</div>
        {row.company && <div className="text-xs text-slate-400">{row.company}</div>}
      </>
    ),
  },
  {
    key: 'rating',
    header: 'Rating',
    accessor: (row) => row.rating,
    render: (row) => (
      <div className="flex items-center gap-0.5 text-primary-400">
        {[...Array(row.rating)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (row) => statusOf(row),
    render: (row) => {
      const status = statusOf(row);
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
    accessor: (row) => row.updated_at,
    render: (row) => (
      <span className="text-xs text-slate-400">{formatAdminDate(row.updated_at)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    accessor: () => '',
    sortable: false,
    filterable: false,
    render: (row) => (
      <div className="flex items-center justify-end">
        <Link
          href={`/admin/testimonials/${row.id}`}
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

export function TestimonialListTable({ testimonials }: { testimonials: TestimonialListRow[] }) {
  return (
    <AdminDataTable
      columns={columns}
      rows={testimonials}
      getRowKey={(row) => row.id}
      exportFileName="testimonials"
      emptyMessage="No testimonials yet."
    />
  );
}
