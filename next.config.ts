import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-a15fad1bb05e4ecbb92c9d83b643a721.r2.dev",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "clefastnest.emetstudio.com",
      },
    ],
  },
};

export default nextConfig;