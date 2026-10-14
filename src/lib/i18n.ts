import { defineI18n } from "fumadocs-core/i18n";

// Scoped to Divine's top four markets (France, Turkey, Brazil, global English).
// Additional locales get added as Crowdin translators come online.
export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "fr-FR", "tr-TR", "pt-BR", "pl-PL", "vi-VN"],
  parser: "dir",
});

export const ogLanguageBlacklist: string[] = [];

/**
 * The homepage for a locale. English lives at the bare domain (`/`, served
 * by a rewrite to `/en` in next.config.mjs); every other locale keeps its
 * prefix so its readers land in their own language.
 */
export function homePath(lang: string): string {
  return lang === i18n.defaultLanguage ? "/" : `/${lang}`;
}
