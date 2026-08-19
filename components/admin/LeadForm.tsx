'use client';

import { useActionState, useState, useTransition } from 'react';
import { Users, Loader2, Trash2, AlertTriangle, X } from 'lucide-react';
import { saveLead, deleteLead } from '@/app/admin/(protected)/leads/actions';
import { AdminPageHeader } from './AdminPageHeader';
import { CollapsibleSection } from './CollapsibleSection';
import type { LeadRow } from '@/lib/publicLeads';

export interface LeadFormLead
  extends Pick<
    LeadRow,
    | 'id'
    | 'first_name'
    | 'last_name'
    | 'company'
    | 'email'
    | 'phone'
    | 'mobile'
    | 'job_title'
    | 'website'
    | 'lead_source'
    | 'status'
    | 'rating'
    | 'estimated_value'
    | 'owner_id'
    | 'description'
    | 'tags'
    | 'converted_at'
  > {
  address: { address_line?: string; city?: string; state?: string; postal_code?: string; country?: string } | null;
}

// Same typography/spacing as BlogForm.tsx's inputCls/labelCls — kept
// consistent across every admin form in this panel.
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[13px] focus:outline-none focus:border-primary-500 transition';
const labelCls =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block';

const FORM_ID = 'lead-form';
const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'unqualified', 'converted'] as const;
const RATING_OPTIONS = ['hot', 'warm', 'cold'] as const;

// datetime-local inputs need "YYYY-MM-DDTHH:mm", not an ISO string with a Z
// suffix/milliseconds — same defaultValue-must-match-option-shape concern as
// the <select> gotcha in CLAUDE.md, just for a different input type.
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadForm({ lead }: { lead?: LeadFormLead }) {
  const [state, formAction, pending] = useActionState(saveLead, { error: null });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const fullName = lead ? [lead.first_name, lead.last_name].filter(Boolean).join(' ') : null;

  function handleDelete() {
    if (!lead) return;
    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteLead(lead.id);
      // deleteLead redirects on success, so this only runs on failure.
      if (result?.error) {
        setDeleteError(result.error);
        setConfirmOpen(false);
      }
    });
  }

  return (
    <>
      <AdminPageHeader
        icon={<Users className="w-4 h-4" />}
        title={lead ? 'Edit Lead' : 'New Lead'}
        subtitle={fullName ?? 'Add a lead manually.'}
        action={
          <>
            {lead && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 text-slate-500 dark:text-slate-400 font-bold text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button
              type="submit"
              form={FORM_ID}
              disabled={pending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {pending ? 'Saving…' : lead ? 'Save Changes' : 'Create Lead'}
            </button>
          </>
        }
      />

      <div className="px-4 sm:px-6 py-6">
        <form id={FORM_ID} action={formAction} className="space-y-4">
          {lead && <input type="hidden" name="id" defaultValue={lead.id} />}

          {state.error && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {state.error}
            </p>
          )}

          {deleteError && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {deleteError}
            </p>
          )}

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
                    defaultValue={lead?.first_name}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" defaultValue={lead?.last_name ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={lead?.email ?? ''}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls} htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" defaultValue={lead?.phone ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="mobile">Mobile</label>
                  <input id="mobile" name="mobile" defaultValue={lead?.mobile ?? ''} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="website">Website</label>
                  <input id="website" name="website" defaultValue={lead?.website ?? ''} className={inputCls} />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Company & Source">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="company">Company</label>
                <input id="company" name="company" defaultValue={lead?.company ?? ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="job_title">Job title</label>
                <input id="job_title" name="job_title" defaultValue={lead?.job_title ?? ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="lead_source">
                  Lead source
                  <span className="ml-1 font-normal normal-case text-slate-400">(e.g. referral)</span>
                </label>
                <input
                  id="lead_source"
                  name="lead_source"
                  defaultValue={lead?.lead_source ?? ''}
                  className={inputCls}
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Status & Ownership">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls} htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  defaultValue={lead?.status ?? 'new'}
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="rating">Rating</label>
                <select id="rating" name="rating" defaultValue={lead?.rating ?? ''} className={inputCls}>
                  <option value="">Unrated</option>
                  {RATING_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="estimated_value">Estimated value</label>
                <input
                  id="estimated_value"
                  name="estimated_value"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={lead?.estimated_value ?? ''}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="owner_id">
                  Owner
                  <span className="ml-1 font-normal normal-case text-slate-400">(profile id, optional)</span>
                </label>
                <input
                  id="owner_id"
                  name="owner_id"
                  type="number"
                  defaultValue={lead?.owner_id ?? ''}
                  className={inputCls}
                />
              </div>
              {lead && (
                <div>
                  <label className={labelCls} htmlFor="converted_at">Converted at</label>
                  <input
                    id="converted_at"
                    name="converted_at"
                    type="datetime-local"
                    defaultValue={toDatetimeLocal(lead.converted_at)}
                    className={inputCls}
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Address" defaultOpen={false}>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className={labelCls} htmlFor="address_line">Address line</label>
                <input
                  id="address_line"
                  name="address_line"
                  defaultValue={lead?.address?.address_line ?? ''}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="city">City</label>
                <input id="city" name="city" defaultValue={lead?.address?.city ?? ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="state">State</label>
                <input id="state" name="state" defaultValue={lead?.address?.state ?? ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="postal_code">Postal code</label>
                <input
                  id="postal_code"
                  name="postal_code"
                  defaultValue={lead?.address?.postal_code ?? ''}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  defaultValue={lead?.address?.country ?? ''}
                  className={inputCls}
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Notes" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="tags">Tags (comma-separated)</label>
                <input id="tags" name="tags" defaultValue={lead?.tags?.join(', ') ?? ''} className={inputCls} />
              </div>
              <div>
                <label className={labelCls} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={lead?.description ?? ''}
                  className={inputCls}
                />
              </div>
            </div>
          </CollapsibleSection>
        </form>
      </div>

      {confirmOpen && lead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="p-6 space-y-4">
              <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete this lead?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {fullName ?? 'This lead'} will be removed from the leads list. This can be undone
                  later by an admin directly in the database, but not from this panel.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={deletePending}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePending}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {deletePending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {deletePending ? 'Deleting…' : 'Delete Lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
