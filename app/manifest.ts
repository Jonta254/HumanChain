import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HumanChain",
    short_name: "HumanChain",
    description:
      "A verified human network for questions, stories, marketplace listings, and nearby commerce inside World App.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
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
