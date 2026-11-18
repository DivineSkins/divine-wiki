import { liveUrl } from "@/lib/config";
import { rawSourceUrl } from "@/lib/draft/github";
import { componentSnippets } from "@/lib/draft/snippets";

/**
 * Longest prefilled chat link "Rewrite with AI" opens. No assistant
 * documents its limit; ChatGPT has been seen answering 431 past about 7,500
 * characters, so stay well under. Longer drafts go through the clipboard:
 * the link opens an empty chat and the writer pastes the whole message.
 */
export const MAX_PREFILL_URL = 6000;

interface RewriteDraft {
  /** Docs segment, e.g. "deadlock". */
  game: string;
  /** Display name, e.g. "Deadlock". */
  gameName: string;
  title: string;
  description: string;
  /** The MDX body, without frontmatter. */
  body: string;
}

/**
 * The message "Rewrite with AI" sends: the wiki's component docs and writing
 * rules by link, then the draft. English on purpose, whatever the editor's
 * language: guides are written in English (content/docs/en) and translated
 * later, so the rewrite has to come back in English too.
 */
export function buildRewritePrompt({
  game,
  gameName,
  title,
  description,
  body,
}: RewriteDraft): string {
  const components = `${liveUrl}/en/docs/${game}/contributing/components`;
  const contributing = `${liveUrl}/en/docs/${game}/contributing`;
  const names = componentSnippets.map((snippet) => snippet.label).join(", ");
  // A fence longer than any backtick run in the draft, so code blocks in it
  // can't close the wrapper early.
  const longestRun = Math.max(
    0,
    ...(body.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = "`".repeat(Math.max(3, longestRun + 1));

  return [
    `Rewrite my draft guide for the Divine Skins wiki (${gameName}). Use the wiki's MDX components wherever they fit.`,
    "",
    "Read these first:",
    `- Components, with when to use each one and its exact syntax: ${components}`,
    `  (MDX source, if the page won't open: ${rawSourceUrl("contributing/components")})`,
    `- Writing rules: ${contributing}`,
    "",
    `Components you can use: ${names}.`,
    "",
    "Rules:",
    "- Keep every fact, step, link, and image in my draft. Don't add facts or steps.",
    "- Use only components from the Components page, with the props it shows. Don't invent components or props.",
    '- Follow its "Which component to use" table and "Rules for every page".',
    '- Write so a 12-year-old can follow: short sentences, one action per step, every step starts with a verb, talk to the reader as "you".',
    "- No em dashes. Headings start at ##. Escape a < before a digit as \\<.",
    "- Never write: skin hack, skin changer, unlock skins, undetectable, exploit, cheat, buy, purchase.",
    "- Reply with the whole guide body in one code block fenced with four backticks (````mdx), without frontmatter. Then list what you changed in a few short bullets.",
    "",
    ...(title ? [`Title: ${title}`] : []),
    ...(description ? [`Description: ${description}`] : []),
    "My draft:",
    `${fence}mdx`,
    body.trim(),
    fence,
  ].join("\n");
}
