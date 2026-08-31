import { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE, defaultDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#090C09",
    theme_color: "#121511",
    icons: [
      {
        src: "/logo-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
