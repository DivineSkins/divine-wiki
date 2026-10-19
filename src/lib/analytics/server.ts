import { getCloudflareContext } from "@opennextjs/cloudflare";
import { i18n } from "@/lib/i18n";
import { analyticsEventSchema, type AnalyticsEvent } from "./schema";
import { withinDailyLimit } from "./limits";
import { visitorId, type SaltStore } from "./visitor";

/*
 * Cookieless first-party analytics, stored in Workers Analytics Engine
 * (dataset `wiki_events`, binding WIKI_ANALYTICS in wrangler.toml).
 *
 * Nothing is stored in the browser and the raw IP is never written. Unique
 * visitors are counted with a daily-salted hash; see ./visitor.ts.
 *
 * Data point layout. Analytics Engine columns are positional: keep this list,
 * the blobs array in toDataPoint(), and scripts/analytics-report.mjs in sync.
 *
 *   blob1  event        pageview | engage | search | outbound | download | notfound
 *   blob2  path         /en/docs/lol/maya/...
 *   blob3  locale       en, fr-FR, ... ("" when the path has none)
 *   blob4  game         lol, deadlock, ... ("" outside /docs/<game>)
 *   blob5  value        search query | link target
 *   blob6  referrer     referring host, www. stripped ("" for internal/direct)
 *   blob7  source       utm_source or ref from the landing URL
 *   blob8  country      ISO code from Cloudflare
 *   blob9  device       desktop | mobile | tablet
 *   blob10 browser      Chrome, Safari, Firefox, Edge, Opera, Samsung, Other
 *   blob11 os           Windows, macOS, iOS, Android, Linux, ChromeOS, Other
 *   blob12 visitor      daily visitor hash ("" if it couldn't be computed)
 *   blob13 pageId       random per-pageview id (pageview + engage only)
 *   double1             pageview: 1 if entry | search: result count | engage: seconds
 *   double2             engage: max scroll depth, percent
 *   index1              visitor hash (sampling key)
 */

// Minimal shapes of the bindings used here. Declared locally because the
// wrangler-generated cloudflare-env.d.ts is git-ignored: its
// AnalyticsEngineDataset / RateLimit types don't exist on the fresh checkout
// Workers Builds type-checks.
interface EventDataset {
  writeDataPoint(point: {
    indexes?: string[];
    blobs?: string[];
    doubles?: number[];
  }): void;
}

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface AnalyticsEnv {
  WIKI_ANALYTICS?: EventDataset;
  ANALYTICS_SALTS?: SaltStore;
  ANALYTICS_LIMITER?: RateLimiter;
}

const MAX_BODY_BYTES = 4096;

// Clients that run JS but aren't people: crawlers, link previewers, headless
// browsers, HTTP libraries.
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|python|curl|wget|node-fetch|axios|go-http|java\//i;

function getContext(): { env: AnalyticsEnv; country?: string } {
  try {
    const { env, cf } = getCloudflareContext();
    return {
      env: env as unknown as AnalyticsEnv,
      country: (cf as { country?: string } | undefined)?.country,
    };
  } catch {
    // No Cloudflare context in `next dev`.
    return { env: {} };
  }
}

/**
 * Validates one event posted by the browser and writes it to Analytics
 * Engine. Invalid, cross-origin, and bot requests are dropped silently: the
 * client never needs a reason, and the endpoint always answers 204.
 */
export async function recordEvent(request: Request): Promise<void> {
  const host = request.headers.get("host") ?? "";
  if (!isSameOrigin(request.headers, host)) return;

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_UA.test(ua)) return;

  const { env, country } = getContext();
  const ip = request.headers.get("cf-connecting-ip");
  if (!(await withinRateLimit(env.ANALYTICS_LIMITER, ip))) return;

  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) return;
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return;

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return;
  }
  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success) return;

  const ownHost = host.replace(/:\d+$/, "");
  if (!(await withinDailyLimit(env.ANALYTICS_SALTS, ip, ownHost))) return;

  let visitor = "";
  if (env.ANALYTICS_SALTS && ip) {
    try {
      visitor = await visitorId(env.ANALYTICS_SALTS, ip, ua);
    } catch (error) {
      // Still record the event; it just won't count toward uniques.
      console.error("[analytics] visitor id failed", error);
    }
  }
  const point = toDataPoint(parsed.data, {
    host: ownHost,
    country: request.headers.get("cf-ipcountry") ?? country ?? "",
    ua,
    visitor,
  });

  if (env.WIKI_ANALYTICS) {
    env.WIKI_ANALYTICS.writeDataPoint(point);
  } else if (process.env.NODE_ENV === "development") {
    console.log("[analytics]", JSON.stringify(point.blobs), point.doubles);
  }
}

