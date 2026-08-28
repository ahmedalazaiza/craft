import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { Sparkles, Layers, FolderKanban } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Top Header Shimmer */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)]">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-neutral)] px-3.5 py-1 text-xs">
            <div className="h-3 w-3 rounded-full bg-[#8DFF00]/40" />
            <div className="h-3 w-28 rounded-full bg-[var(--bg-neutral)]" />
          </div>
          <div className="h-10 sm:h-14 w-80 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-full max-w-xl rounded-full bg-[var(--bg-neutral)]/70" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)]" />
          <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)]" />
        </div>
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="space-y-4">
        <div className="h-12 w-full max-w-3xl rounded-2xl bg-[var(--bg-neutral)]" />
        <div className="flex items-center gap-2 overflow-hidden pb-2 border-b border-[var(--border-neutral)]">
          {["w-16", "w-24", "w-32", "w-20", "w-28", "w-36", "w-24"].map((w, i) => (
            <div key={i} className={`h-8 ${w} shrink-0 rounded-full bg-[var(--bg-neutral)]/60`} />
          ))}
        </div>
      </div>

      {/* Project Grid Skeleton (4 columns) */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
