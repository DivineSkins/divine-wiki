export const MAX_BODY_BYTES = 4096;

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** Compare complete origins, including the scheme. Never trust the Host header. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    const parsed = new URL(origin);
    return (
      parsed.origin === new URL(request.url).origin && origin === parsed.origin
    );
  } catch {
    return false;
  }
}

/** Stop reading at the byte limit, even without an accurate Content-Length. */
export async function readEventBody(request: Request): Promise<string | null> {
  const length = request.headers.get("content-length");
  if (
    length !== null &&
    (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)
  ) {
    return null;
  }
  if (!request.body) return null;

  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  let complete = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        complete = true;
        return body + decoder.decode();
      }
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) return null;
      body += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  } finally {
    // Cancellation can wait on the sender. Do not hold the response open for it.
    if (!complete) void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** The configured per-minute cap is mandatory when recording production events. */
export async function withinRateLimit(
  limiter: RateLimiter | undefined,
  ip: string | null,
  development = false,
): Promise<boolean> {
  if (!limiter || !ip) return development;
  try {
    return (await limiter.limit({ key: ip })).success;
  } catch {
    console.error("[analytics] rate limiter unavailable");
    return false;
  }
}
