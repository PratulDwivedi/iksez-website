import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "./config";
import type en from "./dictionaries/en.json";
import type te from "./dictionaries/te.json";

// en.json is the source of truth for the dictionary's shape. The assertion
// below makes a key that's missing from (or misspelled in) te.json a type
// error at build time, instead of an `undefined` rendered on a Telugu page.
export type Dictionary = typeof en;
type AssertComplete<T extends Dictionary> = T;
export type _TeluguIsComplete = AssertComplete<typeof te>;

// Dynamic imports keep each locale's strings in its own chunk, and since
// this only runs in Server Components none of it reaches the client bundle
// (client components get just the slice they need, as props).
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  te: () => import("./dictionaries/te.json").then((m) => m.default),
};

// The current request's locale — the [lang] root param of the marketing
// routes (app/(marketing)/[lang]/layout.tsx). Callable from any Server
// Component or server utility without threading `lang` through props.
// Not usable inside unstable_cache or Server Actions (Next.js restriction),
// so pass the locale in explicitly there.
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (value === undefined) return defaultLocale;
  if (!hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  return dictionaries[locale ?? (await getLocale())]();
}
