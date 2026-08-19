'use client';

import Link from 'next/link';
import { Pencil, LifeBuoy } from 'lucide-react';
import { AdminDataTable, type DataTableColumn } from './AdminDataTable';
import { convertLeadToTicket } from '@/app/admin/(protected)/tickets/actions';
import { formatAdminDate } from '@/lib/adminDate';
import type { LeadRow } from '@/lib/publicLeads';

export type LeadListRow = Pick<
  LeadRow,
  'id' | 'first_name' | 'last_name' | 'company' | 'email' | 'phone' | 'status' | 'rating' | 'created_at'
>;

const STATUS_BADGE_CLS: Record<LeadListRow['status'], string> = {
  new: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
  contacted: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  qualified: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  unqualified: 'bg-slate-200 dark:bg-slate-800 text-slate-500',
  converted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const RATING_BADGE_CLS: Record<'hot' | 'warm' | 'cold', string> = {
  hot: 'bg-red-500/10 text-red-600 dark:text-red-400',
  warm: 'bg-primary-500/10 text-primary-600 dark:text-primary-500',
  cold: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

function fullNameOf(lead: LeadListRow): string {
  return [lead.first_name, lead.last_name].filter(Boolean).join(' ');
}

const columns: DataTableColumn<LeadListRow>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: (lead) => fullNameOf(lead),
    render: (lead) => (
      <>
        <div className="font-normal text-slate-700 dark:text-slate-300">{fullNameOf(lead)}</div>
        {lead.company && <div className="text-xs text-slate-400">{lead.company}</div>}
      </>
    ),
  },
  {
    key: 'contact',
    header: 'Contact',
    accessor: (lead) => lead.email ?? lead.phone ?? '',
    render: (lead) => (
      <div className="text-xs text-slate-500 space-y-0.5">
        {lead.email && <div>{lead.email}</div>}
        {lead.phone && <div className="text-slate-400">{lead.phone}</div>}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (lead) => lead.status,
    render: (lead) => (
      <span
        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${STATUS_BADGE_CLS[lead.status]}`}
      >
        {lead.status}
      </span>
    ),
  },
  {
    key: 'rating',
    header: 'Rating',
    accessor: (lead) => lead.rating ?? '',
    render: (lead) =>
      lead.rating ? (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${RATING_BADGE_CLS[lead.rating]}`}
        >
          {lead.rating}
        </span>
      ) : (
        <span className="text-xs text-slate-300 dark:text-slate-700">—</span>
      ),
  },
  {
    key: 'created_at',
    header: 'Created',
    accessor: (lead) => lead.created_at,
    render: (lead) => (
      <span className="text-xs text-slate-400">{formatAdminDate(lead.created_at)}</span>
    ),
  },
  {
    key: 'actions',
    header: '',
    accessor: () => '',
    sortable: false,
    filterable: false,
    render: (lead) => (
      <div className="flex items-center justify-end gap-3">
        <form action={convertLeadToTicket} onClick={(e) => e.stopPropagation()}>
          <input type="hidden" name="lead_id" value={lead.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary-600 dark:hover:text-primary-500 hover:underline"
          >
            <LifeBuoy className="w-3 h-3" />
            Convert to Ticket
          </button>
        </form>
        <Link
          href={`/admin/leads/${lead.id}`}
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

export function LeadListTable({ leads }: { leads: LeadListRow[] }) {
  return (
    <AdminDataTable
      columns={columns}
      rows={leads}
      getRowKey={(lead) => lead.id}
      exportFileName="leads"
      emptyMessage="No leads yet."
    />
  );
}
