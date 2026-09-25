import { redirect } from 'next/navigation';

// Reports & Policies is now one branch of the admin-managed website
// navigation, edited at /admin/navigation.
export default function AdminReportsPoliciesPage() {
  redirect('/admin/navigation/');
}
