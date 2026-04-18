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
    ];
  },
  experimental: {
    viewTransition: true,
  },
  cacheComponents: false,
};

export default withMDX(config);
