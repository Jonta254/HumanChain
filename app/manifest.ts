import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HumanChain",
    short_name: "HumanChain",
    description:
      "Ask real humans, post moments, trade nearby, and read stories — verified by World ID.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8f6",
    theme_color: "#246b55",
    icons: [
      {
        src: "/images/humanchain-logo.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
