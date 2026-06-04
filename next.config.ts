import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    cpus: 1,
    workerThreads: true,
  },
  images: {
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "media-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com",
          "object-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https://developer.world.org https://developer.worldcoin.org https://usernames.worldcoin.org https://*.world.org https://*.worldcoin.org https://cdn.jsdelivr.net",
          "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com https://*.worldcoin.org https://*.world.org https://worldcoin.org",
          "frame-ancestors 'self' https://*.world.org https://*.worldcoin.org",
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
