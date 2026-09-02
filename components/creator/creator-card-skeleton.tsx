"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CreatorCardSkeletonProps {
  className?: string;
}

export function CreatorCardSkeleton({ className }: CreatorCardSkeletonProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 sm:p-6 shadow-xs animate-pulse space-y-4 sm:space-y-5",
        className
      )}
    >
      {/* Header with Avatar & Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[var(--bg-neutral)] shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="h-4 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-3 w-44 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-[var(--bg-neutral)] shrink-0" />
          <div className="h-9 w-28 rounded-full bg-[var(--bg-neutral)] shrink-0" />
        </div>
      </div>

      {/* 3-Column Project Thumbnails Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
        <div className="rounded-2xl bg-[var(--bg-neutral)] aspect-[4/3]" />
        <div className="rounded-2xl bg-[var(--bg-neutral)] aspect-[4/3]" />
        <div className="hidden sm:block rounded-2xl bg-[var(--bg-neutral)] aspect-[4/3]" />
      </div>
    </div>
  );
}

