"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserX, ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface CreatorNotFoundClientProps {
  searchedUsername: string;
}

export function CreatorNotFoundClient({ searchedUsername }: CreatorNotFoundClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchedUsername || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 sm:py-24">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Icon & Title */}
        <div className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-xs">
            <UserX className="h-8 w-8" strokeWidth={1.8} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-1 text-xs font-semibold text-[var(--content-secondary)]">
              <span>Results Not Found</span>
            </span>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl font-black text-[var(--content-primary)] tracking-tight"
              )}
            >
              No creator matching &ldquo;@{searchedUsername}&rdquo;
            </h1>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-md mx-auto leading-relaxed">
              The handle you entered may be misspelled, renamed, or does not exist. You can search directly or browse active creators across the platform.
            </p>
          </div>
        </div>

        {/* Interactive Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-lg mx-auto flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by creator name, handle, or discipline..."
              className="w-full rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] pl-11 pr-4 py-3 text-xs sm:text-sm text-[var(--content-primary)] shadow-sm focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden transition-all"
            />
          </div>
          <Button
            type="submit"
            variant="accent"
            size="default"
            className="rounded-full px-5 font-bold shadow-xs text-xs sm:text-sm"
          >
            <span>Search</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Action Navigation - Browse All Creators is prominently highlighted */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] px-5 py-2.5 text-xs sm:text-sm font-bold hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer group"
          >
            <Compass className="h-4 w-4 transition-transform group-hover:rotate-45" />
            <span>Browse All Creators</span>
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Latest Projects</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
