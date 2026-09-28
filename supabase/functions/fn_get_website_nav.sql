CREATE OR REPLACE FUNCTION public.fn_get_website_nav(p_locale text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_result jsonb;
    v_locale text := NULLIF(NULLIF(lower(trim(COALESCE(p_locale, ''))), ''), 'en');
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('published.fn_get_website_nav');

        WITH RECURSIVE tree AS (
            SELECT ni.*, ni.slug::text AS path, 0 AS depth
            FROM   public.website_nav_items ni
            WHERE  ni.tenant_id = v_ctx.tenant_id
              AND  ni.parent_id IS NULL
              AND  ni.is_active AND ni.published
            UNION ALL
            SELECT ni.*, tree.path || '/' || ni.slug, tree.depth + 1
            FROM   public.website_nav_items ni
            JOIN   tree ON ni.parent_id = tree.id
            WHERE  ni.is_active AND ni.published
        )
        SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.depth, r.sort_order, r.id), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT
                t.id,
                t.parent_id,
                t.slug,
                t.path,
                t.depth,
                t.kind,
                COALESCE(tr.title, t.title)                         AS title,
                COALESCE(tr.description, t.description)             AS description,
                t.href,
                COALESCE(tr.body_html, t.body_html)                 AS body_html,
                COALESCE(tr.file_path, t.file_path)                 AS file_path,
                CASE WHEN tr.file_path IS NOT NULL THEN tr.file_name
                     ELSE t.file_name END                           AS file_name,
                t.open_in_new_tab,
                t.show_in_menu,
                t.sort_order,
                t.updated_at,
                CASE WHEN tr.id IS NOT NULL THEN v_locale ELSE 'en' END AS locale,
                (v_locale IS NOT NULL AND tr.id IS NULL)            AS is_fallback,
                (v_locale IS NOT NULL AND t.kind = 'document'
                    AND tr.file_path IS NULL)                       AS file_is_fallback
            FROM tree t
            LEFT JOIN public.website_nav_item_translations tr
                   ON  v_locale IS NOT NULL
                   AND tr.item_id   = t.id
                   AND tr.locale    = v_locale
                   AND tr.is_active
                   AND tr.published
        ) r;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Website navigation retrieved successfully',
            p_total_records := jsonb_array_length(v_result),
            p_page_size     := jsonb_array_length(v_result),
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_get_website_nav',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$
