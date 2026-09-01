import React from "react";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";

export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <div className="h-7 w-48 rounded-full bg-[var(--bg-neutral)]" />
          </div>
          {/* Headline */}
          <div className="flex justify-center">
            <div className="h-12 sm:h-16 w-full max-w-2xl rounded-2xl bg-[var(--bg-neutral)]" />
          </div>
          {/* Subheadline */}
          <div className="flex justify-center">
            <div className="h-5 w-full max-w-lg rounded-full bg-[var(--bg-neutral)]/70" />
          </div>
          {/* CTA Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <div className="h-12 w-40 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-12 w-36 rounded-full bg-[var(--bg-neutral)]/60" />
          </div>
        </div>
      </section>

      {/* Featured Projects Skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-xl bg-[var(--bg-neutral)]" />
          <div className="h-8 w-24 rounded-full bg-[var(--bg-neutral)]/60" />
        </div>
        <ProjectGridSkeleton count={4} columns={4} />
      </section>

      {/* Featured Creators Skeleton */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-52 rounded-xl bg-[var(--bg-neutral)]" />
          <div className="h-8 w-24 rounded-full bg-[var(--bg-neutral)]/60" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
