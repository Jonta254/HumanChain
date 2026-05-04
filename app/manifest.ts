import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HumanChain",
    short_name: "HumanChain",
    description:
      "A verified human knowledge and story network inside World App.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#246b55",
    icons: [
      {
        src: "/images/humanchain-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
