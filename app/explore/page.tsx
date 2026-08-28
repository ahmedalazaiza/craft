import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreClient } from "./explore-client";
import { constructMetadata, generateCollectionJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Explore Curated Projects & Monographs",
  description:
    "Browse architectural monographs, UI systems, type specimens, brand identity systems, and spatial design projects from independent creators worldwide.",
  path: "/explore",
  keywords: [
    "explore design projects",
    "curated portfolio showcase",
    "UI UX design case studies",
    "brand systems gallery",
    "typography specimens",
    "architectural monographs",
    "design inspiration",
  ],
});

export default function ExplorePage() {
  const collectionJsonLd = generateCollectionJsonLd({
    name: "Explore Curated Projects & Monographs",
    description:
      "Browse architectural monographs, UI systems, type specimens, brand identity systems, and spatial design projects from independent creators worldwide.",
    url: "/explore",
    items: [
      { name: "Brand Identity", url: "/explore?category=Brand" },
      { name: "UI & Digital Systems", url: "/explore?category=UI" },
      { name: "Editorial & Publishing", url: "/explore?category=Editorial" },
      { name: "Typography", url: "/explore?category=Type" },
      { name: "Architecture & Spatial", url: "/explore?category=Architecture" },
      { name: "3D & Motion", url: "/explore?category=3D%20%26%20Motion" },
      { name: "Photography", url: "/explore?category=Photo" },
      { name: "Product Design", url: "/explore?category=Product" },
    ],
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="type-body-large text-[var(--content-tertiary)]">
              Loading gallery...
            </div>
          </div>
        }
      >
        <ExploreClient />
      </Suspense>
    </>
  );
}