/**
 * Caps events per IP per minute (limit and period live in wrangler.toml, per
 * Cloudflare location; the daily cap is in ./limits.ts). A reader sends a few events a minute, so this only stops one
 * source from flooding the numbers. Fails open if the limiter errors.
 */
async function withinRateLimit(
  limiter: RateLimiter | undefined,
  ip: string | null,
): Promise<boolean> {
  if (!limiter || !ip) return true;
  try {
    return (await limiter.limit({ key: ip })).success;
  } catch (error) {
    console.error("[analytics] rate limiter failed", error);
    return true;
  }
}

// Browsers send Origin on POST, including sendBeacon. Some privacy-hardened
// setups strip it; Sec-Fetch-Site still vouches for same-origin there.
function isSameOrigin(headers: Headers, host: string): boolean {
  const origin = headers.get("origin");
  if (!origin) return headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function toDataPoint(
  event: AnalyticsEvent,
  request: { host: string; country: string; ua: string; visitor: string },
) {
  const { locale, game } = describePath(event.path);
  let value = "";
  let referrer = "";
  let source = "";
  let pageId = "";
  let double1 = 0;
  let double2 = 0;

  switch (event.event) {
    case "pageview":
      pageId = event.pageId;
      referrer = referrerHost(event.referrer, request.host);
      source = clean(event.source ?? "")
        .toLowerCase()
        .slice(0, 50);
      double1 = event.entry ? 1 : 0;
      break;
    case "engage":
      pageId = event.pageId;
      double1 = Math.round(event.seconds);
      double2 = Math.round(event.scroll);
      break;
    case "search":
      value = clean(event.query).toLowerCase().slice(0, 100);
      double1 = event.results;
      break;
    case "outbound":
    case "download":
      value = clean(event.target)
        .replace(/^www\./, "")
        .slice(0, 200);
      break;
  }

  return {
    indexes: [request.visitor || "anon"],
    blobs: [
      event.event,
      event.path,
      locale,
      game,
      value,
      referrer,
      source,
      request.country,
      deviceType(request.ua),
      browserName(request.ua),
      osName(request.ua),
      request.visitor,
      pageId,
    ],
    doubles: [double1, double2],
  };
}

function describePath(path: string): { locale: string; game: string } {
  // The bare domain is the English homepage (rewritten to /en).
  if (path === "/") return { locale: i18n.defaultLanguage, game: "" };
  const [first, second, third] = path.split("/").slice(1);
  const locale = (i18n.languages as readonly string[]).includes(first)
    ? first
    : "";
  const game = locale && second === "docs" && third ? third : "";
  return { locale, game };
}

// The client sends the referrer's hostname only.
function referrerHost(referrer: string | undefined, ownHost: string): string {
  const host = clean(referrer ?? "")
    .toLowerCase()
    .replace(/^www\./, "");
  return host === ownHost ? "" : host.slice(0, 100);
}

// Anyone can post to the endpoint, and the report prints these values in a
// terminal: drop control and formatting characters (escape sequences, bidi
// overrides) and collapse whitespace.
function clean(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .trim();
}

function deviceType(ua: string): string {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobile";
  return "desktop";
}

// Order matters: Edge, Opera and Samsung all claim to be Chrome, and Chrome
// claims to be Safari.
function browserName(ua: string): string {
  if (/Edg(e|A|iOS)?\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser\//.test(ua)) return "Samsung";
  if (/Firefox\/|FxiOS\//.test(ua)) return "Firefox";
  if (/Chrome\/|CriOS\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function osName(ua: string): string {
  if (/Windows/.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}
