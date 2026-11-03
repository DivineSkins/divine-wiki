import type { Metadata } from "next";
import { GAMES } from "@/lib/games";

// Shared SEO metadata fragments. Centralized here because Next merges
// metadata across route segments SHALLOWLY: a page that sets `openGraph`,
// `twitter`, or `alternates` replaces the parent layout's value for that key
// rather than deep-merging it. So every leaf that overrides one of these has
// to re-supply the shared bits (site name, llms alternates) or they vanish
// from that page. Spreading these constants keeps them consistent.

export const SITE_NAME = "Divine Skins Wiki";

// How each game reads in titles, keyed by its slug in GAMES. `short` is the
// name searchers type ("LoL"); `mentioned` spots a title that already names
// the game. A game missing here falls back to its full name.
const GAME_SEO: Record<string, { short: string; mentioned: RegExp }> = {
  lol: { short: "LoL", mentioned: /\b(lol|league)\b/i },
  deadlock: { short: "Deadlock", mentioned: /\bdeadlock\b/i },
};

/** "A and B", "A, B, and C". */
function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

// Site-wide copy names every game the wiki covers, built from GAMES so a new
// game shows up in the homepage title, meta description, and llms.txt
// without touching this file.
const GAME_NAMES = joinNames(GAMES.map((game) => game.name));

/** Homepage <title>: what the wiki is about first, brand last. */
export const HOME_TITLE = `${joinNames(
  GAMES.map((game) => GAME_SEO[game.slug]?.short ?? game.name),
)} Modding Guides | ${SITE_NAME}`;

/** Site-wide meta description (homepage, llms.txt). Keep it under ~160 chars. */
export const SITE_DESCRIPTION = `Guides for making ${GAME_NAMES} mods and custom skins: models, VFX, sounds, and tools. Written by the Divine Skins creator community.`;

// Search results show the <title> on its own, so a bare guide title like
// "Flint" or "Mod managers compared" doesn't say which game it's for. Docs
// pages append the game and the site name, skipping whichever the title
// already carries. Keyed by the first slug segment (the game segment).
export function docsTitle(title: string, game?: string): string {
  if (title.includes(SITE_NAME)) return title;
  const seo = game ? GAME_SEO[game] : undefined;
  const parts = [title];
  if (seo && !seo.mentioned.test(title)) parts.push(`${seo.short} Modding`);
  parts.push(SITE_NAME);
  return parts.join(" | ");
}

// Default social card. We reuse the dynamic OG route (the docs index card)
// instead of a static og.png: it's already branded and prod-hardened, always
// resolves (the en index page exists), and there's no binary asset to keep in
// sync. Per-page docs cards override `images` with their own slug.
export const DEFAULT_OG_IMAGE = "/api/og/docs/en";

// Static social card for the site's landing pages ONLY: the homepage
// (/:lang, set in src/app/[lang]/(home)/layout.tsx) and the LoL guides index
// (slug ["lol"], set in the docs generateMetadata), which was the landing
// page before the homepage existed and still gets shared as one. Every other
// route keeps the dynamic per-page card above. Branded
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
