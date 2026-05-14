import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { searchEntities, entityLink } from "./entities";

/**
 * CodeMirror autocomplete: typing `@query` opens a dropdown of matching
 * wiki guides. Accepting one replaces `@query` with a Markdown link.
 */
function mentionSource(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/@[\w-]*/);
  if (!match) return null;
  if (match.from === match.to && !context.explicit) return null;

  const query = match.text.slice(1); // drop the leading '@'
  const results = searchEntities(query);
  if (results.length === 0) return null;

  return {
    from: match.from,
    options: results.map((entity) => ({
      label: entity.title,
      detail: entity.url,
      apply: entityLink(entity),
    })),
  };
}

export const mentionExtension = autocompletion({
  override: [mentionSource],
});
