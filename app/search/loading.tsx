import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Search Header Skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded-xl bg-[var(--bg-neutral)]" />
        <div className="h-11 max-w-xl rounded-2xl bg-[var(--bg-neutral)]" />
      </div>

      {/* Results Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
