import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function ExploreLoading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 space-y-6">
      {/* Category Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-9 w-24 rounded-full bg-[var(--bg-neutral)] animate-pulse shrink-0"
          />
        ))}
      </div>
      <ProjectGridSkeleton count={6} />
    </div>
  );
}
