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
  async redirects() {
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
        source: "/:lang/contribute",
        destination: "/:lang/docs/lol/contributing",
        permanent: true,
      },
      {
        source: "/contribute",
        destination: "/en/docs/lol/contributing",
        permanent: true,
      },
    ];
  },
  // experimental.viewTransition needs React 19 Canary. Stable React 19.2 ships
  // without the <ViewTransition> component, so we can't use it yet. Re-enable
  // when upgrading to a Canary/experimental React build.
  cacheComponents: false,
};

export default withMDX(config);
