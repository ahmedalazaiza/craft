import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Header & Filter Chips Skeleton */}
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-[var(--bg-neutral)]" />
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-full bg-[var(--bg-neutral)]"
            />
          ))}
        </div>
      </div>

      {/* Projects Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
