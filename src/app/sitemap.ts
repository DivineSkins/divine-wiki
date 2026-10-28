import { baseUrl } from "@/lib/config";
import { source } from "@/lib/source";
import { homePath, i18n } from "@/lib/i18n";
import pageDates from "@/lib/page-dates.json";
import type { MetadataRoute } from "next";

// Last-commit date per content file, keyed like page.path
// ("en/lol/tools/index.mdx"), written by scripts/prebuild.mjs. Empty when the
// build has no full git history; lastmod is then left out, which Google
// handles better than a date that is always "now".
const dates: Record<string, string> = pageDates;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  for (const lang of i18n.languages) {
    sitemap.push({
      url: `${baseUrl}${homePath(lang)}`,
      changeFrequency: "daily",
      priority: lang === i18n.defaultLanguage ? 1.0 : 0.9,
    });
  }

  const pages = source.getPages();
  for (const page of pages) {
    // The docs root (/:lang/docs) redirects to the LoL index, so it's not a
    // page Google should index.
    if (!page.url || page.slugs.length === 0) continue;
    const lastModified = dates[page.path];
    sitemap.push({
      url: `${baseUrl}${page.url}`,
      ...(lastModified && { lastModified }),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return sitemap;
}
