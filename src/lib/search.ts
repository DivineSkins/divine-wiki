import { acceptsGuides, ENGLISH_ONLY_GAMES, GAMES } from "@/lib/games";

/**
 * Search runs on one static index per locale and game, so a reader downloads
 * only the guides of the game they search. Built by
 * src/app/api/search/[locale]/[game]/route.ts and published by
 * scripts/export-search.mjs as public/search/<hash>/<locale>/<game>.json.
 *
 * Client-safe: the dialog and the index build both read this file, so the
 * query and the index always tokenize the same way.
 */

/** Games with an index: every game whose segment has guide categories. */
export const SEARCH_GAMES: string[] = GAMES.map((game) => game.slug).filter(
  acceptsGuides,
);

// Orama rejects locale codes ("fr-FR") and wants language names. Keys must
// match the languages in src/lib/i18n.ts.
const LANGUAGES: Record<string, string> = {
  en: "english",
  "fr-FR": "french",
  "tr-TR": "turkish",
  "pt-BR": "portuguese",
  // Orama ships no Polish stemmer; english tokenization is the fallback
  // (exact-ish matching, no stemming of Polish inflections).
  "pl-PL": "english",
  // No Vietnamese stemmer either; Vietnamese is analytic (no inflection),
  // so english tokenization loses little.
  "vi-VN": "english",
};

/**
 * Orama language for one index. An English-only game shows English guides
 * in every locale, so its index is stemmed as English everywhere.
 */
export function searchLanguage(locale: string, game: string): string {
  return ENGLISH_ONLY_GAMES.has(game)
    ? "english"
    : (LANGUAGES[locale] ?? "english");
}

/** The game whose guides a path shows ("/en/docs/deadlock/..." → "deadlock"). */
export function searchGameFromPath(pathname: string): string | undefined {
  const [, , docs, game] = pathname.split("/");
  return docs === "docs" && SEARCH_GAMES.includes(game) ? game : undefined;
}
