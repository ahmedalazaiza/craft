import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CreatorsClient } from "./creators-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";
import { fetchCreators } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Directory of Independent Creators & Design Studios",
  description:
    "Discover world-class independent designers, typographers, art directors, product architects, and creative studios. Connect and follow top makers.",
  path: "/creators",
  keywords: [
    "designers directory",
    "independent creators",
    "design studios",
    "art directors portfolio",
    "typographers directory",
    "top visual makers",
    "creative network",
  ],
});

export default async function CreatorsPage() {
  const initialCreators = await fetchCreators();

  const collectionJsonLd = generateCollectionJsonLd({
    name: "Directory of Independent Creators & Design Studios",
    description:
      "Discover world-class independent designers, typographers, art directors, product architects, and creative studios.",
    url: "/creators",
    items: [
      { name: "Creators & Studios Directory", url: "/creators" },
    ],
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
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
