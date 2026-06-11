import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";
import { i18n } from "@/lib/i18n";

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

const server = createFromSource(source, {
  // Tokenize each locale's index in its own language so localized search
  // stems words correctly. Keys must match src/lib/i18n.ts languages; values
  // must be Orama language names (and mirrored in search-dialog.tsx).
  localeMap: {
    en: "english",
    "fr-FR": "french",
    "tr-TR": "turkish",
    "pt-BR": "portuguese",
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
