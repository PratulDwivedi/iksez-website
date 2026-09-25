// A media item's "type" is stored as a reserved tag in website_media.tags
// rather than its own column, so fn_save_website_media and
// fn_list_public_website_media (which already filters by exact tag via
// /api/media?tag=…) need no schema change. "General" is the absence of any
// type tag; other tags on the row are left untouched when the type changes.
export const MEDIA_TYPES = [
  { value: 'general', label: 'General', tag: null },
  { value: 'company-logo', label: 'Company logo', tag: 'company-logo' },
] as const;

export type MediaType = (typeof MEDIA_TYPES)[number]['value'];

export const COMPANY_LOGO_TAG = 'company-logo';

const TYPE_TAGS: string[] = MEDIA_TYPES.flatMap((t) => (t.tag ? [t.tag] : []));

export function getMediaType(tags: string[] | null): MediaType {
  return MEDIA_TYPES.find((t) => t.tag && tags?.includes(t.tag))?.value ?? 'general';
}

export function withMediaType(tags: string[] | null, type: MediaType): string[] | null {
  const tag = MEDIA_TYPES.find((t) => t.value === type)?.tag ?? null;
  const next = [...(tags ?? []).filter((t) => !TYPE_TAGS.includes(t)), ...(tag ? [tag] : [])];
  return next.length > 0 ? next : null;
}
