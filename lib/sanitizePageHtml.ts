import sanitizeHtml from 'sanitize-html';
import { localizePath, stripLocale, type Locale } from '@/lib/i18n/config';

// CMS page bodies (website_nav_items.body_html) are written by admins in the
// TipTap editor, but they're rendered with dangerouslySetInnerHTML on the
// public site, so anything outside what the editor can produce is stripped
// here before render: no scripts, styles, iframes, event handlers or
// javascript: URLs, whatever ends up in the column.
const BASE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre',
    'blockquote', 'hr', 'ul', 'ol', 'li', 'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    ol: ['start'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
};

// `locale` localizes internal links ("/contact-us/" -> "/te/contact-us/")
// so a Telugu page's links stay on the Telugu site.
export function sanitizePageHtml(html: string | null | undefined, locale: Locale): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    ...BASE_OPTIONS,
    transformTags: {
      // The page H1 is the hero title; an editor-chosen H1 becomes an H2.
      h1: 'h2',
      a: (tagName, attribs) => {
        const next = { ...attribs };
        // stripLocale first, so a link an editor already wrote as /te/... isn't doubled.
        if (next.href?.startsWith('/') && !next.href.startsWith('//')) next.href = localizePath(stripLocale(next.href), locale);
        if (next.target === '_blank') next.rel = 'noopener noreferrer';
        return { tagName, attribs: next };
      },
    },
  }).trim();
}

// True when the body has no visible content, e.g. the editor's empty "<p></p>".
export function isBlankHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  return sanitizeHtml(html, { allowedTags: ['img', 'hr', 'table'], allowedAttributes: {} }).trim() === '';
}
