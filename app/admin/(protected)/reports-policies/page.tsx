import Link from 'next/link';
import { ExternalLink, Files, Upload } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

const GROUPS = [
  { title: 'Annual Reports', description: 'Year-wise annual reports and organisational disclosures.' },
  { title: 'CSR', description: 'Community initiatives and social responsibility documents.' },
  { title: 'Policies', description: 'Governance policies and stakeholder-facing documents.' },
  { title: 'Compliances', description: 'Environmental reports and statutory clearances.' },
];

export default function AdminReportsPoliciesPage() {
  return (
    <>
      <AdminPageHeader
        icon={<Files className="w-4 h-4" />}
        title="Reports & Policies"
        subtitle="Organise published PDFs by category and year for the public website."
        action={
          <Link
            href="/admin/media"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF in Media
          </Link>
        }
      />
      <div className="px-3 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GROUPS.map((group) => (
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5" key={group.title}>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{group.title}</h2>
              <p className="mt-2 text-xs text-slate-500">{group.description}</p>
              <Link className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600" href="/reports-policies/">
                View public section <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Upload PDF files in Media, then assign their category and year when the document catalog is connected to the content API.
        </p>
      </div>
    </>
  );
}
