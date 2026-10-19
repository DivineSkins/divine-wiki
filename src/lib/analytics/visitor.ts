/*
 * Daily visitor ids without cookies, in the style of Plausible.
 *
 * id = HMAC(daily salt, IP + user agent), truncated to 64 bits. Each UTC day
 * gets a fresh random salt in KV that expires shortly after the day ends.
 * Once it's gone, nobody (including us) can recompute which IP + user agent
 * produced that day's ids, so stored ids can't be traced back to a person.
 * The same reader gets a new id every day: uniques are only meaningful per
 * day.
 */

// Minimal KV shape, declared locally for the same reason as EventDataset in
// ./server.ts: the workers-types globals don't exist on a fresh checkout.
export interface SaltStore {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expiration?: number },
  ): Promise<void>;
}

const DAY_SECONDS = 86_400;

// Isolates re-read the salt this often. If two isolates raced to create the
// same day's salt, KV keeps one and everyone converges on it within this
// window (plus KV's ~60 s propagation).
const REFRESH_MS = 10 * 60 * 1000;

// Keeps a salt readable for requests still in flight at midnight.
const EXPIRY_GRACE_SECONDS = 600;

let cached:
  { day: string; salt: string; key: CryptoKey; readAt: number } | undefined;

export function visitorId(
  store: SaltStore,
  ip: string,
  ua: string,
): Promise<string> {
  return dailyHash(store, `${ip}|${ua}`);
}

/**
 * HMAC of `message` with today's salt, truncated to 64 bits. Use it whenever
 * something has to be keyed by an IP: the result can't be reversed, and it
 * changes when the day does.
 */
export async function dailyHash(
  store: SaltStore,
  message: string,
): Promise<string> {
  const key = await dailyKey(store, utcDay(Date.now()));
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(signature, 0, 8), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

async function dailyKey(store: SaltStore, day: string): Promise<CryptoKey> {
  if (cached?.day === day && Date.now() - cached.readAt < REFRESH_MS) {
    return cached.key;
  }
  const salt = await ensureSalt(store, day);
  const key =
    cached?.salt === salt
      ? cached.key
      : await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(salt),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"],
        );
  cached = { day, salt, key, readAt: Date.now() };

  // Create tomorrow's salt hours ahead, so midnight has nothing to race.
  try {
    await ensureSalt(store, utcDay(Date.parse(day) + DAY_SECONDS * 1000));
  } catch (error) {
    console.error("[analytics] could not pre-create tomorrow's salt", error);
  }
  return key;
}

async function ensureSalt(store: SaltStore, day: string): Promise<string> {
  const name = `salt:${day}`;
  const existing = await store.get(name);
  if (existing) return existing;

  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const salt = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  const endOfDay = Date.parse(day) / 1000 + DAY_SECONDS;
  await store.put(name, salt, {
    expiration: endOfDay + EXPIRY_GRACE_SECONDS,
  });
  return salt;
}

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
