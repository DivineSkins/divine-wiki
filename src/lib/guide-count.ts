import { source } from "@/lib/source";
import { GAMES, type GameEntry, type GameStatusLabels } from "@/lib/games";

/**
 * English guides in a game segment. Index pages don't count: the segment's own
 * landing (`<slug>`) and each category landing (`<slug>/<category>`) sit at
 * depth 1 and 2, so a guide is anything deeper.
 */
export function countGuides(slug: string): number {
  return source
    .getPages()
    .filter(
      (p) => p.locale === "en" && p.slugs[0] === slug && p.slugs.length > 2,
    ).length;
}

/**
 * Every game with its link and status line. A game goes live (gets an
 * `href`) once its segment has English guides; until then it reads
 * "Coming soon". The homepage cards and the header's Guides menu both use
 * this, so they always agree.
 */
export function listGames(lang: string, labels: GameStatusLabels): GameEntry[] {
  return GAMES.map((game) => {
    const guides = countGuides(game.slug);
    return {
      slug: game.slug,
      name: game.name,
      cover: game.cover,
      href: guides > 0 ? `/${lang}/docs/${game.slug}` : null,
      status:
        guides === 0
          ? labels.comingSoon
          : guides === 1
            ? labels.guideCountOne
            : labels.guideCount.replace("{count}", String(guides)),
    };
  });
}
