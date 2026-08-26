import { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/me",
        "/me/",
        "/login",
        "/signup",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
