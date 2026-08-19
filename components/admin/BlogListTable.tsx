'use client';

import Link from 'next/link';
import { Eye, Pencil } from 'lucide-react';
import { AdminDataTable, type DataTableColumn } from './AdminDataTable';
import { formatAdminDate } from '@/lib/adminDate';

export interface BlogListRow {
  id: number;
  name: string;
  title: string;
  category: string;
  published: boolean;
  is_active: boolean;
  updated_at: string;
}

function statusOf(post: BlogListRow): 'Archived' | 'Published' | 'Draft' {
  if (!post.is_active) return 'Archived';
  return post.published ? 'Published' : 'Draft';
}

const STATUS_BADGE_CLS: Record<ReturnType<typeof statusOf>, string> = {
  Archived: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
  Published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Draft: 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
};

const columns: DataTableColumn<BlogListRow>[] = [
  {
    key: 'title',
    header: 'Title',
    accessor: (post) => post.title,
    render: (post) => (
      <div className="text-xs font-normal text-slate-700 dark:text-slate-300">{post.title}</div>
    ),
  },
  {
    key: 'category',
    header: 'Category',
    accessor: (post) => post.category,
    render: (post) => <span className="text-xs text-slate-500">{post.category}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (post) => statusOf(post),
    render: (post) => {
      const status = statusOf(post);
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
    accessor: (post) => post.updated_at,
    render: (post) => (
      <span className="text-xs text-slate-400">{formatAdminDate(post.updated_at)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    accessor: () => '',
    sortable: false,
    filterable: false,
    render: (post) => (
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/blog/${post.name}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="View"
          title="View"
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <Link
          href={`/admin/blogs/${post.id}`}
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

export function BlogListTable({ posts }: { posts: BlogListRow[] }) {
  return (
    <AdminDataTable
      columns={columns}
      rows={posts}
      getRowKey={(post) => post.id}
      exportFileName="blog-posts"
      emptyMessage="No posts yet."
    />
  );
}
