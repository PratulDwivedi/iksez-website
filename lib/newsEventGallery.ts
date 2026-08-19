// website_news_events.gallery is jsonb: [{"url": "...", "caption": "..."}].
// The admin editor represents this as one plain-text field, one image per
// line as "url | caption" — the same "one text field, no dynamic form
// state" convention blogBody.ts (body) and blogFaq.ts (FAQs) already use.

export interface GalleryImage {
  url: string;
  caption: string;
}

export function galleryToText(gallery: GalleryImage[] | null | undefined): string {
  if (!gallery?.length) return '';
  return gallery.map((g) => `${g.url} | ${g.caption}`).join('\n');
}

export function textToGallery(text: string): GalleryImage[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url, ...rest] = line.split('|');
      return { url: url.trim(), caption: rest.join('|').trim() };
    })
    .filter((g) => g.url);
}
