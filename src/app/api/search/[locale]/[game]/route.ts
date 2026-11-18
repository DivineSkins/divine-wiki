import { source } from "@/lib/source";
import {
  initAdvancedSearch,
  type AdvancedIndex,
  type SearchServer,
} from "fumadocs-core/search/server";
import { searchPath } from "fumadocs-core/breadcrumb";
import { i18n } from "@/lib/i18n";
import { SEARCH_GAMES, searchLanguage } from "@/lib/search";
import { createPlaceholderTranslator } from "@/lib/tree-localization";
import { withSearchKeywords } from "@/lib/search-keywords";
import type { StructuredData } from "fumadocs-core/mdx-plugins/remark-structure";

type Page = ReturnType<typeof source.getPages>[number];

// Prerender one index per locale and game (see src/lib/search.ts).
// scripts/export-search.mjs publishes these responses as versioned static
// files after next build. Production clients download those files directly;
// this route serves dev.
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.flatMap((locale) =>
    SEARCH_GAMES.map((game) => ({ locale, game })),
  );
}

const translators = new Map<string, (text: string) => string>();
function translatorFor(locale: string) {
  let translator = translators.get(locale);
  if (!translator) {
    translator = createPlaceholderTranslator(locale);
    translators.set(locale, translator);
  }
  return translator;
}

/**
 * Same walk as fumadocs' internal breadcrumb builder — tree root name, then
 * every named folder down to (excluding) the page — but each crumb runs
 * through the placeholder translator. Without this, meta.json titles like
 * `{meta.lol.title}` (resolved at render time for the sidebar by
 * localizePageTree) leak into search results as literal placeholders.
 *
 * A locale's tree lists only the games translated into it (its root
 * meta.json), so English-only guides fall back to the English tree.
 */
function localizedBreadcrumbs(locale: string, url: string): string[] {
  const translate = translatorFor(locale);
  let tree = source.getPageTree(locale);
  let path = searchPath(tree.children, url);
  if (!path && locale !== i18n.defaultLanguage) {
    tree = source.getPageTree(i18n.defaultLanguage);
    path = searchPath(
      tree.children,
      url.replace(`/${locale}/`, `/${i18n.defaultLanguage}/`),
    );
  }
  if (!path) return [];

  const crumbs: string[] = [];
  if (typeof tree.name === "string" && tree.name.length > 0) {
    crumbs.push(translate(tree.name));
  }
  // Last node is the page itself — breadcrumbs cover only its ancestors.
  for (const node of path.slice(0, -1)) {
    if (typeof node.name === "string" && node.name.length > 0) {
      crumbs.push(translate(node.name));
    }
  }
  return crumbs;
}

// Mirrors fumadocs' default buildIndex, plus guide keywords and localized
// breadcrumbs (the default derives them from the raw page tree, placeholders
// unresolved).
async function buildIndex(page: Page): Promise<AdvancedIndex> {
  const data = page.data as {
    title?: string;
    description?: string;
    keywords?: string[];
    tags?: string[];
    structuredData?: unknown;
    load?: () => Promise<{ structuredData: unknown }>;
  };
  let structuredData =
    typeof data.structuredData === "function"
      ? await data.structuredData()
      : data.structuredData;
  if (!structuredData && typeof data.load === "function") {
    structuredData = (await data.load()).structuredData;
  }

  return {
    title: data.title ?? page.url,
    description: data.description,
    url: page.url,
    id: page.url,
    structuredData: withSearchKeywords(
      structuredData as StructuredData,
      data.keywords,
      data.tags,
    ),
    breadcrumbs: localizedBreadcrumbs(page.locale ?? "en", page.url),
  };
}

const servers = new Map<string, SearchServer>();
function serverFor(locale: string, game: string): SearchServer {
  const key = `${locale}/${game}`;
  let server = servers.get(key);
  if (!server) {
    server = initAdvancedSearch({
      language: searchLanguage(locale, game),
      indexes: () =>
        Promise.all(
          source
            .getPages(locale)
            .filter((page) => page.slugs[0] === game)
            .map(buildIndex),
        ),
    });
    servers.set(key, server);
  }
  return server;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; game: string }> },
) {
  const { locale, game } = await params;
  if (
    !(i18n.languages as readonly string[]).includes(locale) ||
    !SEARCH_GAMES.includes(game)
  ) {
    return Response.json({ error: "unknown index" }, { status: 404 });
  }
  return Response.json(await serverFor(locale, game).export());
}
