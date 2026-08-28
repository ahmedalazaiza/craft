import { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/explore",
          "/creators",
          "/about",
          "/team",
          "/terms",
          "/privacy",
          "/guidelines",
          "/project/",
          "/u/",
          "/default-avatar.svg",
        ],
        disallow: [
          "/me",
          "/me/",
          "/settings",
          "/settings/",
          "/onboarding",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/me",
          "/me/",
          "/settings",
          "/settings/",
          "/onboarding",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/me",
          "/me/",
          "/settings",
          "/settings/",
          "/onboarding",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
