import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '11mb',
    },
  },
  reactCompiler: true,
};

export default nextConfig;
