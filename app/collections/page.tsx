import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCollections, fetchPlatformSettings } from "@/lib/supabase/queries";
import { CollectionsClient } from "./collections-client";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Curated Collections",
  description: "Explore thematic collections, design systems, and visual movements curated by the Layerat editorial board.",
  openGraph: {
    title: `Curated Collections · ${SITE_NAME}`,
    description: "Explore thematic collections, design systems, and visual movements curated by the Layerat editorial board.",
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CollectionsPage() {
  const settings = await fetchPlatformSettings();

  if (!settings.enableCollections) {
    notFound();
  }

  const collections = await fetchCollections();

  return <CollectionsClient initialCollections={collections} />;
}
