import React from "react";
import { CreatorGridSkeleton } from "@/components/creator/creator-grid-skeleton";

export default function CreatorsLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in">
      {/* Header & Search Placeholder */}
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-52 rounded-xl bg-[var(--bg-neutral)]" />
        <div className="h-4 w-72 rounded-full bg-[var(--bg-neutral)]/70" />
        <div className="h-11 max-w-md rounded-2xl bg-[var(--bg-neutral)] mt-4" />
      </div>

      {/* Creators Grid Skeleton */}
      <CreatorGridSkeleton count={6} />
    </div>
  );
}
