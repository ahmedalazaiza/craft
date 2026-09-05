import { MetadataRoute } from "next";
import { fetchProjects, fetchCreators } from "@/lib/supabase/queries";
import { absoluteUrl } from "@/lib/seo";

// Real release timestamp for platform core landing pages (avoids fake dynamic "now" spoofing)
const STATIC_LAST_MODIFIED = "2026-03-01T00:00:00.000Z";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Core static public landing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/explore"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/creators"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/team"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guidelines"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const [dbProjects, dbCreators] = await Promise.all([
      fetchProjects({ publishedOnly: true }),
      fetchCreators(),
    ]);

    const projectRoutes: MetadataRoute.Sitemap = (dbProjects || [])
      .filter((project) => Boolean(project.published && project.slug))
      .map((project) => {
        const rawDate = project.updatedAt || project.publishedAt;
        let lastModified: string | undefined;
        if (rawDate) {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            lastModified = parsed.toISOString();
          }
        }

        return {
          url: absoluteUrl(`/project/${project.slug}`),
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

    const creatorRoutes: MetadataRoute.Sitemap = (dbCreators || [])
      .filter((creator) => Boolean(!creator.isSuspended && creator.username))
      .map((creator) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawDate = (creator as any).updatedAt || (creator as any).createdAt;
        let lastModified: string | undefined;
        if (rawDate) {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) {
            lastModified = parsed.toISOString();
          }
        }

        return {
          url: absoluteUrl(`/u/${creator.username}`),
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: "weekly" as const,
          priority: 0.75,
        };
      });

    return [...staticRoutes, ...projectRoutes, ...creatorRoutes];
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
    return [...staticRoutes];
  }
}
