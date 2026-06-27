import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "Josiah - Raw Signal",
  title: {
    default: "Josiah - Raw Signal",
    template: "%s | Raw Signal",
  },
  description:
    "A cinematic digital portfolio for Josiah: electrician, developer, designer, and builder of systems connecting circuits, code, and people.",
  keywords: [
    "Josiah",
    "Raw Signal",
    "electrician",
    "developer",
    "designer",
    "portfolio",
    "web apps",
    "design systems",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "Josiah - Raw Signal",
    description:
      "I wire things - circuits, code, and connections. Explore Josiah's Raw Signal portfolio, work, writing, and systems thinking.",
    images: ["/world-assets/verdex/verdex-showcase-1-markets-1080x1080.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Josiah - Raw Signal",
    description:
      "A digital operating system for circuits, code, design craft, nature, and human connection.",
    images: ["/world-assets/verdex/verdex-showcase-1-markets-1080x1080.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050608",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
