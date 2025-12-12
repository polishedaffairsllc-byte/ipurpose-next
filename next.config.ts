import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "./", // FORCE correct project root
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
