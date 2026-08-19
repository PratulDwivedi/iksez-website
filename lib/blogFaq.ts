// website_blogs.data is an open-ended jsonb metadata bucket (see
// supabase/tables/website_blogs.sql). FAQs are optional and live at
// data.faqs — an array of {question, answer} pairs. The admin editor
// represents this as one plain-text field ("Q: ...\nA: ...", blank line
// between pairs), the same "one text field, no dynamic form state"
// convention blogBody.ts already uses for the post body.

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqsToText(faqs: FaqItem[] | null | undefined): string {
  if (!faqs?.length) return '';
  return faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
}

export function textToFaqs(text: string): FaqItem[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const question = (lines[0] ?? '').replace(/^Q:\s*/i, '').trim();
      const answer = lines.slice(1).join(' ').replace(/^A:\s*/i, '').trim();
      return { question, answer };
    })
    .filter((f) => f.question && f.answer);
}
