import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 animate-pulse space-y-6">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-4 w-3 rounded-full bg-[var(--bg-neutral)]/40" />
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Header Search Field Skeleton */}
      <div className="max-w-3xl mb-8 space-y-3">
        <div className="h-4 w-24 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-12 w-full rounded-2xl bg-[var(--bg-neutral)]" />
      </div>

      {/* Results Metadata Skeleton */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border-neutral)] pb-4 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-72 rounded-xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-48 rounded-full bg-[var(--bg-neutral)]/60" />
        </div>
        <div className="h-9 w-60 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Results Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
