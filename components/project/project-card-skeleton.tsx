"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProjectCardSkeletonProps {
  className?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

export function ProjectCardSkeleton({
  className,
  aspectRatio = "video",
}: ProjectCardSkeletonProps) {
  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "portrait"
      ? "aspect-[4/5]"
      : "aspect-[16/10]";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-2.5 shadow-xs transition-all animate-pulse",
        className
      )}
    >
      {/* Cover Image Skeleton */}
      <div
        className={cn(
          "w-full rounded-[18px] bg-[var(--bg-neutral)]/80 relative overflow-hidden",
          aspectClass
        )}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      </div>

      {/* Card Info Skeleton */}
      <div className="flex items-center justify-between gap-3 p-2.5 pt-3">
        {/* Creator Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Avatar Circle */}
          <div className="h-7 w-7 rounded-full bg-[var(--bg-neutral)] shrink-0" />

          {/* Texts */}
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="h-3 w-3/4 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-2.5 w-1/2 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="h-6 w-12 rounded-full bg-[var(--bg-neutral)] shrink-0" />
      </div>
    </div>
  );
}
