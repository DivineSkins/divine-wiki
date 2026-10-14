import { baseUrl } from "@/lib/config";
import { source } from "@/lib/source";
import { homePath, i18n } from "@/lib/i18n";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  for (const lang of i18n.languages) {
    sitemap.push({
      url: `${baseUrl}${homePath(lang)}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: lang === i18n.defaultLanguage ? 1.0 : 0.9,
    });
  }

  const pages = source.getPages();
  for (const page of pages) {
    if (!page.url) continue;
    sitemap.push({
      url: `${baseUrl}${page.url}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return sitemap;
}
