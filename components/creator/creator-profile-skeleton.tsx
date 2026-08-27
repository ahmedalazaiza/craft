"use client";

import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { cn } from "@/lib/utils";

export function CreatorProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 space-y-8 animate-pulse">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-[var(--bg-neutral)]" />
        <div className="h-4 w-4 rounded-full bg-[var(--bg-neutral)]/40" />
        <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
      </div>

      {/* Profile Header Card */}
      <div className="rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Big Avatar */}
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[var(--bg-neutral)] shrink-0 border-2 border-[var(--border-neutral)]" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 sm:h-8 w-44 rounded-xl bg-[var(--bg-neutral)]" />
                <div className="h-5 w-5 rounded-full bg-[var(--bg-neutral)]" />
              </div>
              <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]/70" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 w-24 rounded-full bg-[var(--bg-neutral)]" />
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-2 max-w-2xl pt-2">
          <div className="h-4 w-full rounded-full bg-[var(--bg-neutral)]/80" />
          <div className="h-4 w-4/5 rounded-full bg-[var(--bg-neutral)]/60" />
        </div>

        {/* Pills row */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-7 w-28 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-7 w-20 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-7 w-32 rounded-full bg-[var(--bg-neutral)]" />
        </div>
      </div>

      {/* Tabs Placeholder */}
      <div className="flex items-center gap-4 border-b border-[var(--border-neutral)] pb-3">
        <div className="h-8 w-28 rounded-xl bg-[var(--bg-neutral)]" />
        <div className="h-8 w-24 rounded-xl bg-[var(--bg-neutral)]/50" />
      </div>

      {/* Projects Grid Skeleton */}
      <ProjectGridSkeleton count={8} columns={4} />
    </div>
  );
}
