"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 space-y-8 animate-pulse">
      {/* Top Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-4 w-4 rounded-full bg-[var(--bg-neutral)]/40" />
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)]">
        <div className="space-y-3 max-w-2xl flex-1">
          <div className="h-6 w-24 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-10 sm:h-12 w-4/5 rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-full rounded-full bg-[var(--bg-neutral)]/70" />
        </div>

        {/* Creator Info Box & Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-11 w-11 rounded-full bg-[var(--bg-neutral)]" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-3 w-16 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
          <div className="h-10 w-24 rounded-full bg-[var(--bg-neutral)] ml-2" />
        </div>
      </div>

      {/* Main Big Hero Image Placeholder */}
      <div className="relative aspect-[16/9] w-full rounded-[32px] bg-[var(--bg-neutral)] overflow-hidden border border-[var(--border-neutral)] shadow-sm">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
      </div>

      {/* Grid: Details & Side Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3 rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8">
            <div className="h-5 w-40 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-4 w-full rounded-full bg-[var(--bg-neutral)]/80" />
            <div className="h-4 w-5/6 rounded-full bg-[var(--bg-neutral)]/70" />
            <div className="h-4 w-4/6 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>

          {/* Secondary Gallery Image Placeholder */}
          <div className="aspect-[16/10] w-full rounded-[28px] bg-[var(--bg-neutral)]" />
        </div>

        {/* Sidebar Info Skeleton */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 space-y-4">
            <div className="h-4 w-24 rounded-full bg-[var(--bg-neutral)]" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-7 w-16 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-7 w-24 rounded-full bg-[var(--bg-neutral)]" />
            </div>

            <div className="pt-4 border-t border-[var(--border-neutral)] space-y-3">
              <div className="h-4 w-32 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-9 w-full rounded-xl bg-[var(--bg-neutral)]/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
