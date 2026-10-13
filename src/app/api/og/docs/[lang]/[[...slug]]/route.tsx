/* eslint-disable @next/next/no-img-element */
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ImageResponse } from "next/og";
import { source } from "@/lib/source";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { ogLanguageBlacklist } from "@/lib/i18n";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Card geometry. The Figma frame ("Wiki Embed Banner") is 1920x1000; the card
// renders it at 0.63 scale (1210x630) with 10px trimmed off the right edge of
// the wing panel, so every design measurement below is `figmaPx * 0.63`.
const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 69; // 110
const PAD_Y = 71; // 113 top / 112 bottom

const WHITE = "#ffffff";
const ACCENT = "#ab69ef";
const MUTED = "#8b8d98";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> },
) {
  const { lang, slug = [] } = await params;

  if (ogLanguageBlacklist.includes(lang)) {
    return notFound();
  }

  // Same English fallback as the docs page itself, so an untranslated page's
  // card resolves instead of 404ing (its metadata still points here).
  const page = source.getPage(slug, lang) ?? source.getPage(slug, "en");
  if (!page) return notFound();

  const origin = new URL(request.url).origin;
  const [background, logo, fonts] = await Promise.all([
    loadImageDataUri(origin, "/og/docs-card-bg.jpg", "image/jpeg"),
    loadImageDataUri(origin, "/og/docs-card-logo.png", "image/png"),
    loadFonts(origin),
  ]);

  const title = page.data.title;
  const description = page.data.description;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${PAD_Y}px ${PAD_X}px`,
        background: "#0b0a0f",
        position: "relative",
      }}
    >
      {/* Static art (liquid texture + wing panel), pre-flattened from Figma:
          satori can't do its blend modes, rotations or blurred glows. */}
      {background && (
        <img
          src={background}
          width={WIDTH}
          height={HEIGHT}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        {logo && <img src={logo} width={42} height={35} alt="" />}
        <div
          style={{
            display: "flex",
            fontFamily: "Mozilla Headline",
            fontWeight: 600,
            fontSize: 30,
            color: WHITE,
            textTransform: "uppercase",
          }}
        >
          Divine Skins&nbsp;<span style={{ color: ACCENT }}>Wiki</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 15,
          width: 541, // 858
        }}
      >
        <div
          style={{
            display: "block",
            fontFamily: "Mozilla Headline",
            fontWeight: 600,
            fontSize: titleFontSize(title),
            lineHeight: 1.2,
            color: WHITE,
            textTransform: "uppercase",
            lineClamp: 3,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: "block",
              fontFamily: "Instrument Sans",
              fontWeight: 400,
              fontSize: 25,
              lineHeight: 1.2,
              color: MUTED,
              lineClamp: 3,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      // satori only uses fonts handed to it; `undefined` (none loaded) falls
      // back to next/og's bundled default font rather than throwing.
      ...(fonts ? { fonts } : {}),
      // Worker responses aren't edge-cached by Cloudflare, but social crawlers
      // and browsers honor this, so repeat shares don't re-render the image.
      headers: {
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}

/**
 * The design sets titles at 63px (two lines in the 541px column). Step down
 * for longer titles so they stay within three lines; lineClamp is the backstop.
 */
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 28) return 63;
  if (len <= 45) return 54;
  if (len <= 64) return 46;
  return 40;
}

/**
 * Reads a file from public/ at runtime. On Cloudflare Workers, public/ is
 * served by the static-assets binding, not a filesystem, so readFile throws
 * there. Fetching our own URL fails too: the Worker's subrequest to its own
 * custom domain never reaches the assets. So read through the ASSETS binding,
 * and fall back to disk where there's no Cloudflare context (`next dev`,
 * `next start`). `publicPath` is the asset's URL path (e.g.
 * "/og/docs-card-logo.png").
 */
async function loadPublicAsset(
  origin: string,
  publicPath: string,
): Promise<ArrayBuffer | null> {
  const assets = getAssetsBinding();
  if (assets) {
    try {
      const res = await assets.fetch(new URL(publicPath, origin));
      if (res.ok) return await res.arrayBuffer();
    } catch {
      // Fall through to the filesystem read below.
    }
  }
  try {
    const buf = await readFile(
      join(process.cwd(), "public", ...publicPath.split("/").filter(Boolean)),
    );
    // Return the exact bytes as an ArrayBuffer (avoid handing satori a view
    // over Node's shared pooled buffer).
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;
  } catch {
    // The card still renders without it, so log instead of failing the image.
    console.warn(`[og] could not load ${publicPath}`);
    return null;
  }
}

function getAssetsBinding(): Fetcher | undefined {
  try {
    return getCloudflareContext().env.ASSETS;
  } catch {
    // No Cloudflare context outside the Worker runtime.
    return undefined;
  }
}

// Images must be PNG or JPEG, never WebP: the @vercel/og build that next/og
// bundles has no WebP dimension parser, so embedding one throws
// "u2 is not iterable" and aborts the whole image.
// Only successes are cached: a cached miss would serve bare cards for the rest
// of the isolate's life, and crawlers keep whatever card they fetched first.
const imageCache = new Map<string, string>();

async function loadImageDataUri(
  origin: string,
  publicPath: string,
  mime: "image/png" | "image/jpeg",
): Promise<string | null> {
  const cached = imageCache.get(publicPath);
  if (cached) return cached;
  const buf = await loadPublicAsset(origin, publicPath);
  if (!buf) return null;
  const uri = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
  imageCache.set(publicPath, uri);
  return uri;
}

const FONT_FILES = [
  { name: "Mozilla Headline", weight: 600, file: "MozillaHeadline-600.ttf" },
  { name: "Instrument Sans", weight: 400, file: "InstrumentSans-400.ttf" },
] as const;

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: (typeof FONT_FILES)[number]["weight"];
  style: "normal";
};

// Cached only once every font loaded, for the same reason as imageCache.
let cachedFonts: OgFont[] | undefined;

async function loadFonts(origin: string): Promise<OgFont[] | undefined> {
  if (cachedFonts) return cachedFonts;
  const loaded = await Promise.all(
    FONT_FILES.map(async ({ name, weight, file }): Promise<OgFont | null> => {
      const data = await loadPublicAsset(origin, `/fonts/${file}`);
      return data ? { name, data, weight, style: "normal" } : null;
    }),
  );
  const fonts = loaded.filter((font): font is OgFont => font !== null);
  if (fonts.length === FONT_FILES.length) cachedFonts = fonts;
  // An empty `fonts` array leaves satori with no typeface and throws, whereas
  // omitting the option lets next/og fall back to its bundled default font.
  return fonts.length > 0 ? fonts : undefined;
}

export function generateStaticParams() {
  return source.generateParams();
}
