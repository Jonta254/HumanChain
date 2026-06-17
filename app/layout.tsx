import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://human-chain-gamma.vercel.app"),
  applicationName: "HumanChain",
  title: "HumanChain",
  description:
    "Ask real humans, post moments, trade nearby, and read stories — verified by World ID.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/humanchain-logo.png",
    apple: "/images/humanchain-logo.png",
  },
  openGraph: {
    title: "HumanChain",
    description:
      "A verified human network for wisdom, stories, marketplace listings, and nearby commerce inside World App.",
    images: ["/images/story-cover-door-color.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#137a57",
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
