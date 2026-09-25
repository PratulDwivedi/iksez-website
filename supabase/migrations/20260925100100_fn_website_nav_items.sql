/*
============================================================================================
Copyright     : Portage Now, 2025
Created By    : Pratul Dwivedi
Modified Date : 25-Sep-2026
Description   : Read/write path for website_nav_items and website_nav_item_translations.

                Public (anon + publishable key, 'published.*'):
                fn_get_website_nav(p_locale)
                    The tenant's published tree as a flat list (each row carries
                    parent_id, its URL path and depth), in the requested locale with
                    per-field English fallback. An unpublished or deleted item hides
                    its whole subtree.

                Admin (session only):
                fn_get_website_nav_items()
                    Every active item, published or not, with its translations.
                fn_save_website_nav_item(...)
                    Insert (p_id NULL) or update one item. Guards: kind-specific required
                    fields, sibling slug uniqueness, parent in the same tenant, no cycles,
                    documents can't have children.
                fn_reorder_website_nav_items(p_ids)
                    Sets sort_order from the array order; all ids must be siblings.
                fn_delete_website_nav_item(p_id)
                    Soft-deletes the item, its whole subtree and their translations, and
                    returns every PDF path they referenced so the caller can remove the
                    files from storage.
                fn_save_website_nav_item_translation(...) /
                fn_delete_website_nav_item_translation(...)
                    Upsert / soft-delete one locale's override, as for blog translations.

                Write guards mirror fn_save_website_blog: same tenant as the caller and
                fn_can_access_row on the website_nav_items row.
============================================================================================
*/

