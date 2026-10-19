import { baseUrl } from "@/lib/config";
import type { AnalyticsEvent } from "./schema";

// src/app/api/m/route.ts
const ENDPOINT = "/api/m";

// Set this localStorage key to "1" to send events from localhost or a preview
// URL. `next dev` has no Analytics Engine binding, so the server logs them.
const DEBUG_KEY = "divine-analytics-debug";

let enabled: boolean | undefined;

/**
 * Events are only sent from the production domain, so local dev and
 * workers.dev preview builds never pollute the numbers. Automated browsers
 * (navigator.webdriver) are skipped too.
 */
export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (enabled === undefined) {
    let debug = false;
    try {
      debug = localStorage.getItem(DEBUG_KEY) === "1";
    } catch {
      // Storage blocked; treat as off.
    }
    const production =
      process.env.NODE_ENV === "production" &&
      window.location.hostname === new URL(baseUrl).hostname;
    enabled = (production || debug) && !navigator.webdriver;
  }
  return enabled;
}

export function track(event: AnalyticsEvent): void {
  if (!analyticsEnabled()) return;
  const body = JSON.stringify(event);
  // sendBeacon survives the page unloading, which engagement events rely on.
  if (navigator.sendBeacon?.(ENDPOINT, body)) return;
  fetch(ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
}

/**
 * Pathname without a trailing slash (except the root), capped at the length
 * the server accepts.
 */
export function normalizePath(pathname: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path.slice(0, 300);
}

export function newPageId(): string {
  return Math.random().toString(36).slice(2, 12);
}
