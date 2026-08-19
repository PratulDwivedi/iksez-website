import { createClient } from '@/lib/supabase/server';
import { callRpc } from '@/lib/supabase/rpc';

export interface QuickListItem {
  id: number;
  name: string;
  code: string | null;
  display_order: number | null;
}

// parent_id of the quick_lists row that groups blog category options (see
// supabase/tables/quick_lists.sql — id=1, name="Website Categories").
export const BLOG_CATEGORY_PARENT_ID = 1;

// Session-based (admin's JWT resolves their own tenant via
// fn_get_request_context, same as fn_get_website_blogs) — for admin forms
// only. quick_lists has RLS enabled with zero policies, so this RPC is the
// only read path (see supabase/functions/fn_get_quick_lists.sql).
export async function getQuickList(parentId: number): Promise<QuickListItem[]> {
  const supabase = await createClient();
  const { data, error } = await callRpc<QuickListItem[]>(supabase, 'fn_get_quick_lists', {
    p_parent_id: parentId,
  });

  if (error) throw new Error(error);
  return data ?? [];
}
