import { i18n } from "./i18n";
import en from "../../messages/en.json";
import frFR from "../../messages/fr-FR.json";
import trTR from "../../messages/tr-TR.json";
import ptBR from "../../messages/pt-BR.json";
import plPL from "../../messages/pl-PL.json";

export type Messages = typeof en;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  // At a leaf (or when the shapes diverge) the override value wins — that is
  // the whole point of merging a translation over English. Returning `base`
  // here was a long-standing bug: every leaf string fell back to English, so
  // getMessages(locale) handed back English content for every non-English
  // locale (only surfaced once pt-BR shipped real UI strings).
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = deepMerge(
      (base as Record<string, unknown>)[key] as unknown,
      (override as Record<string, unknown>)[key],
    );
  }
  return out as T;
}

// Locale message bundles. Non-English locales are merged over English so every
// key in the Messages shape is populated even when a translation file is
// partial (Crowdin-managed files are sometimes just `displayName` before their
// first sync). Imported statically — a dynamic `require(`.../${locale}.json`)`
// bundles the files but does not reliably resolve at runtime under Turbopack,
// which silently fell back every non-English locale to English.
const messages: Record<string, Messages> = {
  en,
  "fr-FR": deepMerge(en, frFR),
  "tr-TR": deepMerge(en, trTR),
  "pt-BR": deepMerge(en, ptBR),
  "pl-PL": deepMerge(en, plPL),
};

export function getLocale(routeLang?: string) {
  const isSupported = (l?: string): l is (typeof i18n.languages)[number] => {
    return !!l && (i18n.languages as string[]).includes(l);
  };
  if (routeLang && isSupported(routeLang)) return routeLang;

  return i18n.defaultLanguage;
}

export function localizeHref(href: string, routeLang?: string) {
  const locale = getLocale(routeLang);
  const defaultLang = i18n.defaultLanguage;
  if (locale === defaultLang) return href;
  return `/${locale}${href.startsWith("/") ? href : "/" + href}`;
}

export function getMessages(locale?: string): Messages {
  const validLocale = getLocale(locale);
  return messages[validLocale] || messages.en;
}
