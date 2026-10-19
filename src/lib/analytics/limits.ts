import { dailyHash, type SaltStore } from "./visitor";

// Most events one IP may send per UTC day. A real reader sends a few dozen
// to a few hundred; anything near this is a script.
export const DAILY_EVENTS_PER_IP = 5000;

const CACHE_NAME = "analytics-daily-limit";

/**
 * Best-effort daily cap per IP, on top of the per-minute ANALYTICS_LIMITER.
 *
 * Counts live in the Workers Cache API: free, but local to each Cloudflare
 * location and evictable, so a counter can reset early and concurrent
 * requests can undercount. Both only make the cap more lenient. A KV counter
 * would be exact but costs a write per event (and KV allows one write per
 * second per key), more than recording the event itself.
 *
 * The cache key is a daily-salted hash of the IP, so no IP is stored. Fails
 * open: if anything here breaks, the event is recorded.
 */
export async function withinDailyLimit(
  store: SaltStore | undefined,
  ip: string | null,
  host: string,
  cacheStorage: CacheStorage | undefined = globalThis.caches,
): Promise<boolean> {
  // No KV or Cache API in `next dev`.
  if (!store || !ip || !cacheStorage) return true;
  try {
    const key = await dailyHash(store, `limit|${ip}`);
    // An unroutable path on our own host: it can't collide with real pages.
    const url = `https://${host}/__analytics-limit/${key}`;
    const cache = await cacheStorage.open(CACHE_NAME);
    const hit = await cache.match(url);
    const count = hit ? Number(await hit.text()) || 0 : 0;
    if (count >= DAILY_EVENTS_PER_IP) return false;
    await cache.put(
      url,
      new Response(String(count + 1), {
        headers: { "Cache-Control": `max-age=${secondsUntilUtcMidnight()}` },
      }),
    );
    return true;
  } catch (error) {
    console.error("[analytics] daily limit check failed", error);
    return true;
  }
}

function secondsUntilUtcMidnight(): number {
  const now = Date.now();
  const midnight = new Date(now).setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((midnight - now) / 1000));
}
