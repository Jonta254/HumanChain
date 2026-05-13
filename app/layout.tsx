import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "HumanChain",
  title: "HumanChain",
  description:
    "Ask real humans, join daily chains, read stories, and trade in a verified nearby marketplace.",
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
  viewportFit: "cover",
  themeColor: "#fbf7ef",
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
      </body>
    </html>
  );
}
