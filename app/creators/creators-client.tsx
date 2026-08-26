"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CreatorListItem } from "@/components/creator/creator-list-item";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, CreatorFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Sparkles, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_DISCIPLINES = [
  "All",
  "Brand Systems",
  "Typography",
  "UI Systems",
  "Photography",
  "Editorial",
  "Industrial Design",
  "Creative Code",
];

export function CreatorsClient() {
  const { creators, projects } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<CreatorFilters>({
    discipline: "All",
    city: "All",
    hasPublishedOnly: false,
  });

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      // Search text matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = creator.displayName.toLowerCase().includes(q);
        const matchUsername = creator.username.toLowerCase().includes(q);
        const matchBio = creator.bio.toLowerCase().includes(q);
        const matchCity = creator.city.toLowerCase().includes(q);
        const matchSkills = creator.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchUsername && !matchBio && !matchCity && !matchSkills) {
          return false;
        }
      }

      // Discipline filter
      if (filters.discipline && filters.discipline !== "All") {
        const matchDiscipline = creator.skills.includes(filters.discipline);
        if (!matchDiscipline) return false;
      }

      // City filter
      if (filters.city && filters.city !== "All") {
        if (creator.city !== filters.city && creator.location !== filters.city) {
          return false;
        }
      }

      // Has published monograph/project
      if (filters.hasPublishedOnly) {
        const hasWork = projects.some(
          (p) => p.creator.id === creator.id && p.published
        );
        if (!hasWork) return false;
      }

      return true;
    });
  }, [creators, projects, searchQuery, filters]);

  const activeFilterCount =
    (filters.discipline !== "All" ? 1 : 0) +
    (filters.city !== "All" ? 1 : 0) +
    (filters.hasPublishedOnly ? 1 : 0);

  // Distinct cities count for directory stats
  const uniqueCitiesCount = new Set(creators.map((u) => u.city)).size;

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Creators Directory", isCurrent: true },
          ]}
        />

        {/* ========================================================================= */}
        {/* UNIFIED BALANCED HEADER (Title & Description on Left + Stats on Right)   */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--border-neutral)] mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#8DFF00]" />
              <span>Creator Directory</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--primary-forest-green)] leading-tight tracking-tight"
              )}
            >
              Discover Creators & Studios
            </h1>
            <p className="mt-2 type-body-large text-[var(--content-secondary)] leading-relaxed">
              Explore designer portfolios, follow independent studios, and connect with creative talent worldwide.
            </p>
          </div>

          {/* Right-aligned Directory Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5">
              <Users className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {creators.length} Creators
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  Verified Studios
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5">
              <Globe className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {uniqueCitiesCount} Cities
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  Global Network
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH & DISCIPLINE FILTER BAR (Clean & Unified)                         */}
        {/* ========================================================================= */}
        <div className="space-y-4 mb-8">
          {/* Full-Width SearchField */}
          <SearchField
            placeholder="Search creators by name, discipline, bio, or city..."
            initialQuery={searchQuery}
            onOpenFilter={() => setIsFilterOpen(true)}
            hasActiveFilters={activeFilterCount > 0}
            filterCount={activeFilterCount}
          />

          {/* Discipline Chips Filter Row + Live Count in One Balanced Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
              {QUICK_DISCIPLINES.map((disc) => (
                <FilterChip
                  key={disc}
                  active={filters.discipline === disc}
                  onClick={() => setFilters({ ...filters, discipline: disc })}
                >
                  {disc}
                </FilterChip>
              ))}
            </div>

            <span className="text-xs font-semibold text-[var(--content-tertiary)] shrink-0 self-start sm:self-center">
              Showing <strong className="text-[var(--content-primary)] font-bold">{filteredCreators.length}</strong> creator{filteredCreators.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* Active Filters Pill Bar (if any applied) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 p-3.5 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
            <span className="type-label font-semibold text-[var(--content-tertiary)] mr-1">
              Active Filters:
            </span>
            {filters.discipline !== "All" && (
              <FilterChip
                active
                onRemove={() => setFilters({ ...filters, discipline: "All" })}
              >
                Discipline: {filters.discipline}
              </FilterChip>
            )}
            {filters.city !== "All" && (
              <FilterChip
                active
                onRemove={() => setFilters({ ...filters, city: "All" })}
              >
                City: {filters.city}
              </FilterChip>
            )}
            {filters.hasPublishedOnly && (
              <FilterChip
                active
                onRemove={() =>
                  setFilters({ ...filters, hasPublishedOnly: false })
                }
              >
                With Published Work
              </FilterChip>
            )}
            <button
              onClick={() =>
                setFilters({
                  discipline: "All",
                  city: "All",
                  hasPublishedOnly: false,
                })
              }
              className="type-label font-semibold text-[var(--negative)] hover:underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATORS GRID                                                             */}
        {/* ========================================================================= */}
        {filteredCreators.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-12 text-center my-8">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="type-title-subsection text-[var(--content-primary)]">
              No creators found
            </h3>
            <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
              No creators matched your search or filter criteria. Try resetting the filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator, idx) => (
              <StaggerGridItem key={creator.id} index={idx}>
                <CreatorListItem creator={creator} />
              </StaggerGridItem>
            ))}
          </div>
        )}

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          mode="creators"
          creatorFilters={filters}
          onCreatorFiltersChange={setFilters}
        />
      </FadeIn>
    </div>
  );
}
