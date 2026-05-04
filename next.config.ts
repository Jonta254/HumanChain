import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /ox[\\/]_esm[\\/]tempo[\\/]internal[\\/]virtualMasterPool/,
      },
    ];

    return config;
  },
};

export default nextConfig;
