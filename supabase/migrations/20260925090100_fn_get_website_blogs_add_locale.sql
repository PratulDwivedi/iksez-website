/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : fn_get_website_blogs gains an optional trailing p_locale.

                Backward compatible: p_locale defaults to NULL, and with NULL (or 'en')
                the function body, filters and returned row shape are exactly what they
                were before this migration — existing callers (every tenant's site,
                /api/blogs) see no change.

                With p_locale := 'te' (any non-English locale):
                  - title, excerpt, cover_alt, body and data come from that locale's
                    published website_blog_translations row when one exists, and fall
                    back to the English columns per post when it doesn't;
                  - every row gains two fields: locale (the language the text is
                    actually in — 'te', or 'en' for a fallback) and is_fallback;
                  - p_search also matches the translated title/excerpt.
                Slug (name), category, tags, cover image, author and dates are
                language-neutral and never change.

                DROP + CREATE rather than CREATE OR REPLACE because adding a parameter
                changes the function's identity — CREATE OR REPLACE would leave the old
                9-argument version behind as an ambiguous PostgREST overload. The whole
                migration runs in one transaction, so callers never see it missing.
                Grants are re-applied to match the previous version exactly.
============================================================================================
*/

DROP FUNCTION public.fn_get_website_blogs(integer, text, text, boolean, text, text, integer, integer, text[]);

CREATE FUNCTION public.fn_get_website_blogs(
    p_id         integer DEFAULT NULL::integer,
    p_name       text    DEFAULT NULL::text,
    p_tag        text    DEFAULT NULL::text,
    p_published  boolean DEFAULT NULL::boolean,
    p_search     text    DEFAULT NULL::text,
    p_category   text    DEFAULT NULL::text,
    p_page_index integer DEFAULT 1,
    p_page_size  integer DEFAULT 9,
    p_tags       text[]  DEFAULT NULL::text[],
    p_locale     text    DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx        t_request_context;
    v_result     jsonb;
    v_total      integer;
    v_page_index integer := GREATEST(COALESCE(p_page_index, 1), 1);
    v_page_size  integer := GREATEST(COALESCE(p_page_size, 9), 1);
    -- NULL = English/untranslated: no translation join, legacy row shape.
    v_locale     text    := NULLIF(NULLIF(lower(trim(COALESCE(p_locale, ''))), ''), 'en');
    -- Fields only returned when a locale was requested, so the legacy shape is
    -- byte-for-byte unchanged for existing callers.
    v_strip      text[]  := CASE WHEN v_locale IS NULL THEN ARRAY['locale', 'is_fallback'] ELSE ARRAY[]::text[] END;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('published.fn_get_website_blogs');

        SELECT count(*)
        INTO   v_total
        FROM   public.website_blogs wb
        JOIN   public.quick_lists ql ON ql.id = wb.category_id
        LEFT JOIN public.website_blog_translations tr
               ON  v_locale IS NOT NULL
               AND tr.blog_id   = wb.id
               AND tr.locale    = v_locale
               AND tr.is_active = true
               AND tr.published = true
        WHERE  wb.tenant_id = v_ctx.tenant_id
          AND  COALESCE(wb.is_active, true) = true
          AND (p_id        IS NULL OR wb.id   = p_id)
          AND (p_name      IS NULL OR wb.name = p_name)
          AND (p_published IS NULL OR wb.published = p_published)
          AND (p_category  IS NULL OR ql.name = p_category)
          AND (p_tag       IS NULL OR p_tag = ANY(wb.tags))
          AND (p_tags      IS NULL OR wb.tags && p_tags)
          AND (p_search    IS NULL OR p_search = ''
               OR wb.title   ILIKE '%' || p_search || '%'
               OR wb.excerpt ILIKE '%' || p_search || '%'
               OR tr.title   ILIKE '%' || p_search || '%'
               OR tr.excerpt ILIKE '%' || p_search || '%');

        SELECT COALESCE(jsonb_agg(to_jsonb(p) - v_strip ORDER BY p.published_at DESC), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT
                wb.id,
                wb.name,
                COALESCE(tr.title,     wb.title)     AS title,
                COALESCE(tr.excerpt,   wb.excerpt)   AS excerpt,
                wb.category_id,
                ql.name AS category,
                wb.cover_url,
                COALESCE(tr.cover_alt, wb.cover_alt) AS cover_alt,
                wb.tags,
                wb.keywords,
                wb.author_name,
                wb.author_role,
                wb.read_minutes,
                COALESCE(tr.body,      wb.body)      AS body,
                wb.published,
                wb.is_active,
                -- A translation's FAQs replace the English ones outright (never mix
                -- languages on one page); an untranslated post keeps its own.
                CASE WHEN tr.id IS NOT NULL THEN COALESCE(tr.data, '{}'::jsonb)
                     ELSE COALESCE(wb.data, '{}'::jsonb) END AS data,
                wb.published_at,
                wb.created_at,
                wb.updated_at,
                CASE WHEN tr.id IS NOT NULL THEN v_locale ELSE 'en' END AS locale,
                (v_locale IS NOT NULL AND tr.id IS NULL)                AS is_fallback
            FROM public.website_blogs wb
            JOIN public.quick_lists ql ON ql.id = wb.category_id
            LEFT JOIN public.website_blog_translations tr
                   ON  v_locale IS NOT NULL
                   AND tr.blog_id   = wb.id
                   AND tr.locale    = v_locale
                   AND tr.is_active = true
                   AND tr.published = true
            WHERE wb.tenant_id = v_ctx.tenant_id
              AND COALESCE(wb.is_active, true) = true
              AND (p_id        IS NULL OR wb.id   = p_id)
              AND (p_name      IS NULL OR wb.name = p_name)
              AND (p_published IS NULL OR wb.published = p_published)
              AND (p_category  IS NULL OR ql.name = p_category)
              AND (p_tag       IS NULL OR p_tag = ANY(wb.tags))
              AND (p_tags      IS NULL OR wb.tags && p_tags)
              AND (p_search    IS NULL OR p_search = ''
                   OR wb.title   ILIKE '%' || p_search || '%'
                   OR wb.excerpt ILIKE '%' || p_search || '%'
                   OR tr.title   ILIKE '%' || p_search || '%'
                   OR tr.excerpt ILIKE '%' || p_search || '%')
            ORDER BY wb.published_at DESC
            LIMIT v_page_size
            OFFSET (v_page_index - 1) * v_page_size
        ) p;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Website blogs retrieved successfully',
            p_total_records := v_total,
            p_page_size     := v_page_size,
            p_page_index    := v_page_index
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_get_website_blogs',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- Same grants as the version this replaces (anon/authenticated/service_role, no PUBLIC).
REVOKE ALL ON FUNCTION public.fn_get_website_blogs(integer, text, text, boolean, text, text, integer, integer, text[], text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_get_website_blogs(integer, text, text, boolean, text, text, integer, integer, text[], text) TO anon, authenticated, service_role;
