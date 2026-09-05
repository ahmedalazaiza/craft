import React from "react";
import type { Metadata } from "next";
import { FavoritesClient } from "./favorites-client";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchProjects } from "@/lib/supabase/queries";

export const revalidate = 0; // Dynamic for personal user bookmarks

export const metadata: Metadata = constructMetadata({
  title: "Favorites — Saved Projects & Case Studies",
  description:
    "View your appreciated design projects, UI/UX monographs, and creative inspiration on Craft.",
  path: "/favorites",
});

export default async function FavoritesPage() {
  const initialProjects = await fetchProjects({ publishedOnly: true });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Favorites", url: "/favorites" },
  ]);

  return (
    <>
      <script
        key="jsonld-favorites-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <FavoritesClient initialProjects={initialProjects || []} />
    </>
  );
}
