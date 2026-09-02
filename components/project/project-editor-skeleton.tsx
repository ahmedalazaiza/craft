"use client";

import React from "react";

export function ProjectEditorSkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-screen)] text-[var(--content-primary)] flex flex-col overflow-hidden animate-pulse">
      {/* Top Header Command Bar Skeleton */}
      <header className="shrink-0 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 sticky top-0 z-30">
        <div className="flex w-full items-center justify-between px-4 sm:px-8 lg:px-[140px] py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-5 w-40 rounded-full bg-[var(--bg-neutral)]" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-44 rounded-full bg-[var(--bg-neutral)] hidden sm:block" />
          </div>
        </div>
      </header>

      {/* Main Canvas Skeleton */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full px-4 sm:px-8 lg:px-[140px] py-8 sm:py-12 space-y-8 max-w-4xl mx-auto">
          <div className="space-y-2 text-center flex flex-col items-center">
            <div className="h-10 w-72 rounded-2xl bg-[var(--bg-neutral)]" />
            <div className="h-4 w-96 rounded-full bg-[var(--bg-neutral)]" />
          </div>

          {/* Upload Dropzone Skeleton */}
          <div className="rounded-[32px] bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border-neutral)] p-20 flex flex-col items-center justify-center gap-4">
            <div className="h-20 w-20 rounded-3xl bg-[var(--bg-neutral)]" />
            <div className="h-6 w-60 rounded-xl bg-[var(--bg-neutral)]" />
            <div className="h-4 w-80 rounded-full bg-[var(--bg-neutral)]" />
          </div>
        </div>
      </main>

      {/* Sticky Bottom Footer Skeleton */}
      <footer className="shrink-0 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 sticky bottom-0 z-30">
        <div className="flex w-full items-center justify-between px-4 sm:px-8 lg:px-[140px] py-3.5 gap-4">
          <div className="h-4 w-16 rounded bg-[var(--bg-neutral)]" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-8 w-36 rounded-full bg-[var(--bg-neutral)]" />
          </div>
        </div>
      </footer>
    </div>
  );
}
