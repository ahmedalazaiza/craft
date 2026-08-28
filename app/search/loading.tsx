import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
      <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      <div className="h-10 sm:h-12 w-80 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
      <div className="h-14 w-full rounded-2xl bg-[var(--bg-neutral)]" />
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
