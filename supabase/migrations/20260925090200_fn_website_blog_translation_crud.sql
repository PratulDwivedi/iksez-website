/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : Admin read/write path for website_blog_translations.

                fn_get_website_blog_translations(p_blog_id)
                    Every active translation of one post, published or not — for the
                    admin editor's language tabs. (The public site reads translations
                    only through fn_get_website_blogs(p_locale := ...).)

                fn_save_website_blog_translation(p_blog_id, p_locale, ...)
                    Upsert on (blog_id, locale); saving over a soft-deleted row revives it.

                fn_delete_website_blog_translation(p_blog_id, p_locale)
                    Soft delete (is_active = false), same convention as the other
                    website_* tables. The post falls back to English for that locale.

                All three gate on the parent post exactly like fn_save_website_blog's
                UPDATE branch: same tenant as the caller, and fn_can_access_row on the
                website_blogs row. Session (JWT) callers only — none of these are
                'published.*', so fn_get_request_context rejects publishable API keys.
============================================================================================
*/

CREATE OR REPLACE FUNCTION public.fn_get_website_blog_translations(
    p_blog_id integer DEFAULT NULL::integer
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_blog   public.website_blogs;
    v_result jsonb;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_get_website_blog_translations');

        SELECT * INTO v_blog
        FROM public.website_blogs wb
        WHERE wb.id = p_blog_id
          AND wb.tenant_id = v_ctx.tenant_id
          AND COALESCE(wb.is_active, true) = true;

        IF NOT FOUND OR NOT fn_can_access_row(v_blog, v_ctx) THEN
            RAISE EXCEPTION 'Website blog with ID % not found or access denied', p_blog_id;
        END IF;

        SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.locale), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT tr.id, tr.blog_id, tr.locale, tr.title, tr.excerpt, tr.cover_alt,
                   tr.body, COALESCE(tr.data, '{}'::jsonb) AS data, tr.published,
                   tr.created_at, tr.updated_at
            FROM public.website_blog_translations tr
            WHERE tr.blog_id = p_blog_id
              AND tr.is_active = true
        ) t;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Website blog translations retrieved successfully',
            p_total_records := jsonb_array_length(v_result),
            p_page_size     := jsonb_array_length(v_result),
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_get_website_blog_translations',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_save_website_blog_translation(
    p_blog_id   integer DEFAULT NULL::integer,
    p_locale    text    DEFAULT NULL::text,
    p_title     text    DEFAULT NULL::text,
    p_excerpt   text    DEFAULT NULL::text,
    p_cover_alt text    DEFAULT NULL::text,
    p_body      jsonb   DEFAULT NULL::jsonb,
    p_data      jsonb   DEFAULT '{}'::jsonb,
    p_published boolean DEFAULT true
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_blog   public.website_blogs;
    v_locale text := lower(trim(COALESCE(p_locale, '')));
    v_id     integer;
    v_row    jsonb;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_save_website_blog_translation');

        -- ── Input guards ────────────────────────────────────────────
        IF p_blog_id IS NULL THEN
            RAISE EXCEPTION 'blog_id is required';
        END IF;
        IF v_locale !~ '^[a-z]{2,3}$' THEN
            RAISE EXCEPTION 'Invalid locale "%"', p_locale;
        END IF;
        IF v_locale = 'en' THEN
            RAISE EXCEPTION 'English content is saved on the blog post itself, not as a translation';
        END IF;
        IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
            RAISE EXCEPTION 'title is required';
        END IF;
        IF p_excerpt IS NULL OR length(trim(p_excerpt)) = 0 THEN
            RAISE EXCEPTION 'excerpt is required';
        END IF;
        IF p_body IS NULL OR jsonb_typeof(p_body) <> 'array' OR jsonb_array_length(p_body) = 0 THEN
            RAISE EXCEPTION 'body is required';
        END IF;

        -- ── Parent post: same tenant + row access ───────────────────
        SELECT * INTO v_blog
        FROM public.website_blogs wb
        WHERE wb.id = p_blog_id
          AND wb.tenant_id = v_ctx.tenant_id
          AND COALESCE(wb.is_active, true) = true;

        IF NOT FOUND OR NOT fn_can_access_row(v_blog, v_ctx) THEN
            RAISE EXCEPTION 'Website blog with ID % not found or access denied', p_blog_id;
        END IF;

        -- ── UPSERT ──────────────────────────────────────────────────
        INSERT INTO public.website_blog_translations AS tr (
            blog_id, locale, title, excerpt, cover_alt, body, data, published,
            tenant_id, is_active, created_by, created_at
        ) VALUES (
            p_blog_id,
            v_locale,
            trim(p_title),
            trim(p_excerpt),
            NULLIF(trim(COALESCE(p_cover_alt, '')), ''),
            p_body,
            COALESCE(p_data, '{}'::jsonb),
            COALESCE(p_published, true),
            v_blog.tenant_id, true,
            v_ctx.user_id, now()
        )
        ON CONFLICT (blog_id, locale) DO UPDATE SET
            title      = EXCLUDED.title,
            excerpt    = EXCLUDED.excerpt,
            cover_alt  = EXCLUDED.cover_alt,
            body       = EXCLUDED.body,
            data       = EXCLUDED.data,
            published  = EXCLUDED.published,
            is_active  = true,
            updated_at = now(),
            updated_by = v_ctx.user_id
        RETURNING tr.id INTO v_id;

        SELECT to_jsonb(t) INTO v_row
        FROM (
            SELECT tr.id, tr.blog_id, tr.locale, tr.title, tr.excerpt, tr.cover_alt,
                   tr.body, COALESCE(tr.data, '{}'::jsonb) AS data, tr.published,
                   tr.created_at, tr.updated_at
            FROM public.website_blog_translations tr
            WHERE tr.id = v_id
        ) t;

        RETURN fn_response_success(
            p_data          := jsonb_build_array(v_row),
            p_message       := 'Website blog translation saved successfully',
            p_total_records := 1,
            p_page_size     := 1,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_save_website_blog_translation',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_delete_website_blog_translation(
    p_blog_id integer DEFAULT NULL::integer,
    p_locale  text    DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_blog   public.website_blogs;
    v_locale text := lower(trim(COALESCE(p_locale, '')));
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_delete_website_blog_translation');

        SELECT * INTO v_blog
        FROM public.website_blogs wb
        WHERE wb.id = p_blog_id
          AND wb.tenant_id = v_ctx.tenant_id
          AND COALESCE(wb.is_active, true) = true;

        IF NOT FOUND OR NOT fn_can_access_row(v_blog, v_ctx) THEN
            RAISE EXCEPTION 'Website blog with ID % not found or access denied', p_blog_id;
        END IF;

        UPDATE public.website_blog_translations tr
        SET    is_active  = false,
               updated_at = now(),
               updated_by = v_ctx.user_id
        WHERE  tr.blog_id = p_blog_id
          AND  tr.locale  = v_locale
          AND  tr.is_active = true;

        RETURN fn_response_success(
            p_data          := '[]'::jsonb,
            p_message       := 'Website blog translation deleted successfully',
            p_total_records := 0,
            p_page_size     := 0,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_delete_website_blog_translation',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- Signed-in admins only: no anon, no PUBLIC.
REVOKE ALL ON FUNCTION public.fn_get_website_blog_translations(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_save_website_blog_translation(integer, text, text, text, text, jsonb, jsonb, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_delete_website_blog_translation(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_get_website_blog_translations(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_save_website_blog_translation(integer, text, text, text, text, jsonb, jsonb, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_delete_website_blog_translation(integer, text) TO authenticated, service_role;
