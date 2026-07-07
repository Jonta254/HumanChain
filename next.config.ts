import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@worldcoin/minikit-js"],
    workerThreads: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.worldcoin.org" },
      { protocol: "https", hostname: "*.world.org" },
    ],
  },
  reactStrictMode: true,
  turbopack: {},
  async headers() {
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(self), microphone=(self), geolocation=(self), payment=(self)",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'",
          "media-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com",
          "object-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://developer.world.org https://developer.worldcoin.org https://usernames.worldcoin.org https://*.world.org https://world.org https://*.worldcoin.org https://worldcoin.org https://cdn.jsdelivr.net https://cdn.world.org https://vitals.vercel-insights.com https://va.vercel-scripts.com",
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com https://*.worldcoin.org https://worldcoin.org https://*.world.org https://world.org",
          "frame-ancestors 'self' https://*.world.org https://world.org https://*.worldcoin.org https://worldcoin.org",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
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
