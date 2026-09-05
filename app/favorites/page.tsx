import React from "react";
import type { Metadata } from "next";
import { FavoritesClient } from "./favorites-client";
import { constructMetadata } from "@/lib/seo";
import { fetchProjects } from "@/lib/supabase/queries";

export const revalidate = 0; // Dynamic for personal user bookmarks

export const metadata: Metadata = constructMetadata({
  title: "Favorites — Saved Projects & Case Studies",
  description:
    "View your saved design projects, UI/UX monographs, and creative inspiration on Layerat.",
  noIndex: true,
});

export default async function FavoritesPage() {
  const initialProjects = await fetchProjects({ publishedOnly: true });

  return <FavoritesClient initialProjects={initialProjects || []} />;
}
