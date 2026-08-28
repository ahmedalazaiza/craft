import { MetadataRoute } from "next";
import { fetchProjects, fetchCreators } from "@/lib/supabase/queries";
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
  ];

  // Curated category corridors for topical authority
  const categories = [
    "Brand",
    "UI",
    "Editorial",
    "Type",
    "Architecture",
    "3D & Motion",
    "Photo",
    "Product",
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(`/explore?category=${encodeURIComponent(cat)}`),
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  try {
    const [dbProjects, dbCreators] = await Promise.all([
      fetchProjects({ publishedOnly: true }),
      fetchCreators(),
    ]);

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
    return [...staticRoutes, ...categoryRoutes];
  }
}
