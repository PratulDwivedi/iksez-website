'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LifeBuoy, Loader2, ExternalLink } from 'lucide-react';
import { saveTicket } from '@/app/admin/(protected)/tickets/actions';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';
import type { TicketRow } from '@/lib/publicTickets';

export type TicketFormTicket = Pick<
  TicketRow,
  | 'id'
  | 'subject'
  | 'description'
  | 'status'
  | 'priority'
  | 'category'
  | 'first_name'
  | 'last_name'
  | 'company'
  | 'email'
  | 'phone'
  | 'owner_id'
  | 'resolved_at'
  | 'lead_id'
>;

// Same typography/spacing as LeadForm.tsx's inputCls/labelCls — kept
// consistent across every admin form in this panel.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';

const FORM_ID = 'ticket-form';
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'] as const;
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'] as const;

// datetime-local inputs need "YYYY-MM-DDTHH:mm", not an ISO string with a Z
// suffix/milliseconds — same gotcha as LeadForm.tsx's converted_at field.
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TicketForm({ ticket }: { ticket?: TicketFormTicket }) {
  const [state, formAction, pending] = useActionState(saveTicket, { error: null });

  return (
    <>
      <AdminPageHeader
        icon={<LifeBuoy className="w-4 h-4" />}
        title={ticket ? 'Edit Ticket' : 'New Ticket'}
        subtitle={ticket ? ticket.subject : 'Log a support ticket manually.'}
        action={
          <button
            type="submit"
            form={FORM_ID}
            disabled={pending}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pending ? 'Saving…' : ticket ? 'Save Changes' : 'Create Ticket'}
          </button>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <form id={FORM_ID} action={formAction} className="space-y-4">
          {ticket && <input type="hidden" name="id" defaultValue={ticket.id} />}

          {state.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          {ticket?.lead_id && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-700 dark:text-primary-500">
              Converted from Lead #{ticket.lead_id}
              <Link
                href={`/admin/leads/${ticket.lead_id}`}
                className="inline-flex items-center gap-1 hover:underline"
              >
                View lead
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}

          <CollapsibleSection title="Ticket Info">
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  required
                  defaultValue={ticket?.subject}
                  className={inputCls}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls} htmlFor="category">
                    Category
                    <span className="ml-1 font-normal normal-case text-slate-400">(e.g. Billing)</span>
                  </label>
                  <input id="category" name="category" defaultValue={ticket?.category ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" defaultValue={ticket?.priority ?? ''} className={inputCls}>
                    <option value="">Unset</option>
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls} htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={ticket?.status ?? 'open'}
                    className={inputCls}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {ticket && (
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="owner_id">
                      Owner
                      <span className="ml-1 font-normal normal-case text-slate-400">(profile id, optional)</span>
                    </label>
                    <input
                      id="owner_id"
                      name="owner_id"
                      type="number"
                      defaultValue={ticket?.owner_id ?? ''}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="resolved_at">Resolved at</label>
                    <input
                      id="resolved_at"
                      name="resolved_at"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(ticket.resolved_at)}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Contact Info">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls} htmlFor="first_name">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    required
                    defaultValue={ticket?.first_name}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" defaultValue={ticket?.last_name ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="company">Company</label>
                  <input id="company" name="company" defaultValue={ticket?.company ?? ''} className={inputCls} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" defaultValue={ticket?.email ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" defaultValue={ticket?.phone ?? ''} className={inputCls} />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Notes" defaultOpen={false}>
            <div>
              <label className={labelCls} htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={ticket?.description ?? ''}
                className={inputCls}
              />
            </div>
          </CollapsibleSection>
        </form>
      </div>
    </>
  );
}