-- ── Public read ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_get_website_nav(
    p_locale text DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_result jsonb;
    -- NULL = English: no translation join.
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
                -- The PDF is the English one although the text is translated
                -- (or the whole item is untranslated).
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
$function$;

-- ── Admin read ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_get_website_nav_items()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_result jsonb;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_get_website_nav_items');

        SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.parent_id NULLS FIRST, r.sort_order, r.id), '[]'::jsonb)
        INTO   v_result
        FROM (
            SELECT
                ni.id, ni.parent_id, ni.slug, ni.kind, ni.title, ni.href, ni.body_html,
                ni.file_path, ni.file_name, ni.open_in_new_tab, ni.show_in_menu,
                ni.sort_order, ni.published, ni.created_at, ni.updated_at,
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object(
                               'locale',    tr.locale,
                               'title',     tr.title,
                               'body_html', tr.body_html,
                               'file_path', tr.file_path,
                               'file_name', tr.file_name,
                               'published', tr.published,
                               'updated_at', tr.updated_at
                           ) ORDER BY tr.locale)
                    FROM public.website_nav_item_translations tr
                    WHERE tr.item_id = ni.id AND tr.is_active
                ), '[]'::jsonb) AS translations
            FROM public.website_nav_items ni
            WHERE ni.tenant_id = v_ctx.tenant_id
              AND ni.is_active
              AND fn_can_access_row(ni, v_ctx)
        ) r;

        RETURN fn_response_success(
            p_data          := v_result,
            p_message       := 'Website navigation items retrieved successfully',
            p_total_records := jsonb_array_length(v_result),
            p_page_size     := jsonb_array_length(v_result),
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_get_website_nav_items',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Save one item ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_save_website_nav_item(
    p_id              integer DEFAULT NULL::integer,
    p_parent_id       integer DEFAULT NULL::integer,
    p_slug            text    DEFAULT NULL::text,
    p_kind            text    DEFAULT NULL::text,
    p_title           text    DEFAULT NULL::text,
    p_href            text    DEFAULT NULL::text,
    p_body_html       text    DEFAULT NULL::text,
    p_file_path       text    DEFAULT NULL::text,
    p_file_name       text    DEFAULT NULL::text,
    p_open_in_new_tab boolean DEFAULT false,
    p_show_in_menu    boolean DEFAULT true,
    p_published       boolean DEFAULT true
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx      t_request_context;
    v_item     public.website_nav_items;
    v_parent   public.website_nav_items;
    v_slug     text := lower(trim(COALESCE(p_slug, '')));
    v_kind     text := lower(trim(COALESCE(p_kind, '')));
    v_href     text := NULLIF(trim(COALESCE(p_href, '')), '');
    v_body     text := NULLIF(trim(COALESCE(p_body_html, '')), '');
    v_file     text := NULLIF(trim(COALESCE(p_file_path, '')), '');
    v_fname    text := NULLIF(trim(COALESCE(p_file_name, '')), '');
    v_tenant   integer;
    v_order    integer;
    v_id       integer;
    v_row      jsonb;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_save_website_nav_item');
        v_tenant := v_ctx.tenant_id;

        -- ── Input guards ────────────────────────────────────────────
        IF v_kind NOT IN ('link', 'page', 'document') THEN
            RAISE EXCEPTION 'kind must be link, page or document';
        END IF;
        IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
            RAISE EXCEPTION 'title is required';
        END IF;
        IF v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
            RAISE EXCEPTION 'slug must be lowercase letters, numbers and single hyphens (got "%")', p_slug;
        END IF;
        IF v_kind = 'link' AND v_href IS NULL THEN
            RAISE EXCEPTION 'A link needs a route or URL';
        END IF;
        IF v_kind = 'document' AND v_file IS NULL THEN
            RAISE EXCEPTION 'A document needs an uploaded PDF';
        END IF;

        -- ── Existing row: same tenant + row access ──────────────────
        IF p_id IS NOT NULL THEN
            SELECT * INTO v_item
            FROM public.website_nav_items ni
            WHERE ni.id = p_id AND ni.tenant_id = v_tenant AND ni.is_active;

            IF NOT FOUND OR NOT fn_can_access_row(v_item, v_ctx) THEN
                RAISE EXCEPTION 'Navigation item with ID % not found or access denied', p_id;
            END IF;

            IF v_kind = 'document' AND EXISTS (
                SELECT 1 FROM public.website_nav_items c
                WHERE c.parent_id = p_id AND c.is_active
            ) THEN
                RAISE EXCEPTION 'An item with children can''t become a document';
            END IF;
        END IF;

        -- ── Parent: same tenant, not a document, no cycle ───────────
        IF p_parent_id IS NOT NULL THEN
            SELECT * INTO v_parent
            FROM public.website_nav_items ni
            WHERE ni.id = p_parent_id AND ni.tenant_id = v_tenant AND ni.is_active;

            IF NOT FOUND THEN
                RAISE EXCEPTION 'Parent item with ID % not found', p_parent_id;
            END IF;
            IF v_parent.kind = 'document' THEN
                RAISE EXCEPTION 'A document can''t have child items';
            END IF;

            IF p_id IS NOT NULL AND EXISTS (
                WITH RECURSIVE sub AS (
                    SELECT p_id AS id
                    UNION ALL
                    SELECT c.id FROM public.website_nav_items c JOIN sub ON c.parent_id = sub.id
                )
                SELECT 1 FROM sub WHERE sub.id = p_parent_id
            ) THEN
                RAISE EXCEPTION 'An item can''t be moved under itself or one of its children';
            END IF;
        END IF;

        -- ── Sibling slug uniqueness (friendly message before the index) ──
        IF EXISTS (
            SELECT 1 FROM public.website_nav_items s
            WHERE s.tenant_id = v_tenant
              AND s.is_active
              AND COALESCE(s.parent_id, 0) = COALESCE(p_parent_id, 0)
              AND s.slug = v_slug
              AND s.id IS DISTINCT FROM p_id
        ) THEN
            RAISE EXCEPTION 'Another item at this level already uses the slug "%"', v_slug;
        END IF;

        -- New items, and items moved to a new parent, go to the end.
        IF p_id IS NULL OR v_item.parent_id IS DISTINCT FROM p_parent_id THEN
            SELECT COALESCE(max(s.sort_order), 0) + 1 INTO v_order
            FROM public.website_nav_items s
            WHERE s.tenant_id = v_tenant
              AND s.is_active
              AND COALESCE(s.parent_id, 0) = COALESCE(p_parent_id, 0);
        ELSE
            v_order := v_item.sort_order;
        END IF;

        IF p_id IS NULL THEN
            INSERT INTO public.website_nav_items (
                parent_id, slug, kind, title, href, body_html, file_path, file_name,
                open_in_new_tab, show_in_menu, sort_order, published,
                tenant_id, is_active, created_by, created_at
            ) VALUES (
                p_parent_id, v_slug, v_kind, trim(p_title), v_href, v_body, v_file, v_fname,
                COALESCE(p_open_in_new_tab, false), COALESCE(p_show_in_menu, true),
                v_order, COALESCE(p_published, true),
                v_tenant, true, v_ctx.user_id, now()
            )
            RETURNING id INTO v_id;
        ELSE
            UPDATE public.website_nav_items ni
            SET    parent_id       = p_parent_id,
                   slug            = v_slug,
                   kind            = v_kind,
                   title           = trim(p_title),
                   href            = v_href,
                   body_html       = v_body,
                   file_path       = v_file,
                   file_name       = v_fname,
                   open_in_new_tab = COALESCE(p_open_in_new_tab, false),
                   show_in_menu    = COALESCE(p_show_in_menu, true),
                   sort_order      = v_order,
                   published       = COALESCE(p_published, true),
                   updated_at      = now(),
                   updated_by      = v_ctx.user_id
            WHERE  ni.id = p_id;
            v_id := p_id;
        END IF;

        SELECT to_jsonb(t) INTO v_row
        FROM (
            SELECT ni.id, ni.parent_id, ni.slug, ni.kind, ni.title, ni.href, ni.body_html,
                   ni.file_path, ni.file_name, ni.open_in_new_tab, ni.show_in_menu,
                   ni.sort_order, ni.published, ni.created_at, ni.updated_at
            FROM public.website_nav_items ni
            WHERE ni.id = v_id
        ) t;

        RETURN fn_response_success(
            p_data          := jsonb_build_array(v_row),
            p_message       := 'Navigation item saved successfully',
            p_total_records := 1,
            p_page_size     := 1,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_save_website_nav_item',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Reorder siblings ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_reorder_website_nav_items(
    p_ids integer[] DEFAULT NULL::integer[]
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx     t_request_context;
    v_count   integer;
    v_parents integer;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_reorder_website_nav_items');

        IF p_ids IS NULL OR cardinality(p_ids) = 0 THEN
            RAISE EXCEPTION 'ids are required';
        END IF;

        SELECT count(*), count(DISTINCT COALESCE(ni.parent_id, 0))
        INTO   v_count, v_parents
        FROM   public.website_nav_items ni
        WHERE  ni.id = ANY(p_ids)
          AND  ni.tenant_id = v_ctx.tenant_id
          AND  ni.is_active
          AND  fn_can_access_row(ni, v_ctx);

        IF v_count <> cardinality(p_ids) THEN
            RAISE EXCEPTION 'One or more navigation items not found or access denied';
        END IF;
        IF v_parents <> 1 THEN
            RAISE EXCEPTION 'Only items under the same parent can be reordered together';
        END IF;

        UPDATE public.website_nav_items ni
        SET    sort_order = o.pos,
               updated_at = now(),
               updated_by = v_ctx.user_id
        FROM   unnest(p_ids) WITH ORDINALITY AS o(id, pos)
        WHERE  ni.id = o.id
          AND  ni.sort_order IS DISTINCT FROM o.pos::integer;

        RETURN fn_response_success(
            p_data          := '[]'::jsonb,
            p_message       := 'Navigation items reordered successfully',
            p_total_records := 0,
            p_page_size     := 0,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_reorder_website_nav_items',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Delete an item and its subtree ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_delete_website_nav_item(
    p_id integer DEFAULT NULL::integer
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx   t_request_context;
    v_item  public.website_nav_items;
    v_ids   integer[];
    v_files jsonb;
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_delete_website_nav_item');

        SELECT * INTO v_item
        FROM public.website_nav_items ni
        WHERE ni.id = p_id AND ni.tenant_id = v_ctx.tenant_id AND ni.is_active;

        IF NOT FOUND OR NOT fn_can_access_row(v_item, v_ctx) THEN
            RAISE EXCEPTION 'Navigation item with ID % not found or access denied', p_id;
        END IF;

        WITH RECURSIVE sub AS (
            SELECT p_id AS id
            UNION ALL
            SELECT c.id FROM public.website_nav_items c
            JOIN sub ON c.parent_id = sub.id
            WHERE c.is_active
        )
        SELECT array_agg(id) INTO v_ids FROM sub;

        SELECT COALESCE(jsonb_agg(DISTINCT f.path), '[]'::jsonb) INTO v_files
        FROM (
            SELECT ni.file_path AS path FROM public.website_nav_items ni
            WHERE ni.id = ANY(v_ids) AND ni.file_path IS NOT NULL
            UNION
            SELECT tr.file_path FROM public.website_nav_item_translations tr
            WHERE tr.item_id = ANY(v_ids) AND tr.is_active AND tr.file_path IS NOT NULL
        ) f;

        UPDATE public.website_nav_item_translations tr
        SET    is_active = false, updated_at = now(), updated_by = v_ctx.user_id
        WHERE  tr.item_id = ANY(v_ids) AND tr.is_active;

        UPDATE public.website_nav_items ni
        SET    is_active = false, updated_at = now(), updated_by = v_ctx.user_id
        WHERE  ni.id = ANY(v_ids);

        RETURN fn_response_success(
            p_data          := v_files,
            p_message       := 'Navigation item deleted successfully',
            p_total_records := cardinality(v_ids),
            p_page_size     := cardinality(v_ids),
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_delete_website_nav_item',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Translations ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_save_website_nav_item_translation(
    p_item_id   integer DEFAULT NULL::integer,
    p_locale    text    DEFAULT NULL::text,
    p_title     text    DEFAULT NULL::text,
    p_body_html text    DEFAULT NULL::text,
    p_file_path text    DEFAULT NULL::text,
    p_file_name text    DEFAULT NULL::text,
    p_published boolean DEFAULT true
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_item   public.website_nav_items;
    v_locale text := lower(trim(COALESCE(p_locale, '')));
    v_file   text := NULLIF(trim(COALESCE(p_file_path, '')), '');
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_save_website_nav_item_translation');

        IF v_locale !~ '^[a-z]{2,3}$' THEN
            RAISE EXCEPTION 'Invalid locale "%"', p_locale;
        END IF;
        IF v_locale = 'en' THEN
            RAISE EXCEPTION 'English content is saved on the navigation item itself, not as a translation';
        END IF;
        IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
            RAISE EXCEPTION 'title is required';
        END IF;

        SELECT * INTO v_item
        FROM public.website_nav_items ni
        WHERE ni.id = p_item_id AND ni.tenant_id = v_ctx.tenant_id AND ni.is_active;

        IF NOT FOUND OR NOT fn_can_access_row(v_item, v_ctx) THEN
            RAISE EXCEPTION 'Navigation item with ID % not found or access denied', p_item_id;
        END IF;

        INSERT INTO public.website_nav_item_translations AS tr (
            item_id, locale, title, body_html, file_path, file_name, published,
            tenant_id, is_active, created_by, created_at
        ) VALUES (
            p_item_id,
            v_locale,
            trim(p_title),
            NULLIF(trim(COALESCE(p_body_html, '')), ''),
            v_file,
            CASE WHEN v_file IS NULL THEN NULL ELSE NULLIF(trim(COALESCE(p_file_name, '')), '') END,
            COALESCE(p_published, true),
            v_item.tenant_id, true, v_ctx.user_id, now()
        )
        ON CONFLICT (item_id, locale) DO UPDATE SET
            title      = EXCLUDED.title,
            body_html  = EXCLUDED.body_html,
            file_path  = EXCLUDED.file_path,
            file_name  = EXCLUDED.file_name,
            published  = EXCLUDED.published,
            is_active  = true,
            updated_at = now(),
            updated_by = v_ctx.user_id;

        RETURN fn_response_success(
            p_data          := '[]'::jsonb,
            p_message       := 'Navigation item translation saved successfully',
            p_total_records := 1,
            p_page_size     := 1,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_save_website_nav_item_translation',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.fn_delete_website_nav_item_translation(
    p_item_id integer DEFAULT NULL::integer,
    p_locale  text    DEFAULT NULL::text
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_ctx    t_request_context;
    v_item   public.website_nav_items;
    v_locale text := lower(trim(COALESCE(p_locale, '')));
BEGIN
    BEGIN
        v_ctx := fn_get_request_context('fn_delete_website_nav_item_translation');

        SELECT * INTO v_item
        FROM public.website_nav_items ni
        WHERE ni.id = p_item_id AND ni.tenant_id = v_ctx.tenant_id AND ni.is_active;

        IF NOT FOUND OR NOT fn_can_access_row(v_item, v_ctx) THEN
            RAISE EXCEPTION 'Navigation item with ID % not found or access denied', p_item_id;
        END IF;

        UPDATE public.website_nav_item_translations tr
        SET    is_active  = false,
               updated_at = now(),
               updated_by = v_ctx.user_id
        WHERE  tr.item_id = p_item_id
          AND  tr.locale  = v_locale
          AND  tr.is_active;

        RETURN fn_response_success(
            p_data          := '[]'::jsonb,
            p_message       := 'Navigation item translation deleted successfully',
            p_total_records := 0,
            p_page_size     := 0,
            p_page_index    := 1
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN fn_response_error(
            'fn_delete_website_nav_item_translation',
            SQLERRM,
            '[]'::jsonb,
            v_ctx.tenant_id,
            v_ctx.user_id
        );
    END;
END;
$function$;

-- ── Grants ───────────────────────────────────────────────────────────────

-- The public site reads the nav with its publishable key (anon role).
REVOKE ALL ON FUNCTION public.fn_get_website_nav(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_get_website_nav(text) TO anon, authenticated, service_role;

-- Signed-in admins only: no anon, no PUBLIC.
REVOKE ALL ON FUNCTION public.fn_get_website_nav_items() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_save_website_nav_item(integer, integer, text, text, text, text, text, text, text, boolean, boolean, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_reorder_website_nav_items(integer[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_delete_website_nav_item(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_save_website_nav_item_translation(integer, text, text, text, text, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_delete_website_nav_item_translation(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_get_website_nav_items() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_save_website_nav_item(integer, integer, text, text, text, text, text, text, text, boolean, boolean, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_reorder_website_nav_items(integer[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_delete_website_nav_item(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_save_website_nav_item_translation(integer, text, text, text, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_delete_website_nav_item_translation(integer, text) TO authenticated, service_role;
