/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 28-Sep-2026
Description   : Storage policies for the three buckets the admin console uploads to
                straight from the browser:
                  website-documents  navigation PDFs      (PdfUploadField)
                  website-media      media library, news   (MediaLibrary, MediaUploadDialog,
                                     & events gallery       NewsEventForm)
                  blog-covers        blog cover images     (CoverImageField)

                On the new database the buckets exist but storage.objects had no
                policies for them, so every admin upload failed with "new row violates
                row-level security policy". Same pair as 20260925100000_website_nav_items:
                anyone may read (all three buckets are public), only fn_is_admin() may
                write/replace/delete.

                Idempotent — DROP POLICY IF EXISTS first — so it is safe to run on a
                database that already has some of them.
============================================================================================
*/

-- ── website-documents ────────────────────────────────────────────────────
DROP POLICY IF EXISTS website_documents_public_read ON storage.objects;
CREATE POLICY website_documents_public_read ON storage.objects
    FOR SELECT
    USING (bucket_id = 'website-documents');

DROP POLICY IF EXISTS website_documents_admin_write ON storage.objects;
CREATE POLICY website_documents_admin_write ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'website-documents' AND public.fn_is_admin())
    WITH CHECK (bucket_id = 'website-documents' AND public.fn_is_admin());

-- ── website-media ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS website_media_public_read ON storage.objects;
CREATE POLICY website_media_public_read ON storage.objects
    FOR SELECT
    USING (bucket_id = 'website-media');

DROP POLICY IF EXISTS website_media_admin_write ON storage.objects;
CREATE POLICY website_media_admin_write ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'website-media' AND public.fn_is_admin())
    WITH CHECK (bucket_id = 'website-media' AND public.fn_is_admin());

-- ── blog-covers ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS blog_covers_public_read ON storage.objects;
CREATE POLICY blog_covers_public_read ON storage.objects
    FOR SELECT
    USING (bucket_id = 'blog-covers');

DROP POLICY IF EXISTS blog_covers_admin_write ON storage.objects;
CREATE POLICY blog_covers_admin_write ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'blog-covers' AND public.fn_is_admin())
    WITH CHECK (bucket_id = 'blog-covers' AND public.fn_is_admin());
