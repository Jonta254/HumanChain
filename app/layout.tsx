import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./modernize.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getAppUrl } from "@/lib/worldConfig";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  applicationName: "HumanChain",
  title: "HumanChain",
  description:
    "Ask real humans, post moments, trade nearby, and read stories — verified by World ID.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/world-assets/humanchain-profile-icon-1024.png",
    apple: "/world-assets/humanchain-profile-icon-1024.png",
  },
  openGraph: {
    title: "HumanChain",
    description:
      "A verified human network for wisdom, stories, marketplace listings, and nearby commerce inside World App.",
    images: [
      {
        url: "/world-assets/humanchain-meta-image-1200x600.png",
        width: 1200,
        height: 600,
        alt: "HumanChain — the verified-human network inside World App",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#137a57" },
    { media: "(prefers-color-scheme: dark)", color: "#137a57" },
  ],
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
