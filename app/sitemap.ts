import { MetadataRoute } from "next";
import { mockProjects, mockUsers } from "@/lib/mock";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static public routes
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
      priority: 0.9,
    },
    {
      url: absoluteUrl("/creators"),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Published project pages only
  const projectRoutes: MetadataRoute.Sitemap = mockProjects
    .filter((p) => p.published)
    .map((project) => ({
      url: absoluteUrl(`/project/${project.slug}`),
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  // Creator profile pages
  const creatorRoutes: MetadataRoute.Sitemap = mockUsers.map((creator) => ({
    url: absoluteUrl(`/u/${creator.username}`),
    lastModified: currentDate,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...creatorRoutes];
}
