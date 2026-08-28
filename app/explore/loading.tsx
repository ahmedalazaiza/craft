import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
        <div className="space-y-3 max-w-2xl">
          <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-10 sm:h-12 w-72 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-full max-w-xl rounded-full bg-[var(--bg-neutral)]/70" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
          <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
        </div>
      </div>

      {/* Search & Categories Skeleton */}
      <div className="space-y-4 mb-6">
        <div className="h-12 w-full rounded-2xl bg-[var(--bg-neutral)]" />
        <div className="flex items-center gap-2 overflow-hidden pb-3 border-b border-[var(--border-neutral)]">
          {["w-14", "w-28", "w-32", "w-24", "w-24", "w-28", "w-36", "w-20"].map((w, idx) => (
            <div key={idx} className={`h-8 ${w} shrink-0 rounded-full bg-[var(--bg-neutral)]/70`} />
          ))}
        </div>
      </div>

      {/* 4-column Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
