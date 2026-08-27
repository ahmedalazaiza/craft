"use client";

import React from "react";

export function ProjectEditorSkeleton() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 animate-pulse space-y-10 pb-20">
      {/* Top Action Navigation Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-neutral)] pb-6">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-7 w-28 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-10 w-36 rounded-full bg-[var(--bg-neutral)]" />
        </div>
      </div>

      {/* 2-Column Editor Form Skeleton (2 Cols Left, 1 Col Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Main Content Inputs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title Field Skeleton */}
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-14 w-full rounded-2xl bg-[var(--bg-neutral)]" />
          </div>

          {/* Primary Category Pills Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="flex flex-wrap gap-2">
              {["w-16", "w-20", "w-16", "w-24", "w-28", "w-20", "w-28", "w-16"].map((w, idx) => (
                <div key={idx} className={`h-8 ${w} rounded-full bg-[var(--bg-neutral)]/70`} />
              ))}
            </div>
          </div>

          {/* Medium Pills Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="flex flex-wrap gap-2">
              {["w-20", "w-20", "w-32", "w-24", "w-16"].map((w, idx) => (
                <div key={idx} className={`h-8 ${w} rounded-full bg-[var(--bg-neutral)]/70`} />
              ))}
            </div>
          </div>

          {/* Summary Field Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-24 w-full rounded-2xl bg-[var(--bg-neutral)]" />
          </div>

          {/* Body Narrative Field Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-44 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-64 w-full rounded-2xl bg-[var(--bg-neutral)]" />
          </div>

          {/* Gallery Media Upload Box */}
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="aspect-video w-full rounded-3xl bg-[var(--bg-neutral)]/40 border border-dashed border-[var(--border-neutral)]" />
          </div>
        </div>

        {/* Right Col: Cover Image & Metadata Sidebar */}
        <div className="space-y-8">
          {/* Cover Image Placeholder */}
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-full bg-[var(--bg-neutral)]" />
            <div className="aspect-[16/10] w-full rounded-3xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shadow-xs" />
          </div>

          {/* Tags Section Placeholder */}
          <div className="space-y-3 rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6">
            <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 w-full rounded-xl bg-[var(--bg-neutral)]" />
            <div className="flex flex-wrap gap-1.5 pt-2">
              <div className="h-6 w-16 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-6 w-20 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-6 w-16 rounded-full bg-[var(--bg-neutral)]" />
            </div>
          </div>

          {/* Tools Section Placeholder */}
          <div className="space-y-3 rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6">
            <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 w-full rounded-xl bg-[var(--bg-neutral)]" />
            <div className="flex flex-wrap gap-1.5 pt-2">
              <div className="h-6 w-20 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-6 w-24 rounded-full bg-[var(--bg-neutral)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
