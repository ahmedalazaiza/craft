"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Heart, Sparkles, Compass, Search } from "lucide-react";
import { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FavoritesClientProps {
  initialProjects?: Project[];
}

export function FavoritesClient({ initialProjects = [] }: FavoritesClientProps) {
  const { user, projects: contextProjects, appreciatedProjectIds, isLoadingDb } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const allProjects = contextProjects.length > 0 ? contextProjects : initialProjects;

  // Filter projects to only those appreciated by the current user
  const favoriteProjects = useMemo(() => {
    if (!user || appreciatedProjectIds.size === 0) return [];
    return allProjects.filter((p) => appreciatedProjectIds.has(p.id));
  }, [user, appreciatedProjectIds, allProjects]);

  // Secondary text search within favorites
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favoriteProjects;
    const q = searchQuery.toLowerCase();
    return favoriteProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.creator.displayName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [favoriteProjects, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg-screen)] pb-24">
      {/* Top Header Section */}
      <div className="border-b border-[var(--border-neutral)] bg-[var(--bg-elevated)]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Favorites", href: "/favorites" },
            ]}
          />

          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500 mb-3 border border-rose-500/20">
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>Curated Saved Works</span>
              </div>
              <h1
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--content-primary)]"
                )}
              >
                Favorite Projects
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--content-secondary)] max-w-2xl">
                All the case studies, monographs, and design systems you have appreciated across Craft.
              </p>
            </div>

            {user && favoriteProjects.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in favorites..."
                    className="w-full rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] pl-9 pr-4 py-2 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:outline-none focus:border-[var(--content-primary)] transition-colors"
                  />
                </div>
                <div className="shrink-0 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-1.5 text-xs font-bold text-[var(--content-primary)]">
                  {favoriteProjects.length} {favoriteProjects.length === 1 ? "work" : "works"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {isLoadingDb ? (
          <ProjectGridSkeleton />
        ) : !user ? (
          // Logged Out State
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 sm:p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-5 border border-rose-500/20">
                <Heart className="h-8 w-8 fill-rose-500/30" />
              </div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                Sign in to view your favorites
              </h2>
              <p className="mt-2 text-sm text-[var(--content-secondary)] max-w-md">
                Keep track of inspiring design case studies, branding identities, and 3D visualisations by saving them to your personal favorites.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] px-6 py-2.5 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  Sign in to Craft
                </Link>
                <Link
                  href="/explore"
                  className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-6 py-2.5 text-xs font-semibold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors"
                >
                  Explore Projects
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : favoriteProjects.length === 0 ? (
          // Empty State
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 sm:p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--content-tertiary)] mb-5 border border-[var(--border-neutral)]">
                <Heart className="h-8 w-8" />
              </div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                No favorite projects yet
              </h2>
              <p className="mt-2 text-sm text-[var(--content-secondary)] max-w-md">
                When you see work that sparks your creativity, tap the heart icon on any project card or case study to save it here.
              </p>
              <div className="mt-6">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] px-6 py-2.5 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Compass className="h-4 w-4" />
                  <span>Explore Design Showcase</span>
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : filteredFavorites.length === 0 ? (
          // Search with 0 matches
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[var(--content-primary)]">
              No favorites matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-2 text-xs font-bold text-rose-500 hover:underline"
            >
              Clear search query
            </button>
          </div>
        ) : (
          // Project Cards Grid
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFavorites.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
