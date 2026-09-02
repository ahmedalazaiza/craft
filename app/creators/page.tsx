import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CreatorsClient } from "./creators-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchCreators } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Discover Top Designers & Creative Studios",
  description:
    "Find and connect with talented UI/UX designers, brand designers, and 3D artists from the Middle East and worldwide.",
  path: "/creators",
  keywords: [
    "designers directory",
    "independent creators",
    "design studios",
    "UI UX designers",
    "brand designers",
    "Arab designers",
    "creative network",
  ],
});

export default async function CreatorsPage() {
  const initialCreators = await fetchCreators();

  const collectionJsonLd = generateCollectionJsonLd({
    name: "Directory of Top Designers & Creative Studios",
    description:
      "Find and connect with talented UI/UX designers, brand designers, and 3D artists worldwide.",
    url: "/creators",
    items: initialCreators.map((c) => ({
      name: `${c.displayName} (@${c.username})`,
      url: `/u/${c.username}`,
      image: c.avatarUrl,
    })),
  });

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Creators", url: "/creators" },
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
              Loading creators...
            </div>
          </div>
        }
      >
        <CreatorsClient initialCreators={initialCreators || []} />
      </Suspense>
    </>
  );
}
