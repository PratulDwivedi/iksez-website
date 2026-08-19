'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { AdminDataTable, type DataTableColumn } from './AdminDataTable';
import type { TicketRow } from '@/lib/publicTickets';
import { formatAdminDate } from '@/lib/adminDate';

export type TicketListRow = Pick<
  TicketRow,
  'id' | 'subject' | 'first_name' | 'last_name' | 'company' | 'email' | 'phone' | 'status' | 'priority' | 'created_at'
>;

const STATUS_BADGE_CLS: Record<TicketListRow['status'], string> = {
  open: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
  in_progress: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  closed: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
};

const PRIORITY_BADGE_CLS: Record<'low' | 'medium' | 'high' | 'urgent', string> = {
  low: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  medium: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
  high: 'bg-secondary-500/10 text-secondary-600 dark:text-secondary-400',
  urgent: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

function contactNameOf(ticket: TicketListRow): string {
  return [ticket.first_name, ticket.last_name].filter(Boolean).join(' ');
}

const columns: DataTableColumn<TicketListRow>[] = [
  {
    key: 'subject',
    header: 'Subject',
    accessor: (ticket) => ticket.subject,
    render: (ticket) => (
      <>
        <div className="font-normal text-slate-700 dark:text-slate-300">{ticket.subject}</div>
        <div className="text-xs text-slate-400">{contactNameOf(ticket)}{ticket.company ? ` · ${ticket.company}` : ''}</div>
      </>
    ),
  },
  {
    key: 'contact',
    header: 'Contact',
    accessor: (ticket) => ticket.email ?? ticket.phone ?? '',
    render: (ticket) => (
      <div className="text-xs text-slate-500 space-y-0.5">
        {ticket.email && <div>{ticket.email}</div>}
        {ticket.phone && <div className="text-slate-400">{ticket.phone}</div>}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (ticket) => ticket.status,
    render: (ticket) => (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${STATUS_BADGE_CLS[ticket.status]}`}
      >
        {ticket.status.replace('_', ' ')}
      </span>
    ),
  },
  {
    key: 'priority',
    header: 'Priority',
    accessor: (ticket) => ticket.priority ?? '',
    render: (ticket) =>
      ticket.priority ? (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${PRIORITY_BADGE_CLS[ticket.priority]}`}
        >
          {ticket.priority}
        </span>
      ) : (
        <span className="text-xs text-slate-300 dark:text-slate-700">—</span>
      ),
  },
  {
    key: 'created_at',
    header: 'Created',
    accessor: (ticket) => ticket.created_at,
    render: (ticket) => (
      <span className="text-xs text-slate-400">{formatAdminDate(ticket.created_at)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    accessor: () => '',
    sortable: false,
    filterable: false,
    render: (ticket) => (
      <div className="text-right">
        <Link
          href={`/admin/tickets/${ticket.id}`}
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

export function TicketListTable({ tickets }: { tickets: TicketListRow[] }) {
  return (
    <AdminDataTable
      columns={columns}
      rows={tickets}
      getRowKey={(ticket) => ticket.id}
      exportFileName="tickets"
      emptyMessage="No tickets yet."
    />
  );
}
