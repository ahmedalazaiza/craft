import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "Explore projects",
  description:
    "Browse architectural monographs, UI systems, type specimens, and spatial design projects from independent creators.",
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore projects · Craft",
    description:
      "Browse architectural monographs, UI systems, type specimens, and spatial design projects from independent creators.",
    url: "/explore",
  },
};

export default function ExplorePage() {
  return (
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
  );
}
