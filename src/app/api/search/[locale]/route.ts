import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { searchPath } from "fumadocs-core/breadcrumb";
import { i18n } from "@/lib/i18n";
import { createPlaceholderTranslator } from "@/lib/tree-localization";

// Static search: instead of answering queries, each locale route exports that
// locale's pre-built search index once (~560 KB gzipped). The browser
// downloads it on first search and runs every query locally — zero Worker
// compute per keystroke. All four routes are prerendered at build time.
//
// The client (src/components/search-dialog.tsx) fetches with a `?v=<commit>`
// param so each deploy busts the browser cache; next.config.mjs marks the
// response immutable.
export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.map((locale) => ({ locale }));
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
 */
function localizedBreadcrumbs(locale: string, url: string): string[] {
  const translate = translatorFor(locale);
  const tree = source.getPageTree(locale);
  const path = searchPath(tree.children, url);
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

const server = createFromSource(source, {
  // Tokenize each locale's index in its own language so localized search
  // stems words correctly. Keys must match src/lib/i18n.ts languages; values
  // must be Orama language names (and mirrored in search-dialog.tsx).
  localeMap: {
    en: "english",
    "fr-FR": "french",
    "tr-TR": "turkish",
    "pt-BR": "portuguese",
    // Orama ships no Polish stemmer; english tokenization is the fallback
    // (exact-ish matching, no stemming of Polish inflections).
    "pl-PL": "english",
  },
  // Mirrors fumadocs' default buildIndex, plus localized breadcrumbs (the
  // default derives them from the raw page tree, placeholders unresolved).
  async buildIndex(page) {
    const data = page.data as {
      title?: string;
      description?: string;
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
      structuredData: structuredData as never,
      breadcrumbs: localizedBreadcrumbs(page.locale ?? "en", page.url),
    };
  },
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  // Same shape staticGET serves: { type: "i18n", data: { [locale]: db } }.
  const exported = (await server.export()) as {
    type: string;
    data: Record<string, unknown>;
  };
  const db = exported.data[locale];
  if (!db) {
    return Response.json({ error: "unknown locale" }, { status: 404 });
  }
  return Response.json(db);
}
