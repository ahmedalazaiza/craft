import React from "react";
import { CreatorGridSkeleton } from "@/components/creator/creator-grid-skeleton";

export default function CreatorsLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 animate-pulse space-y-8">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-32 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Header Skeleton (Title on Left, Stats on Right) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--border-neutral)] mb-8">
        <div className="space-y-3 max-w-2xl">
          <div className="h-6 w-32 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-10 sm:h-12 w-80 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-96 max-w-full rounded-full bg-[var(--bg-neutral)]/70" />
        </div>

        {/* Right Stats Box Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-16 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
          <div className="h-16 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
        </div>
      </div>

      {/* Search Bar & Quick Filters Skeleton */}
      <div className="space-y-4 mb-8">
        <div className="h-12 max-w-xl rounded-2xl bg-[var(--bg-neutral)]" />
        <div className="flex flex-wrap gap-2">
          {["w-12", "w-28", "w-24", "w-20", "w-28", "w-20", "w-32", "w-24"].map((width, idx) => (
            <div key={idx} className={`h-8 ${width} rounded-full bg-[var(--bg-neutral)]/60`} />
          ))}
        </div>
      </div>

      {/* Creators Grid Skeleton */}
      <CreatorGridSkeleton count={6} />
    </div>
  );
}
