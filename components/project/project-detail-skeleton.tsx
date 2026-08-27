"use client";

import React from "react";

export function ProjectDetailSkeleton() {
  return (
    <article className="pb-16 min-h-screen animate-pulse">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Breadcrumbs Navigation Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-4 w-3 rounded-full bg-[var(--bg-neutral)]/40" />
          <div className="h-4 w-24 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-4 w-3 rounded-full bg-[var(--bg-neutral)]/40" />
          <div className="h-4 w-36 rounded-full bg-[var(--bg-neutral)]" />
        </div>

        {/* Top Header Skeleton: Title & Summary */}
        <header className="mb-8 sm:mb-10 space-y-3">
          <div className="h-10 sm:h-12 w-3/4 max-w-2xl rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="h-4 w-full max-w-3xl rounded-full bg-[var(--bg-neutral)]/70" />
          <div className="h-4 w-4/5 max-w-2xl rounded-full bg-[var(--bg-neutral)]/50" />
        </header>

        {/* Main Body: Left Sticky Rail + Right Content Stack */}
        <div className="relative flex items-start gap-6 lg:gap-10">
          {/* Left Floating Sticky Action Rail Skeleton (Desktop) */}
          <aside className="hidden md:flex flex-col items-center sticky top-28 shrink-0 select-none">
            <div className="flex flex-col items-center gap-3 p-2 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] shadow-sm">
              <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]" />
              <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]" />
            </div>
            <div className="mt-4 pt-2">
              <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] ring-2 ring-[var(--border-neutral)]" />
            </div>
          </aside>

          {/* Right Continuous Media & Content Stack Skeleton */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Primary Cover Image Placeholder */}
            <div className="aspect-[16/10] w-full rounded-[24px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shadow-xs" />

            {/* Narrative Case-Study Description Block */}
            <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-8 space-y-3">
              <div className="h-5 w-40 rounded-full bg-[var(--bg-neutral)] mb-4" />
              <div className="h-4 w-full rounded-full bg-[var(--bg-neutral)]/80" />
              <div className="h-4 w-11/12 rounded-full bg-[var(--bg-neutral)]/70" />
              <div className="h-4 w-4/5 rounded-full bg-[var(--bg-neutral)]/60" />
            </div>

            {/* Secondary Media Gallery Placeholder */}
            <div className="aspect-[16/10] w-full rounded-[24px] bg-[var(--bg-neutral)] border border-[var(--border-neutral)]" />

            {/* Metadata Footer Box */}
            <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-24 rounded-full bg-[var(--bg-neutral)]" />
                <div className="h-7 w-28 rounded-full bg-[var(--bg-neutral)]" />
                <div className="h-7 w-20 rounded-full bg-[var(--bg-neutral)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
