import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@medusajs/ui"],
  turbopack: {},
  webpack: (config) => {
    config.externals.push({
      "node-fetch": "commonjs node-fetch",
    });
    return config;
  },
};

export default nextConfig;
