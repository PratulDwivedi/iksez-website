/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : Optional website link and sort order per media item, used by company
                logos (media tagged 'company-logo') in the home page's customer strip.

                link_url   where the logo links to; must be an http(s) URL.
                sort_order lower first; NULL sorts after every numbered item, newest
                           first among themselves — so untouched media keep the
                           existing created_at DESC order.

                fn_save_website_media gains trailing p_link_url and p_sort_order, so
                it's dropped and recreated (a new parameter changes the function's
                identity; CREATE OR REPLACE would leave the old version behind as an
                ambiguous PostgREST overload). Like alt_text and tags, both are
                overwritten on update — the admin always resends the full row.
                fn_get_website_media and fn_list_public_website_media return both new
                columns and order by sort_order first. Grants are re-applied as before.
============================================================================================
*/

ALTER TABLE public.website_media ADD COLUMN link_url text;
ALTER TABLE public.website_media ADD COLUMN sort_order integer;

-- ── Save: + p_link_url, p_sort_order ────────────────────────────────────

DROP FUNCTION public.fn_save_website_media(bigint, text, text, text, text, bigint, text, boolean, text[], jsonb);

CREATE FUNCTION public.fn_save_website_media(
    p_id           bigint  DEFAULT NULL::bigint,
    p_file_name    text    DEFAULT NULL::text,
    p_storage_path text    DEFAULT NULL::text,
    p_url          text    DEFAULT NULL::text,
    p_mime_type    text    DEFAULT NULL::text,
    p_size_bytes   bigint  DEFAULT NULL::bigint,
    p_alt_text     text    DEFAULT NULL::text,
    p_is_public    boolean DEFAULT true,
    p_tags         text[]  DEFAULT NULL::text[],
    p_data         jsonb   DEFAULT '{}'::jsonb,
    p_link_url     text    DEFAULT NULL::text,
    p_sort_order   integer DEFAULT NULL::integer
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx      t_request_context;
    v_id       bigint;
    v_row      jsonb;
    v_link_url text := NULLIF(trim(COALESCE(p_link_url, '')), '');
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_save_website_media');

        IF p_file_name IS NULL OR length(trim(p_file_name)) = 0 THEN
            RAISE EXCEPTION 'file_name is required';
        END IF;
        IF p_storage_path IS NULL OR length(trim(p_storage_path)) = 0 THEN
            RAISE EXCEPTION 'storage_path is required';
        END IF;
        IF p_url IS NULL OR length(trim(p_url)) = 0 THEN
            RAISE EXCEPTION 'url is required';
        END IF;
        IF v_link_url IS NOT NULL AND v_link_url !~* '^https?://' THEN
            RAISE EXCEPTION 'Website link must start with http:// or https://';
        END IF;

        IF p_id IS NULL OR p_id = 0 THEN

            INSERT INTO public.website_media (
                tenant_id, file_name, storage_path, url, mime_type, size_bytes,
                alt_text, is_public, tags, data, link_url, sort_order,
                is_active, created_by, created_at
            ) VALUES (
                v_ctx.tenant_id,
                trim(p_file_name),
                trim(p_storage_path),
                trim(p_url),
                NULLIF(trim(COALESCE(p_mime_type, '')), ''),
                p_size_bytes,
                NULLIF(trim(COALESCE(p_alt_text, '')), ''),
                COALESCE(p_is_public, true),
                p_tags,
                COALESCE(p_data, '{}'::jsonb),
                v_link_url,
                p_sort_order,
                true,
                v_ctx.user_id,
                now()
            )
            RETURNING id INTO v_id;

        ELSE

            UPDATE public.website_media wm
            SET
                file_name   = trim(p_file_name),
                alt_text    = NULLIF(trim(COALESCE(p_alt_text, '')), ''),
                is_public   = COALESCE(p_is_public, wm.is_public),
                tags        = p_tags,
                data        = COALESCE(p_data, wm.data),
                link_url    = v_link_url,
                sort_order  = p_sort_order,
                updated_at  = now(),
                updated_by  = v_ctx.user_id
            WHERE wm.id        = p_id
              AND wm.tenant_id = v_ctx.tenant_id
              AND fn_can_access_row(wm, v_ctx);

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Media with ID % not found or access denied', p_id;
            END IF;

            v_id := p_id;

        END IF;

        SELECT to_jsonb(t) INTO v_row
        FROM (
            SELECT
                wm.id, wm.tenant_id, wm.file_name, wm.storage_path, wm.url, wm.mime_type,
                wm.size_bytes, wm.alt_text, wm.is_public, wm.tags,
                wm.link_url, wm.sort_order,
                COALESCE(wm.data, '{}'::jsonb) AS data,
                wm.is_active, wm.created_at, wm.updated_at
            FROM public.website_media wm
            WHERE wm.id = v_id
        ) t;

        RETURN fn_response_success(
            p_data          := jsonb_build_array(v_row),
            p_message       := CASE
                                   WHEN p_id IS NULL OR p_id = 0
                                   THEN 'Media saved successfully'
                                   ELSE 'Media updated successfully'
                               END,
            p_total_records := 1,
            p_page_size     := 1,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_save_website_media',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

REVOKE ALL ON FUNCTION public.fn_save_website_media(bigint, text, text, text, text, bigint, text, boolean, text[], jsonb, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_save_website_media(bigint, text, text, text, text, bigint, text, boolean, text[], jsonb, text, integer) TO authenticated, service_role;

-- ── Admin read: + link_url, sort_order; ordered by sort_order ───────────

CREATE OR REPLACE FUNCTION public.fn_get_website_media(
    p_id         bigint  DEFAULT NULL::bigint,
    p_is_public  boolean DEFAULT NULL::boolean,
    p_search     text    DEFAULT NULL::text,
    p_page_index integer DEFAULT 1,
    p_page_size  integer DEFAULT 100
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
    v_page_size  integer := GREATEST(COALESCE(p_page_size, 100), 1);
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_get_website_media');

        SELECT count(*)
        INTO   v_total
        FROM   public.website_media wm
        WHERE  wm.tenant_id = v_ctx.tenant_id
          AND  COALESCE(wm.is_active, true) = true
          AND (p_id        IS NULL OR wm.id        = p_id)
          AND (p_is_public IS NULL OR wm.is_public  = p_is_public)
          AND (p_search    IS NULL OR p_search = ''
               OR wm.file_name ILIKE '%' || p_search || '%'
               OR wm.alt_text  ILIKE '%' || p_search || '%');

        SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.sort_order ASC NULLS LAST, p.created_at DESC), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT
                wm.id, wm.tenant_id, wm.file_name, wm.storage_path, wm.url, wm.mime_type,
                wm.size_bytes, wm.alt_text, wm.is_public, wm.tags,
                wm.link_url, wm.sort_order,
                COALESCE(wm.data, '{}'::jsonb) AS data,
                wm.is_active, wm.created_at, wm.updated_at
            FROM public.website_media wm
            WHERE wm.tenant_id = v_ctx.tenant_id
              AND COALESCE(wm.is_active, true) = true
              AND (p_id        IS NULL OR wm.id        = p_id)
              AND (p_is_public IS NULL OR wm.is_public  = p_is_public)
              AND (p_search    IS NULL OR p_search = ''
                   OR wm.file_name ILIKE '%' || p_search || '%'
                   OR wm.alt_text  ILIKE '%' || p_search || '%')
            ORDER BY wm.sort_order ASC NULLS LAST, wm.created_at DESC
            LIMIT v_page_size
            OFFSET (v_page_index - 1) * v_page_size
        ) p;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Media retrieved successfully',
            p_total_records := v_total,
            p_page_size     := v_page_size,
            p_page_index    := v_page_index
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_get_website_media',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Public read: + link_url, sort_order; ordered by sort_order ──────────

CREATE OR REPLACE FUNCTION public.fn_list_public_website_media(
    p_tag        text    DEFAULT NULL::text,
    p_search     text    DEFAULT NULL::text,
    p_page_index integer DEFAULT 1,
    p_page_size  integer DEFAULT 50
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
    v_page_size  integer := GREATEST(COALESCE(p_page_size, 50), 1);
BEGIN
    BEGIN
        BEGIN
            v_ctx := fn_get_request_context('published.fn_list_public_website_media');
        EXCEPTION WHEN OTHERS THEN
            IF SQLERRM LIKE 'No valid authentication found%' THEN
                v_ctx.tenant_id := 1;
            ELSE
                RAISE;
            END IF;
        END;

        SELECT count(*)
        INTO   v_total
        FROM   public.website_media wm
        WHERE  wm.tenant_id = v_ctx.tenant_id
          AND  wm.is_public = true
          AND  COALESCE(wm.is_active, true) = true
          AND (p_tag    IS NULL OR p_tag = ANY(wm.tags))
          AND (p_search IS NULL OR p_search = ''
               OR wm.file_name ILIKE '%' || p_search || '%'
               OR wm.alt_text  ILIKE '%' || p_search || '%');

        SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.sort_order ASC NULLS LAST, p.created_at DESC), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT
                wm.id, wm.file_name, wm.url, wm.mime_type, wm.size_bytes,
                wm.alt_text, wm.tags, wm.link_url, wm.sort_order, wm.created_at
            FROM public.website_media wm
            WHERE wm.tenant_id = v_ctx.tenant_id
              AND wm.is_public = true
              AND COALESCE(wm.is_active, true) = true
              AND (p_tag    IS NULL OR p_tag = ANY(wm.tags))
              AND (p_search IS NULL OR p_search = ''
                   OR wm.file_name ILIKE '%' || p_search || '%'
                   OR wm.alt_text  ILIKE '%' || p_search || '%')
            ORDER BY wm.sort_order ASC NULLS LAST, wm.created_at DESC
            LIMIT v_page_size
            OFFSET (v_page_index - 1) * v_page_size
        ) p;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Public media retrieved successfully',
            p_total_records := v_total,
            p_page_size     := v_page_size,
            p_page_index    := v_page_index
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_list_public_website_media',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;
