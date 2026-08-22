import { Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { MediaLibrary, type MediaRow } from '@/components/admin/MediaLibrary';
import { ApiIntegrationButton } from '@/components/admin/ApiIntegrationButton';
import { SITE_URL } from '@/lib/siteUrl';

const MEDIA_API_RESPONSE_EXAMPLE = `{
  "is_success": true,
  "message": "Public media retrieved successfully",
  "status_code": 200,
  "data": [
    {
      "id": 1,
      "file_name": "hero-shot.webp",
      "url": "https://wirkzblhhfrqbywrtoze.supabase.co/storage/v1/object/public/website-media/....webp",
      "mime_type": "image/webp",
      "size_bytes": 84213,
      "alt_text": "Laptop mockup on a desk",
      "tags": null,
      "created_at": "2026-07-30T00:00:00+00:00"
    }
  ],
  "paging": { "total_records": 1, "page_size": 50, "page_index": 1 }
}`;

export default async function AdminMediaPage() {
  const supabase = await createClient();

  // fn_get_website_media resolves the caller's tenant from the admin's own
  // JWT session and returns BOTH public and private files — the public-only
  // counterpart (fn_list_public_website_media, used by /api/media) is what
  // another site actually calls to consume this tenant's public assets.
  const { data: media, error } = await callRpc<MediaRow[]>(supabase, 'fn_get_website_media', {
    p_page_size: 500,
  });

  return (
    <>
      <AdminPageHeader
        icon={<ImageIcon className="w-4 h-4" />}
        title="Media"
        subtitle="Upload images and files, then reuse them on this or another site."
        action={
          <ApiIntegrationButton
            title="Public Media API"
            description="Pull this tenant's public media into another website."
            method="GET"
            endpoint="/api/media"
            params={[
              { name: 'x-api-key', in: 'header', description: "Your tenant's publishable API key. Omit to get IFFCO Kisan SEZ's own public media." },
              { name: 'q', in: 'query', description: 'Keyword search across file name and alt text.' },
              { name: 'tag', in: 'query', description: 'Exact tag match.' },
              { name: 'page', in: 'query', description: 'Page number. Default 1.' },
              { name: 'pageSize', in: 'query', description: 'Results per page. Default 50.' },
            ]}
              requestExample={`curl "${SITE_URL}/api/media?pageSize=20" \\\n  -H "x-api-key: YOUR_PUBLISHABLE_API_KEY"`}
            responseExample={MEDIA_API_RESPONSE_EXAMPLE}
            keyNote="Optional — only PUBLIC files from this tenant are ever returned, whether or not a key is sent; private files never appear here regardless."
          />
        }
      />

      <div className="px-3 sm:px-6 py-4">
        {error ? (
          <p className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        ) : (
          <MediaLibrary initialMedia={media ?? []} />
        )}
      </div>
    </>
  );
}
