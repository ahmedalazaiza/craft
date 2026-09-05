import React from "react";
import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ExploreClient } from "./explore-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchProjects, fetchCategories } from "@/lib/supabase/queries";
import { categoryToSlug } from "@/lib/taxonomy";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Explore Design Projects & Case Studies",
  description:
    "Browse UI/UX designs, brand identities, 3D artwork, and mobile app case studies from independent designers worldwide.",
  path: "/explore",
  keywords: [
    "explore design projects",
    "curated portfolio showcase",
    "UI UX design case studies",
    "brand identity gallery",
    "mobile app designs",
    "3D art inspiration",
    "design inspiration",
  ],
});

interface ExplorePageProps {
  searchParams: Promise<{ category?: string; [key: string]: string | string[] | undefined }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = (await searchParams) || {};
  const queryCat =
    typeof resolvedParams.category === "string" ? resolvedParams.category.trim() : undefined;

  if (queryCat) {
    const categories = await fetchCategories();
    const slug = categoryToSlug(queryCat, categories);
    if (slug) {
      permanentRedirect(`/explore/${slug}`);
    }
  }

  const initialProjects = await fetchProjects({ publishedOnly: true });

  const collectionJsonLd = generateCollectionJsonLd({
    name: "Explore Curated Projects & Case Studies",
    description:
      "Browse UI designs, brand identities, and 3D artwork from independent designers worldwide.",
    url: "/explore",
    items: initialProjects.map((p) => ({
      name: p.title,
      url: `/project/${p.slug}`,
      image: p.coverImage,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Explore", url: "/explore" },
  ]);

  return (
    <>
      <script
        key="jsonld-explore-collection"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        key="jsonld-explore-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ExploreClient initialProjects={initialProjects || []} />
    </>
  );
}
