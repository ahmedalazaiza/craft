import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCollectionBySlug, fetchPlatformSettings } from "@/lib/supabase/queries";
import { CollectionDetailClient } from "./collection-detail-client";
import { SITE_NAME } from "@/lib/seo";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // 60 seconds ISR

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const settings = await fetchPlatformSettings();
  if (!settings.enableCollections) {
    return { title: "Page Not Found" };
  }

  const { slug } = await params;
  const data = await fetchCollectionBySlug(slug);

  if (!data) {
    return {
      title: "Collection Not Found",
    };
  }

  const { collection } = data;

  return {
    title: `${collection.title} · Curated Collection`,
    description: collection.description || `Explore ${collection.title} on ${SITE_NAME}.`,
    openGraph: {
      title: `${collection.title} · ${SITE_NAME}`,
      description: collection.description,
      images: [
        {
          url: collection.coverImage,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },
  };
}

export default async function CollectionDetailPage({
  params,
}: CollectionPageProps) {
  const settings = await fetchPlatformSettings();
  if (!settings.enableCollections) {
    notFound();
  }

  const { slug } = await params;
  const data = await fetchCollectionBySlug(slug);

  if (!data) {
    notFound();
  }

  return (
    <CollectionDetailClient
      collection={data.collection}
      projects={data.projects}
    />
  );
}
