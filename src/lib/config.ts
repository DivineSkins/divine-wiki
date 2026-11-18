// NEXT_PUBLIC_* vars are inlined when `next build` runs, and that's also when
// the guide pages, sitemap and robots.txt are prerendered. wrangler.toml [vars]
// only exist at Worker runtime, too late for any of those, so production builds
// default to the live domain. Falling back to localhost there put
// localhost og:image URLs in every page and broke all social embeds.
export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://wiki.divineskins.gg"
    : "http://localhost:3000");

// The live wiki, for links that leave the browser (prompts handed to AI
// assistants): they must reach the real site even in dev, where baseUrl is
// localhost.
export const liveUrl = "https://wiki.divineskins.gg";

export const divineApiUrl =
  process.env.NEXT_PUBLIC_DIVINE_API_URL || "https://api.divineskins.gg";

export const discordInviteUrl = "https://discord.gg/divineskins";

export const githubRepoUrl = "https://github.com/DivineSkins/divine-wiki";

// $id of the sentinel separator node appended to the docs page tree. The
// sidebar's Separator renderer swaps it for the Contribute button so the
// trigger sits right under the nav tree (see src/components/sidebar-contribute.tsx).
export const contributeSidebarNodeId = "contribute-sidebar-button";
