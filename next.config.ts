import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "./", // FORCE correct project root
  },
};

export default nextConfig;
