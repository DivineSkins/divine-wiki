import type { Metadata } from "next";

// Shared SEO metadata fragments. Centralized here because Next merges
// metadata across route segments SHALLOWLY: a page that sets `openGraph`,
// `twitter`, or `alternates` replaces the parent layout's value for that key
// rather than deep-merging it. So every leaf that overrides one of these has
// to re-supply the shared bits (site name, llms alternates) or they vanish
// from that page. Spreading these constants keeps them consistent.

export const SITE_NAME = "Divine Skins Wiki";

// Default social card. We reuse the dynamic OG route (the docs index card)
// instead of a static og.png: it's already branded and prod-hardened, always
// resolves (the en index page exists), and there's no binary asset to keep in
// sync. Per-page docs cards override `images` with their own slug.
export const DEFAULT_OG_IMAGE = "/api/og/docs/en";

// Static social card for the site's landing target ONLY. The root redirects
// /:lang -> /:lang/docs/lol, so the LoL guides index (slug ["lol"]) is the page
// a shared site link resolves to. The docs generateMetadata gives that one page
// this card; every other route keeps the dynamic per-page card above. Branded
// hero art exported as WebP to keep the asset tiny (~65 KB). Native 16:9
// (1200x675): platforms that want 1.91:1 (Twitter, Facebook) trim a thin sliver
// top/bottom; Discord shows it whole. Lives in public/og/home.webp;
// metadataBase makes the relative path absolute for crawlers.
export const LANDING_OG_IMAGE = "/og/home.webp";
export const LANDING_OG_WIDTH = 1200;
export const LANDING_OG_HEIGHT = 675;

export const baseOpenGraph: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  siteName: SITE_NAME,
  images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
};

export const baseTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  images: [DEFAULT_OG_IMAGE],
};

// Advertised on every page so the plain-text LLM views stay discoverable even
// on routes that set their own `alternates`.
export const llmAlternateTypes: NonNullable<Metadata["alternates"]>["types"] = {
  "text/plain": [
    { url: "/llms.txt", title: "LLM-friendly site index" },
    { url: "/llms-full.txt", title: "LLM-friendly full documentation" },
  ],
};
