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
        "group relative flex flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[26px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 sm:p-5 shadow-xs animate-pulse space-y-3.5 sm:space-y-4",
        className
      )}
    >
      {/* Header with Avatar & Details */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[var(--bg-neutral)] shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="h-4 w-32 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-3 w-40 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-8.5 w-8.5 rounded-full bg-[var(--bg-neutral)] shrink-0" />
          <div className="h-8.5 w-24 rounded-full bg-[var(--bg-neutral)] shrink-0" />
        </div>
      </div>

      {/* 2-Column Project Thumbnails Skeleton */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
        <div className="rounded-xl sm:rounded-2xl bg-[var(--bg-neutral)] aspect-[4/3]" />
        <div className="rounded-xl sm:rounded-2xl bg-[var(--bg-neutral)] aspect-[4/3]" />
      </div>
    </div>
  );
}

