import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.divineskins.gg",
      },
      {
        protocol: "https",
        hostname: "skins.divineskins.gg",
      },
      {
        protocol: "https",
        hostname: "blog.divineskins.gg",
      },
    ],
  },
  // public/_headers only covers static asset responses on Workers, so the
  // security headers for Worker-generated responses (SSR pages, /api/*) live
  // here. Keep the two lists in sync.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // The static search index export (one route per locale). The client
        // always requests it with a `?v=<commit>` cache-buster, so each
        // deployed version can be cached forever — browsers re-download only
        // when a deploy changes the URL.
        source: "/api/search/:locale",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    // Constrain :lang to real locales. A bare ":lang" segment matches ANY
    // top-level path (including dotted files), so an unconstrained "/:lang"
    // redirect swallows /robots.txt, /sitemap.xml, /llms.txt, etc. and sends
    // them to dead URLs. Keep this list in sync with src/lib/i18n.ts.
    const locale = "en|fr-FR|tr-TR|pt-BR|pl-PL";
    return [
      {
        source: "/docs/:path*",
        destination: "/en/docs/:path*",
        permanent: false,
      },
      {
        source: "/docs",
        destination: "/en/docs",
        permanent: false,
      },
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
      {
        source: `/:lang(${locale})/contribute`,
        destination: "/:lang/docs/lol/contributing",
        permanent: true,
      },
      {
        source: "/contribute",
        destination: "/en/docs/lol/contributing",
        permanent: true,
      },
      // The contribute picker's "Manual on GitHub" card links to the
      // game-agnostic /:lang/docs/contributing, but the page lives under the
      // lol segment. public/_redirects handles this on Cloudflare; mirror it
      // here so it also works in local dev (otherwise the link 404s locally).
      {
        source: `/:lang(${locale})/docs/contributing`,
        destination: "/:lang/docs/lol/contributing",
        permanent: true,
      },
      {
        source: `/:lang(${locale})/docs/contributing/:path*`,
        destination: "/:lang/docs/lol/contributing/:path*",
        permanent: true,
      },
      // Bare /:lang/docs (no game segment) lands on the LoL guides index.
      {
        source: `/:lang(${locale})/docs`,
        destination: "/:lang/docs/lol",
        permanent: false,
      },
      // Root /:lang sends visitors straight into the LoL guides index. That
      // target page (slug ["lol"]) carries the branded social card, set in the
      // docs generateMetadata, so a shared site link still previews the banner
      // even though crawlers follow this redirect.
      {
        source: `/:lang(${locale})`,
        destination: "/:lang/docs/lol",
        permanent: false,
      },
    ];
  },
  // experimental.viewTransition needs React 19 Canary. Stable React 19.2 ships
  // without the <ViewTransition> component, so we can't use it yet. Re-enable
  // when upgrading to a Canary/experimental React build.
  cacheComponents: false,
};

export default withMDX(config);
