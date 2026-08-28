"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, ProjectFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectCategory, Project } from "@/lib/types";
import {
  FolderKanban,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_CATEGORIES: (ProjectCategory | "All")[] = [
  "All",
  "UI",
  "Brand",
  "Photo",
  "Editorial",
  "3D & Motion",
  "Product",
  "Architecture",
  "Type",
];

interface ExploreClientProps {
  initialProjects?: Project[];
}

export function ExploreClient({ initialProjects = [] }: ExploreClientProps) {
  const { projects: contextProjects, isLoadingDb } = useSession();
  const projects = contextProjects.length > 0 ? contextProjects : initialProjects;


  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProjectFilters>({
    category: "All",
    tags: [],
    medium: "All",
    sortBy: "newest",
  });

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return publishedProjects
      .filter((p) => {
        // Search text matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSummary = p.summary.toLowerCase().includes(q);
          const matchCreator = p.creator.displayName.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchTools = p.tools.some((t) => t.toLowerCase().includes(q));
          if (
            !matchTitle &&
            !matchSummary &&
            !matchCreator &&
            !matchTags &&
            !matchTools
          ) {
            return false;
          }
        }

        // Category filter
        if (filters.category && filters.category !== "All") {
          if (p.category !== filters.category) return false;
        }

        // Medium filter
        if (filters.medium && filters.medium !== "All") {
          if (p.medium !== filters.medium) return false;
        }

        // Multi-tags filter (must match all selected tags)
        if (filters.tags.length > 0) {
          const hasAllTags = filters.tags.every((tag) => p.tags.includes(tag));
          if (!hasAllTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "appreciated") {
          return b.appreciations - a.appreciations;
        }
        // Default newest first
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });
  }, [publishedProjects, searchQuery, filters]);

  // Compute active filters count
  const activeFilterCount =
    (filters.category !== "All" ? 1 : 0) +
    (filters.medium !== "All" ? 1 : 0) +
    filters.tags.length +
    (filters.sortBy !== "newest" ? 1 : 0);

  // Count distinct disciplines in current pool
  const distinctCategoriesCount = useMemo(() => {
    return new Set(publishedProjects.map((p) => p.category)).size;
  }, [publishedProjects]);

  if (isLoadingDb && projects.length === 0) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Explore" }]} />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
          <div className="space-y-3 max-w-2xl">
            <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 sm:h-12 w-72 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
            <div className="h-4 w-full max-w-xl rounded-full bg-[var(--bg-neutral)]/70" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
            <div className="h-14 w-36 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]" />
          </div>
        </div>
        <div className="space-y-4 mb-6">
          <div className="h-12 w-full rounded-2xl bg-[var(--bg-neutral)]" />
          <div className="flex items-center gap-2 overflow-hidden pb-3 border-b border-[var(--border-neutral)]">
            {["w-14", "w-28", "w-32", "w-24", "w-24", "w-28", "w-36", "w-20"].map((w, idx) => (
              <div key={idx} className={`h-8 ${w} shrink-0 rounded-full bg-[var(--bg-neutral)]/70`} />
            ))}
          </div>
        </div>
        <ProjectGridSkeleton count={8} columns={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Explore" },
          ]}
        />


        {/* ========================================================================= */}
        {/* BALANCED 2-COLUMN HEADER (Title on Left + Quick Metrics Cards on Right)   */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#8DFF00]" />
              <span>Project Showcase</span>
              <span className="text-[var(--content-tertiary)]">•</span>
              <span className="font-normal text-[var(--chip-fg)]">Living Case Studies</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--primary-forest-green)] leading-tight tracking-tight"
              )}
            >
              Explore Projects
            </h1>
            <p className="mt-2 type-body-large text-[var(--content-secondary)] leading-relaxed">
              Discover standout design systems, branding monographs, UI interfaces, and visual craft published worldwide.
            </p>
          </div>

          {/* Right-aligned Showcase Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5 shadow-xs">
              <FolderKanban className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {publishedProjects.length} Case Studies
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  {distinctCategoriesCount} Disciplines
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5 shadow-xs">
              <Layers className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  100% Intrinsic
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  Zero Compression
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED INTERACTIVE SEARCH & CATEGORY TOOLBAR                             */}
        {/* ========================================================================= */}
        <div className="space-y-4 mb-6">
          {/* Main Search Input Strip */}
          <div className="w-full">
            <SearchField
              placeholder="Search projects by title, creator, tool, or tag..."
              initialQuery={searchQuery}
              onOpenFilter={() => setIsFilterOpen(true)}
              hasActiveFilters={activeFilterCount > 0}
              filterCount={activeFilterCount}
              className="w-full"
            />
          </div>

          {/* Category Chips Bar with Sort and Count info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-neutral)]">
            {/* Scrollable Quick Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {QUICK_CATEGORIES.map((cat) => {
                const isSelected = filters.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilters({ ...filters, category: cat })}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs transition-all shrink-0 cursor-pointer font-medium select-none",
                      isSelected
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                        : "bg-[var(--bg-neutral)]/70 text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort Toggle Controls on Right */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    sortBy:
                      filters.sortBy === "newest" ? "appreciated" : "newest",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all shadow-xs cursor-pointer"
                title="Change sorting order"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                <span>
                  {filters.sortBy === "appreciated"
                    ? "Most Appreciated"
                    : "Newest First"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
            <span className="type-label font-semibold text-[var(--content-tertiary)] mr-1">
              Active Filters:
            </span>
            {filters.category !== "All" && (
              <FilterChip
                active
                onRemove={() => setFilters({ ...filters, category: "All" })}
              >
                Category: {filters.category}
              </FilterChip>
            )}
            {filters.medium !== "All" && (
              <FilterChip
                active
                onRemove={() => setFilters({ ...filters, medium: "All" })}
              >
                Medium: {filters.medium}
              </FilterChip>
            )}
            {filters.tags.map((tag) => (
              <FilterChip
                key={tag}
                active
                onRemove={() =>
                  setFilters({
                    ...filters,
                    tags: filters.tags.filter((t) => t !== tag),
                  })
                }
              >
                #{tag}
              </FilterChip>
            ))}
            {filters.sortBy !== "newest" && (
              <FilterChip
                active
                onRemove={() => setFilters({ ...filters, sortBy: "newest" })}
              >
                Sort: Most Appreciated
              </FilterChip>
            )}
            <button
              onClick={() =>
                setFilters({
                  category: "All",
                  medium: "All",
                  tags: [],
                  sortBy: "newest",
                })
              }
              className="type-label font-semibold text-[var(--negative)] hover:underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results Counter Sub-strip */}
        <div className="mb-5 flex items-center justify-between text-xs text-[var(--content-tertiary)]">
          <span>
            Showing <strong className="text-[var(--content-primary)] font-semibold">{filteredProjects.length}</strong> project{filteredProjects.length === 1 ? "" : "s"}
          </span>
          {filters.category !== "All" && (
            <span>
              Filtered by <strong className="text-[var(--content-primary)] font-semibold">{filters.category}</strong>
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4-COLUMN RESPONSIVE PROJECT GRID                                         */}
        {/* ========================================================================= */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-12 text-center my-8">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h3 className="type-title-subsection text-[var(--content-primary)]">
              No projects found
            </h3>
            <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
              No projects matched your active filters or search query. Try resetting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        )}

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          mode="projects"
          projectFilters={filters}
          onProjectFiltersChange={setFilters}
        />
      </FadeIn>
    </div>
  );
}
