/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : IFFCO SEZ content moves off the old coded pages.

                - Reports & Policies > Compliances becomes a CMS page (it was a link to
                  the coded /compliances/ page, which is removed; next.config.ts
                  redirects its URLs to /reports-policies/compliances/). Its PDFs are
                  already document items under it.
                - Descriptions for the seeded pages and the two compliance PDFs, taken
                  from the old coded pages' subtitles and card texts.
                - Reports & Policies' seeded intro paragraph becomes its description (the
                  hero subtitle) instead of repeating it in the body.

                Every statement only touches rows still in their seeded/expected state,
                so edits an admin already made are left alone.
============================================================================================
*/

DO $data$
DECLARE
    v_tenant  integer;
    v_reports integer;
    v_compl   integer;
BEGIN
    SELECT t.id INTO v_tenant FROM public.tenants t WHERE t.name = 'IFFCO SEZ';
    IF v_tenant IS NULL THEN
        RETURN;
    END IF;

    SELECT id INTO v_reports FROM public.website_nav_items
    WHERE tenant_id = v_tenant AND parent_id IS NULL AND slug = 'reports-policies' AND is_active;
    IF v_reports IS NULL THEN
        RETURN;
    END IF;

    -- Compliances: link to the old coded page -> CMS page.
    UPDATE public.website_nav_items
    SET    kind = 'page', href = NULL, open_in_new_tab = false,
           description = COALESCE(description, 'Environmental reports and statutory clearances from IFFCO Kisan SEZ.'),
           body_html   = COALESCE(body_html, '<p>Access the latest reports and official clearance documentation for the IFFCO Kisan SEZ project.</p>'),
           updated_at  = now()
    WHERE  tenant_id = v_tenant AND parent_id = v_reports AND slug = 'compliances'
      AND  is_active AND kind = 'link' AND href = '/compliances/'
    RETURNING id INTO v_compl;

    -- Reports & Policies: seeded intro paragraph -> description.
    UPDATE public.website_nav_items
    SET    description = 'Official reports, policies and disclosures from IFFCO Kisan SEZ.',
           body_html   = NULL,
           updated_at  = now()
    WHERE  id = v_reports AND description IS NULL
      AND  body_html = '<p>Official reports, policies and disclosures from IFFCO Kisan SEZ.</p>';

    UPDATE public.website_nav_item_translations
    SET    description = 'IFFCO కిసాన్ SEZ అధికారిక నివేదికలు, విధానాలు మరియు వెల్లడింపులు.',
           body_html   = NULL,
           updated_at  = now()
    WHERE  item_id = v_reports AND locale = 'te' AND description IS NULL
      AND  body_html = '<p>IFFCO కిసాన్ SEZ అధికారిక నివేదికలు, విధానాలు మరియు వెల్లడింపులు.</p>';

    -- The old Reports & Policies cards' texts.
    UPDATE public.website_nav_items ni
    SET    description = v.description, updated_at = now()
    FROM (VALUES
        ('annual-reports', 'Year-wise annual reports and organisational disclosures.'),
        ('csr',            'Community initiatives and social responsibility disclosures.'),
        ('policies',       'Policies and governance documents for stakeholders.')
    ) AS v(slug, description)
    WHERE ni.tenant_id = v_tenant AND ni.parent_id = v_reports AND ni.slug = v.slug
      AND ni.is_active AND ni.description IS NULL;

    -- The two compliance PDFs (lib/complianceDocuments.ts, now removed).
    UPDATE public.website_nav_items ni
    SET    description = v.description, updated_at = now()
    FROM (VALUES
        ('ec-compliance-report',  'Environmental clearance compliance report for 2025.'),
        ('environment-clearance', 'Environment clearance documentation for IFFCO Kisan SEZ.')
    ) AS v(slug, description)
    WHERE ni.tenant_id = v_tenant
      AND ni.parent_id = (SELECT id FROM public.website_nav_items
                          WHERE tenant_id = v_tenant AND parent_id = v_reports AND slug = 'compliances' AND is_active)
      AND ni.slug = v.slug AND ni.is_active AND ni.description IS NULL;
END;
$data$;
