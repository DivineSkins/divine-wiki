"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  analyticsEnabled,
  newPageId,
  normalizePath,
  track,
} from "@/lib/analytics/client";
import type { AnalyticsEvent } from "@/lib/analytics/schema";

type SearchEvent = Extract<AnalyticsEvent, { event: "search" }>;

// Module state outlives the [lang] layout remount a language switch causes,
// so only the first pageview of a page load counts as a landing.
let landed = false;

// Caps one page's engaged time per flush, so a tab left open overnight
// doesn't skew the averages.
const MAX_ENGAGED_SECONDS = 1800;

/**
 * Cookieless page analytics: a pageview per route, engaged time and scroll
 * depth when the reader leaves, and clicks on external links and downloads.
 * Mounted once in the [lang] layout. See src/lib/analytics/server.ts for what
 * gets stored.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!analyticsEnabled()) return;
    const path = normalizePath(pathname);
    const pageId = newPageId();

    if (landed || isRevisit()) {
      track({ event: "pageview", path, pageId, entry: false });
    } else {
      const referrer = externalReferrer();
      track({
        event: "pageview",
        path,
        pageId,
        entry: referrer !== null,
        referrer: referrer || undefined,
        source: landingSource(),
      });
    }
    landed = true;

    let visibleSince: number | null =
      document.visibilityState === "visible" ? performance.now() : null;
    let activeMs = 0;
    let maxScroll = scrollDepth();
    let scrollQueued = false;

    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        maxScroll = Math.max(maxScroll, scrollDepth());
      });
    };
    // Runs when the tab is hidden, the page unloads, or the route changes.
    // Hidden then unload fires twice; the second call has nothing to send.
    const flush = () => {
      if (visibleSince !== null) {
        activeMs += performance.now() - visibleSince;
        visibleSince = null;
      }
      const seconds = Math.min(
        Math.round(activeMs / 1000),
        MAX_ENGAGED_SECONDS,
      );
      activeMs = 0;
      if (seconds > 0) {
        track({ event: "engage", path, pageId, seconds, scroll: maxScroll });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else visibleSince = performance.now();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [pathname]);

  useEffect(() => {
    if (!analyticsEnabled()) return;
    const onClick = (event: MouseEvent) => {
      // auxclick also fires for the right button; only middle-click opens
      // a link.
      if (event.type === "auxclick" && event.button !== 1) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href);
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      const path = normalizePath(window.location.pathname);
      // Host + path only: query strings can hold invite codes or tokens.
      if (url.host !== window.location.host) {
        track({
          event: "outbound",
          path,
          target: (url.host + url.pathname).slice(0, 300),
        });
      } else if (
        link.hasAttribute("download") ||
        url.pathname.startsWith("/wiki-files/")
      ) {
        track({ event: "download", path, target: url.pathname.slice(0, 300) });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);

  return null;
}

/** Records the current path as a 404. Render it from not-found pages. */
export function TrackNotFound() {
  const pathname = usePathname();
  useEffect(() => {
    track({ event: "notfound", path: normalizePath(pathname) });
  }, [pathname]);
  return null;
}

/**
 * Sends a search event once the reader stops typing. A query still pending
 * when the dialog closes (usually because a result was clicked) is sent
 * right away. `results` is null while the index loads or the box is empty.
 */
export function useTrackSearch(
  search: string,
  results: number | null,
  open: boolean,
) {
  const pathname = usePathname();
  const pending = useRef<SearchEvent | null>(null);
  const lastSent = useRef("");

  // Reads refs only, so it never needs to change.
  const send = useCallback(() => {
    const event = pending.current;
    pending.current = null;
    if (!event || event.query === lastSent.current) return;
    lastSent.current = event.query;
    track(event);
  }, []);

  useEffect(() => {
    const query = search
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 200);
    if (query.length < 2 || results === null) {
      pending.current = null;
      return;
    }
    pending.current = {
      event: "search",
      path: normalizePath(window.location.pathname),
      query,
      results,
    };
    const timer = setTimeout(send, 1500);
    return () => clearTimeout(timer);
  }, [search, results, send]);

  useEffect(() => {
    if (!open) send();
  }, [open, send]);

  // A new page starts with a clean slate, so the same query typed again
  // elsewhere counts again.
  useEffect(() => {
    lastSent.current = "";
  }, [pathname]);

  useEffect(() => send, [send]);
}

/**
 * Reloads and back/forward navigations keep the original document.referrer,
 * so treating them as landings would count the visit, and credit its
 * referrer, again.
 */
function isRevisit(): boolean {
  const [navigation] = performance.getEntriesByType("navigation") as
    PerformanceNavigationTiming[] | [];
  return navigation?.type === "reload" || navigation?.type === "back_forward";
}

/**
 * Hostname of the site the reader came from: "" when it's unknown (typed URL,
 * bookmark, or a referrer policy that hides it), null when it's the wiki
 * itself.
 */
function externalReferrer(): string | null {
  if (!document.referrer) return "";
  try {
    const url = new URL(document.referrer);
    return url.host === window.location.host ? null : url.hostname;
  } catch {
    return "";
  }
}

function landingSource(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  return (params.get("utm_source") ?? params.get("ref"))?.slice(0, 100);
}

function scrollDepth(): number {
  const height = document.documentElement.scrollHeight;
  if (height <= 0) return 0;
  return Math.min(
    100,
    Math.round(((window.scrollY + window.innerHeight) / height) * 100),
  );
}
