import { z } from "zod";

// Wire format for the wiki's first-party analytics. The browser posts one of
// these per event (src/lib/analytics/client.ts) and the Worker validates it
// before writing a Workers Analytics Engine data point (./server.ts).
//
// Client code must only `import type` from this file so zod stays out of the
// browser bundle.

// A pathname without query or hash. Queries can carry tokens, so they never
// leave the browser. Control and formatting characters are rejected: the
// report prints paths in a terminal.
const path = z
  .string()
  .max(300)
  .regex(/^\/[^\s?#\p{Cc}\p{Cf}]*$/u);

// Random per-pageview id, regenerated on every navigation. It ties a page's
// engagement events to its pageview and identifies nothing beyond that.
const pageId = z.string().regex(/^[a-z0-9]{1,16}$/);

export const analyticsEventSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("pageview"),
    path,
    pageId,
    // First pageview of a visit: the page load came from outside the wiki.
    entry: z.boolean(),
    // Only sent with the first pageview of a page load. The referrer is a
    // hostname, never a full URL.
    referrer: z.string().max(300).optional(),
    source: z.string().max(100).optional(),
  }),
  z.object({
    event: z.literal("engage"),
    path,
    pageId,
    seconds: z.number().min(0).max(3600),
    scroll: z.number().min(0).max(100),
  }),
  z.object({
    event: z.literal("search"),
    path,
    query: z.string().min(1).max(200),
    results: z.number().int().min(0).max(10_000),
  }),
  // Targets are host + path (outbound) or path (download), no query.
  z.object({
    event: z.literal("outbound"),
    path,
    target: z.string().max(300),
  }),
  z.object({
    event: z.literal("download"),
    path,
    target: z.string().max(300),
  }),
  z.object({
    event: z.literal("notfound"),
    path,
  }),
]);

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
