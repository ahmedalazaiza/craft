import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function ExploreLoading() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 space-y-6 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Header Skeleton (Title on Left + Search on Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-[var(--border-neutral)] mb-8">
        <div className="space-y-3 max-w-xl">
          <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-10 sm:h-12 w-72 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-full max-w-lg rounded-full bg-[var(--bg-neutral)]/70" />
        </div>
        <div className="h-12 w-full lg:w-[420px] rounded-full bg-[var(--bg-neutral)] shrink-0" />
      </div>

      {/* 4-column Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
