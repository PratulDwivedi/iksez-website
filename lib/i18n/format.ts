// Fills {name} placeholders in a dictionary string: format("By {author}",
// { author: "Jane" }) -> "By Jane". Unknown placeholders are left as-is so a
// typo shows up on the page instead of silently vanishing. Client-safe.
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
