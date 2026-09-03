import { MetadataRoute } from "next";
import { fetchProjects, fetchCreators, fetchCategories } from "@/lib/supabase/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Core static public landing routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/explore"),
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/creators"),
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/team"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guidelines"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const [dbProjects, dbCreators, dbCategories] = await Promise.all([
      fetchProjects({ publishedOnly: true }),
      fetchCreators(),
      fetchCategories(),
    ]);

    // Dynamic category corridors for topical authority across all active categories
    const categoryRoutes: MetadataRoute.Sitemap = dbCategories.map((cat) => ({
      url: absoluteUrl(`/explore?category=${encodeURIComponent(cat.name)}`),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const projectRoutes: MetadataRoute.Sitemap = dbProjects.map((project) => ({
      url: absoluteUrl(`/project/${project.slug}`),
      lastModified: project.publishedAt || currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const creatorRoutes: MetadataRoute.Sitemap = dbCreators.map((creator) => ({
      url: absoluteUrl(`/u/${creator.username}`),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...projectRoutes, ...creatorRoutes];
  } catch (err) {
    console.error("Error generating dynamic sitemap:", err);
    return [...staticRoutes];
  }
}
