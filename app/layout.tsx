import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: "HumanChain",
  title: "HumanChain",
  description:
    "Ask real humans, join daily chains, read monthly stories, and get the world's verdict.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/humanchain-logo.svg",
    apple: "/images/humanchain-logo.svg",
  },
  openGraph: {
    title: "HumanChain",
    description:
      "A verified human knowledge and story network for World App.",
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
