import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { CraftLoader } from "@/components/ui/craft-loader";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-8 space-y-12 animate-fade-in">
      {/* Hero Skeleton / Craft Loader Header */}
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <CraftLoader size="md" text="Curating monographs..." />
      </div>

      {/* Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
