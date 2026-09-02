import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreClient } from "./explore-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchProjects } from "@/lib/supabase/queries";

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

export default async function ExplorePage() {
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
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="w-full px-4 sm:px-6 lg:px-[140px] py-16 text-center">
            <div className="type-body-large text-[var(--content-tertiary)]">
              Loading gallery...
            </div>
          </div>
        }
      >
        <ExploreClient initialProjects={initialProjects || []} />
      </Suspense>
    </>
  );
}
