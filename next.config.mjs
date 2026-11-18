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
        // Pages and their RSC payloads (same path plus ?_rsc=). Skips
        // /_next/*, /api/* and any path with a dot (robots.txt, sitemap.xml,
        // llms.txt, images), which keep their own caching.
        //
        // Prerendered pages otherwise ship "s-maxage=31536000,
        // stale-while-revalidate=2592000" from the OpenNext cache
        // interceptor. Browsers ignore s-maxage but honour the SWR window, so
        // for 30 days a repeat visit can be answered from the browser cache
        // with HTML or RSC from an older deploy. That payload pulls the old
        // deploy's JS chunks into a page running the new ones. Turbopack
        // module ids stay the same across builds while export names are
        // mangled per build, so the old code calls exports that no longer
        // exist ("(0, f.f) is not a function") and the page crashes before
        // Next's build-id check can force a full reload.
        //
        // no-cache keeps responses storable (back/forward cache still works)
        // but makes the browser revalidate every time. OpenNext applies these
        // headers after the cache interceptor's, so this value wins.
        source: "/:path((?!_next/|api/)[^.]*)",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
      {
        // The search index routes (one per locale and game). Production
        // serves them as static files under /search/<hash>/ (public/_headers);
        // the route only changes with a deploy, so it can be cached forever.
        source: "/api/search/:locale/:game",
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
    const locale = "en|fr-FR|tr-TR|pt-BR|pl-PL|vi-VN";
    return [
      // Every image in public/wiki-images was converted to .webp (2026-07),
      // but Google Images and old external links still request the original
      // .png/.jpg/.gif URLs. Send them to the .webp with the same name. This
      // lives here, not in public/_redirects, because _redirects placeholders
      // match whole path segments and can't swap a file extension. Missing
      // assets fall through to the Worker, so this runs on Cloudflare too.
      {
        source: "/wiki-images/:path*/:name.:ext(png|jpe?g|gif)",
        destination: "/wiki-images/:path*/:name.webp",
        permanent: true,
      },
      {
        source: `/:lang(${locale})/docs/lol/tools/how-to-make-your-thumbnail-in-flint`,
        destination:
          "/:lang/docs/lol/assets-library/how-to-make-your-thumbnail-in-flint",
        permanent: true,
      },
      {
        source: "/docs/:path*",
        destination: "/en/docs/:path*",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "/en/docs",
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
      // The contributing guides are shared by every game and only have
      // per-game URLs (/:lang/docs/<game>/contributing, see SHARED_SECTIONS
      // in src/lib/source.ts). Game-agnostic links land on the default
      // game's copy. public/_redirects handles this on Cloudflare; mirrored
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
      // Root /:lang is the homepage (game picker), so it isn't redirected.
      {
        source: `/:lang(${locale})/docs`,
        destination: "/:lang/docs/lol",
        permanent: false,
      },
    ];
  },
  // The bare domain is the English homepage. A rewrite, not a redirect: the
  // URL stays `/`. Don't add an `/en -> /` redirect: `/` used to 301 to `/en`,
  // browsers cache 301s, and the pair would loop for anyone who visited
  // before. /en renders the same page with its canonical pointing at `/`.
  // proxy.ts skips `/` so the i18n middleware doesn't redirect it first.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/en" }],
    };
  },
  // experimental.viewTransition needs React 19 Canary. Stable React 19.2 ships
  // without the <ViewTransition> component, so we can't use it yet. Re-enable
  // when upgrading to a Canary/experimental React build.
  cacheComponents: false,
  experimental: {
    // Next 16 keeps a Turbopack cache in .next/cache between builds, and
    // Cloudflare Workers Builds restores that folder before every build.
    // Turbopack then served a stale src/app/global.css: prod got the old
    // hand-written rules (the sidebar "Add a guide" button as a grey row)
    // while Tailwind's classes, scanned from disk, were current. Reproduced
    // locally by building the old commit, then the new one on its cache.
    // Production builds compile from source every time; dev keeps its cache.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default withMDX(config);
