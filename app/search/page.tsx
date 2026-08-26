import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./search-client";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q && q.trim() ? `Search: "${q.trim()}"` : "Search";

  return {
    title,
    description: q
      ? `Search results for "${q}" across projects, creators, tools, and design disciplines on Craft.`
      : "Search projects, creators, tools, and design disciplines on Craft.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="type-body-large text-[var(--content-tertiary)]">
            Loading search results...
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
