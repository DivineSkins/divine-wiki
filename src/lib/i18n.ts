import { defineI18n } from "fumadocs-core/i18n";

// Scoped to Divine's top four markets (France, Turkey, Brazil, global English).
// Additional locales get added as Crowdin translators come online.
export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: ["en", "fr-FR", "tr-TR", "pt-BR", "pl-PL", "vi-VN"],
  parser: "dir",
});

export const ogLanguageBlacklist: string[] = [];
