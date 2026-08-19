'use client';

import { Settings } from 'lucide-react';
import { ApiKeyCard } from '@/components/admin/ApiKeyCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { resetApiKey, resetPublishableApiKey } from './actions';

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader icon={<Settings className="w-4 h-4" />} title="Settings" subtitle="Manage your API keys." />
      <div className="px-6 sm:px-10 py-8">
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <ApiKeyCard
            title="API Key"
            description="Full access, scoped to your own profile. Keep this secret — anyone with it can act as you."
            resetLabel="Reset API Key"
            confirmMessage="The old key stops working immediately."
            onReset={resetApiKey}
          />
          <ApiKeyCard
            title="Publishable API Key"
            description="Safe to embed in client-side code — used for scoped integrations: blog/media reads, and lead/analytics/media capture."
            resetLabel="Reset Publishable Key"
            confirmMessage="The old publishable key stops working immediately. Any integrations using it will need updating."
            onReset={resetPublishableApiKey}
          />
        </div>
      </div>
    </>
  );
}
