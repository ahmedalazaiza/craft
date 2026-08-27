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
        "group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-5 sm:p-6 shadow-xs animate-pulse",
        className
      )}
    >
      {/* Header with Avatar & Handle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Avatar Skeleton */}
          <div className="h-14 w-14 rounded-full bg-[var(--bg-neutral)] shrink-0" />

          {/* Name & Handle */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="h-4 w-32 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-3 w-20 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
        </div>

        {/* Follow Button Skeleton */}
        <div className="h-9 w-20 rounded-full bg-[var(--bg-neutral)] shrink-0" />
      </div>

      {/* Bio Skeleton */}
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded-full bg-[var(--bg-neutral)]/80" />
        <div className="h-3 w-4/5 rounded-full bg-[var(--bg-neutral)]/50" />
      </div>

      {/* Skills / Tags Row */}
      <div className="mt-4 flex gap-1.5">
        <div className="h-6 w-16 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-6 w-20 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-6 w-14 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* 3 Project Thumbnails Row */}
      <div className="mt-5 grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-neutral)]/50">
        <div className="aspect-square rounded-xl bg-[var(--bg-neutral)]" />
        <div className="aspect-square rounded-xl bg-[var(--bg-neutral)]" />
        <div className="aspect-square rounded-xl bg-[var(--bg-neutral)]" />
      </div>
    </div>
  );
}
