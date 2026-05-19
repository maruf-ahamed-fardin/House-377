import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MessMate - Mess & Hostel Management",
    short_name: "MessMate",
    description: "Modern student mess and hostel management for admins and members.",
    lang: "en",
    dir: "ltr",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#f8f4e8",
    theme_color: "#f59e0b",
    categories: ["productivity", "finance", "utilities"],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open the current mess summary.",
        url: "/dashboard",
        icons: [{ src: "/icons/messmate-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Mess Chat",
        short_name: "Chat",
        description: "Open group chat.",
        url: "/chat",
        icons: [{ src: "/icons/messmate-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Bazar Schedule",
        short_name: "Bazar",
        description: "Open bazar duty schedule.",
        url: "/bazar-schedule",
        icons: [{ src: "/icons/messmate-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      {
        src: "/icons/messmate-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/messmate-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/messmate-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
