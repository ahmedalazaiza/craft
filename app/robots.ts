import { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

const privateDisallow = [
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
  "/favorites",
  "/favorites/",
  "/search",
  "/search/",
  "/boards$",
  "/boards/$",
];

const publicAllow = [
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
  "/boards/",
  "/default-avatar.svg",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: publicAllow,
        disallow: privateDisallow,
      },
      {
        userAgent: "Googlebot",
        allow: publicAllow,
        disallow: privateDisallow,
      },
      {
        userAgent: "Bingbot",
        allow: publicAllow,
        disallow: privateDisallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
