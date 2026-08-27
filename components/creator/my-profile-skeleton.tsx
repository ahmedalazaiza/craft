"use client";

import React from "react";
import { ProjectCardSkeleton } from "@/components/project/project-card-skeleton";

export function MyProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-20 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-4 w-3 rounded-full bg-[var(--bg-neutral)]/40" />
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Profile Sidebar Card */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-7 shadow-xs space-y-6">
            {/* Avatar & Info */}
            <div className="flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-full bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] mb-4" />
              <div className="h-6 w-36 rounded-xl bg-[var(--bg-neutral)] mb-2" />
              <div className="h-3.5 w-24 rounded-full bg-[var(--bg-neutral)]/70 mb-3" />
              <div className="h-3.5 w-32 rounded-full bg-[var(--bg-neutral)]/50" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="h-10 flex-1 rounded-xl bg-[var(--bg-neutral)]" />
                <div className="h-10 w-10 rounded-xl bg-[var(--bg-neutral)]" />
              </div>
              <div className="h-8 w-full rounded-xl bg-[var(--bg-neutral)]/50" />
            </div>

            {/* Bio Section */}
            <div className="pt-3 border-t border-[var(--border-neutral)] space-y-2">
              <div className="h-3 w-16 rounded-full bg-[var(--bg-neutral)]/60 mb-2" />
              <div className="h-3.5 w-full rounded-full bg-[var(--bg-neutral)]/80" />
              <div className="h-3.5 w-5/6 rounded-full bg-[var(--bg-neutral)]/60" />
              <div className="h-3.5 w-3/4 rounded-full bg-[var(--bg-neutral)]/40" />
            </div>

            {/* Metrics 3-box Grid */}
            <div className="pt-3 border-t border-[var(--border-neutral)]">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
                <div className="h-16 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
                <div className="h-16 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
              </div>
            </div>

            {/* Disciplines Chips */}
            <div className="pt-3 border-t border-[var(--border-neutral)] space-y-2">
              <div className="h-3 w-28 rounded-full bg-[var(--bg-neutral)]/60 mb-2" />
              <div className="flex flex-wrap gap-1.5">
                <div className="h-6 w-20 rounded-full bg-[var(--bg-neutral)]" />
                <div className="h-6 w-24 rounded-full bg-[var(--bg-neutral)]" />
                <div className="h-6 w-16 rounded-full bg-[var(--bg-neutral)]" />
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Toolbar + Projects Grid */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
          {/* Header Toolbar */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-neutral)]">
            <div className="h-9 w-44 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-9 w-28 rounded-full bg-[var(--bg-neutral)]" />
          </div>

          {/* Project Grid Skeleton (6 cards matching dashboard grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <ProjectCardSkeleton key={key} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
