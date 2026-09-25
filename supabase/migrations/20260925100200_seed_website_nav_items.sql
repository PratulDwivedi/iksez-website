/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : Seeds IFFCO SEZ's website_nav_items with the header nav the site shipped
                with (components/Header.tsx's former hardcoded NAV + the en/te
                dictionary labels), so moving the header onto the table changes nothing
                visible until an admin edits it.

                Reports & Policies becomes a CMS page with Annual Reports, CSR and
                Policies as empty child pages ready for documents; Compliances stays a
                link to the existing /compliances/ route.

                Looks the tenant and an admin profile up by name/flag rather than
                hardcoding ids, and does nothing if the tenant already has nav items.
============================================================================================
*/

DO $seed$
DECLARE
    v_tenant  integer;
    v_admin   integer;
    v_zones   integer;
    v_reports integer;
    v_id      integer;
    v_order   integer := 0;
    r         record;
BEGIN
    SELECT t.id INTO v_tenant FROM public.tenants t WHERE t.name = 'IFFCO SEZ' AND t.is_active;
    IF v_tenant IS NULL THEN
        RAISE NOTICE 'Tenant "IFFCO SEZ" not found; skipping nav seed';
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM public.website_nav_items WHERE tenant_id = v_tenant) THEN
        RAISE NOTICE 'IFFCO SEZ already has nav items; skipping nav seed';
        RETURN;
    END IF;

    SELECT p.id INTO v_admin
    FROM public.profiles p
    WHERE p.tenant_id = v_tenant
      AND p.is_active
      AND (p.access_control->>'is_admin')::boolean IS TRUE
    ORDER BY p.id
    LIMIT 1;
    IF v_admin IS NULL THEN
        RAISE NOTICE 'No active admin profile for IFFCO SEZ; skipping nav seed';
        RETURN;
    END IF;

    -- Top level, in header order. parent_key marks items with children.
    FOR r IN
        SELECT * FROM (VALUES
            ('about-us',           'link', 'About Us',           'మా గురించి',           '/about-us/',           NULL),
            ('leadership',         'link', 'Leadership',         'నాయకత్వం',             '/board-of-directors/', NULL),
            ('zones',              'link', 'Zones',              'జోన్‌లు',               '/zone/sez/',           'zones'),
            ('reports-policies',   'page', 'Reports & Policies', 'నివేదికలు & విధానాలు', NULL,                   'reports'),
            ('news-and-events',    'link', 'News & Media',       'వార్తలు & మీడియా',     '/news-and-events/',    NULL),
            ('blog',               'link', 'Blogs',              'బ్లాగులు',              '/blog/',               NULL),
            ('contact-us',         'link', 'Contact Us',         'సంప్రదించండి',          '/contact-us/',         NULL)
        ) AS v(slug, kind, title_en, title_te, href, parent_key)
    LOOP
        v_order := v_order + 1;
        INSERT INTO public.website_nav_items (
            slug, kind, title, href, body_html, sort_order, tenant_id, created_by
        ) VALUES (
            r.slug, r.kind, r.title_en, r.href,
            CASE WHEN r.slug = 'reports-policies'
                 THEN '<p>Official reports, policies and disclosures from IFFCO Kisan SEZ.</p>' END,
            v_order, v_tenant, v_admin
        )
        RETURNING id INTO v_id;

        INSERT INTO public.website_nav_item_translations (item_id, locale, title, body_html, tenant_id, created_by)
        VALUES (
            v_id, 'te', r.title_te,
            CASE WHEN r.slug = 'reports-policies'
                 THEN '<p>IFFCO కిసాన్ SEZ అధికారిక నివేదికలు, విధానాలు మరియు వెల్లడింపులు.</p>' END,
            v_tenant, v_admin
        );

        IF r.parent_key = 'zones' THEN v_zones := v_id; END IF;
        IF r.parent_key = 'reports' THEN v_reports := v_id; END IF;
    END LOOP;

    v_order := 0;
    FOR r IN
        SELECT * FROM (VALUES
            ('sez', 'SEZ', 'SEZ', '/zone/sez/'),
            ('dtz', 'DTZ', 'DTZ', '/zone/dtz/')
        ) AS v(slug, title_en, title_te, href)
    LOOP
        v_order := v_order + 1;
        INSERT INTO public.website_nav_items (parent_id, slug, kind, title, href, sort_order, tenant_id, created_by)
        VALUES (v_zones, r.slug, 'link', r.title_en, r.href, v_order, v_tenant, v_admin)
        RETURNING id INTO v_id;
        INSERT INTO public.website_nav_item_translations (item_id, locale, title, tenant_id, created_by)
        VALUES (v_id, 'te', r.title_te, v_tenant, v_admin);
    END LOOP;

    v_order := 0;
    FOR r IN
        SELECT * FROM (VALUES
            ('annual-reports', 'page', 'Annual Reports', 'వార్షిక నివేదికలు', NULL),
            ('csr',            'page', 'CSR',            'CSR',                NULL),
            ('policies',       'page', 'Policies',       'విధానాలు',           NULL),
            ('compliances',    'link', 'Compliances',    'నిబంధనల పాటింపు',   '/compliances/')
        ) AS v(slug, kind, title_en, title_te, href)
    LOOP
        v_order := v_order + 1;
        INSERT INTO public.website_nav_items (parent_id, slug, kind, title, href, sort_order, tenant_id, created_by)
        VALUES (v_reports, r.slug, r.kind, r.title_en, r.href, v_order, v_tenant, v_admin)
        RETURNING id INTO v_id;
        INSERT INTO public.website_nav_item_translations (item_id, locale, title, tenant_id, created_by)
        VALUES (v_id, 'te', r.title_te, v_tenant, v_admin);
    END LOOP;
END;
$seed$;
