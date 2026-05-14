import { entities, type Entity } from "./entities";

export interface LinkSuggestion {
  entity: Entity;
  /** Character offset in the body where the bare title occurs. */
  index: number;
  /** The matched text (the entity title as it appears). */
  match: string;
}

/**
 * Scan body text for entity titles that appear as plain text (not already
 * inside a Markdown link). Returns suggestions; the caller decides whether to
 * apply them. Only the FIRST occurrence of each entity is suggested, to keep
 * the result quiet.
 */
export function scanForLinks(body: string): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  const seen = new Set<string>();

  for (const entity of entities) {
    if (seen.has(entity.slug)) continue;
    if (entity.title.length < 3) continue;

    const escaped = entity.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(body)) !== null) {
      if (isInsideLink(body, m.index)) continue;
      suggestions.push({ entity, index: m.index, match: m[0] });
      seen.add(entity.slug);
      break;
    }
  }

  return suggestions.sort((a, b) => a.index - b.index);
}

/** True if the offset sits inside an existing `[...](...)` Markdown link. */
function isInsideLink(body: string, index: number): boolean {
  const before = body.slice(Math.max(0, index - 200), index);
  const openBracket = before.lastIndexOf("[");
  const closeParen = before.lastIndexOf(")");
  return openBracket > closeParen;
}

/** Apply a single suggestion: wrap the matched text in a Markdown link. */
export function applySuggestion(
  body: string,
  suggestion: LinkSuggestion,
): string {
  const { index, match, entity } = suggestion;
  return (
    body.slice(0, index) +
    `[${match}](${entity.url})` +
    body.slice(index + match.length)
  );
}
