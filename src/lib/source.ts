import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";
import type { Node } from "fumadocs-core/page-tree";
import { DEFAULT_GAME, GAMES } from "@/lib/games";
import { i18n } from "@/lib/i18n";
import { localizePageTree } from "@/lib/tree-localization";
import { resolveIcon } from "@/components/icon";

/**
 * Folders in content/docs/<locale>/ that every game shares: written once,
 * shown inside each game (/docs/lol/contributing, /docs/deadlock/contributing)
 * so readers keep their game's sidebar. A game lists the folder in its
 * meta.json `pages` like one of its own categories. In the sidebar they sit
 * below the Add a guide button (src/app/[lang]/docs/layout.tsx).
 */
export const SHARED_SECTIONS = ["contributing"];

const isGame = (slug: string | undefined) =>
  GAMES.some((game) => game.slug === slug);

/**
 * Copies each shared section into every game the locale has (a game counts
 * once its segment has a meta.json in that locale) and drops the original,
 * which isn't a page of its own. The copies share one compiled file.
 */
function mountSharedSections<
  T extends { files: { type: string; path: string }[] },
>(input: T): T {
  const gamesByLocale = new Map<string, string[]>();
  for (const file of input.files) {
    const [locale, segment, name] = file.path.split("/");
    if (file.type === "meta" && name === "meta.json" && isGame(segment)) {
      gamesByLocale.set(locale, [
        ...(gamesByLocale.get(locale) ?? []),
        segment,
      ]);
    }
  }
  const files = input.files.flatMap((file) => {
    const [locale, section, ...rest] = file.path.split("/");
    if (!SHARED_SECTIONS.includes(section) || rest.length === 0) return [file];
    return (gamesByLocale.get(locale) ?? []).map((game) => ({
      ...file,
      path: [locale, game, section, ...rest].join("/"),
    }));
  });
  return { ...input, files };
}

/**
 * A page's file under content/docs ("en/contributing/index.mdx"). The same
 * as page.path, except for shared-section copies, which sit under a game.
 */
export function contentPath(path: string): string {
  const [locale, game, section, ...rest] = path.split("/");
  return isGame(game) && SHARED_SECTIONS.includes(section) && rest.length > 0
    ? [locale, section, ...rest].join("/")
    : path;
}

/**
 * Slugs of the URL search engines should index for a page. Shared sections
 * read the same in every game, so their copies point at the default game's.
 */
export function canonicalSlugs(slugs: string[]): string[] {
  return isGame(slugs[0]) &&
    slugs[0] !== DEFAULT_GAME &&
    SHARED_SECTIONS.includes(slugs[1])
    ? [DEFAULT_GAME, ...slugs.slice(1)]
    : slugs;
}

/** True for a shared-section copy that isn't the indexed one. */
export function isDuplicateCopy(slugs: string[]): boolean {
  return canonicalSlugs(slugs) !== slugs;
}

/**
 * Content links a shared section game-agnostically ("/docs/contributing/x").
 * On a game's page, point them at that game's copy so the reader keeps the
 * sidebar; anywhere else the edge redirect sends them to the default game.
 */
export function sharedSectionHref(
  href: string | undefined,
  game: string | undefined,
): string | undefined {
  const match = href?.match(/^\/docs\/([^/#?]+)(.*)$/);
  return match && isGame(game) && SHARED_SECTIONS.includes(match[1])
    ? `/docs/${game}/${match[1]}${match[2]}`
    : href;
}

export const source = loader({
  baseUrl: "/docs",
  source: mountSharedSections(docs.toFumadocsSource()),
  // Sidebar icons by name (meta.json `icon`). Brand logos (Maya, Blender,
  // LeagueOfLegends) plus any Lucide icon — see src/components/icon.tsx.
  icon: (name) => resolveIcon(name) ?? undefined,
  i18n,
});

export function getPageImage(page: InferPageType<typeof source>) {
  return {
    segments: page.slugs,
    url: `/api/og/docs/${page.locale}/${page.slugs.join("/")}`,
  };
}

function getEnglishPages() {
  return source.getPages().filter((page) => page.locale === "en");
}

export function getLLMIndex(baseUrl: string) {
  const tree = localizePageTree(source.pageTree["en"], "en");
  const lines: string[] = [];

  function walk(nodes: Node[], depth: number) {
    let inSeparator = false;

    for (const node of nodes) {
      if (node.type === "separator") {
        if (node.name) {
          const indent = "  ".repeat(depth);
          lines.push(`${indent}- ${node.name}`);
          inSeparator = true;
        }
        continue;
      }

      const d = inSeparator ? depth + 1 : depth;
      const indent = "  ".repeat(d);

      if (node.type === "page") {
        const desc = node.description ? `: ${node.description}` : "";
        lines.push(`${indent}- [${node.name}](${baseUrl}${node.url})${desc}`);
      } else if (node.type === "folder") {
        if (node.index) {
          const desc = node.index.description
            ? `: ${node.index.description}`
            : "";
          lines.push(
            `${indent}- [${node.name}](${baseUrl}${node.index.url})${desc}`,
          );
        } else {
          lines.push(`${indent}- ${node.name}`);
        }
        walk(node.children, d + 1);
      }
    }
  }

  walk(tree.children, 0);
  return lines;
}

export async function getLLMFullText(baseUrl: string) {
  const pages = getEnglishPages()
    .filter((page) => !isDuplicateCopy(page.slugs))
    .map(async (page) => {
      const processed = await page.data.getText("processed");
      return `--- ${page.data.title}\nSource: ${baseUrl}${page.url}\n${processed}`;
    });
  return Promise.all(pages);
}
