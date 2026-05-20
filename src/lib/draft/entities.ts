import rawIndex from "./entity-index.json";

export interface Entity {
  title: string;
  slug: string;
  category: string;
  url: string;
}

export const entities: Entity[] = rawIndex as Entity[];

/**
 * Abbreviations and alternate names that should resolve to a guide.
 * Maps an alias (lowercased) to a guide slug. Hand-maintained.
 */
export const aliasMap: Record<string, string> = {
  lmr: "league-mod-repather",
  cslol: "cs-lol-manager",
  "cslol-manager": "cs-lol-manager",
};

/**
 * Filter entities for an @-mention query. Matches against title and slug,
 * and resolves aliases. Returns at most `limit` results, best matches first.
 */
export function searchEntities(query: string, limit = 8): Entity[] {
  const q = query.toLowerCase().trim();
  if (!q) return entities.slice(0, limit);

  const aliasSlug = aliasMap[q];
  const scored: { entity: Entity; score: number }[] = [];

  for (const entity of entities) {
    const title = entity.title.toLowerCase();
    const slug = entity.slug.toLowerCase();
    let score = 0;
    if (aliasSlug && slug === aliasSlug) score = 100;
    else if (title === q || slug === q) score = 90;
    else if (title.startsWith(q) || slug.startsWith(q)) score = 70;
    else if (title.includes(q) || slug.includes(q)) score = 40;
    if (score > 0) scored.push({ entity, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entity);
}

/** The Markdown link an accepted @-mention inserts. */
export function entityLink(entity: Entity): string {
  return `[${entity.title}](${entity.url})`;
}
