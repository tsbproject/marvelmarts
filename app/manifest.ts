import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MarvelMarts – Nigeria's Trusted Online Marketplace",
    short_name: "MarvelMarts",

    description:
      "Shop quality products from trusted Nigerian merchants on MarvelMarts.",

    start_url: "/",
    display: "standalone",

    background_color: "#FBFBFB",
    theme_color: "#0B1F3A",

    orientation: "portrait",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}