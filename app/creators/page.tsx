import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CreatorsClient } from "./creators-client";

export const metadata: Metadata = {
  title: "Creators",
  description:
    "Discover independent studios, typographers, spatial designers, and creative engineers.",
  alternates: {
    canonical: "/creators",
  },
  openGraph: {
    title: "Creators · Craft",
    description:
      "Discover independent studios, typographers, spatial designers, and creative engineers.",
    url: "/creators",
  },
};

export default function CreatorsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="type-body-large text-[var(--content-tertiary)]">
            Loading creators...
          </div>
        </div>
      }
    >
      <CreatorsClient />
    </Suspense>
  );
}
