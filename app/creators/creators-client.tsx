"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CreatorListItem } from "@/components/creator/creator-list-item";
import { CreatorGridSkeleton } from "@/components/creator/creator-grid-skeleton";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, CreatorFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Creator } from "@/lib/types";
import { MASTER_TAXONOMY, normalizeCategory, getCategoryTaxonomy } from "@/lib/taxonomy";
import { Sparkles, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorsClientProps {
  initialCreators?: Creator[];
}

export function CreatorsClient({ initialCreators = [] }: CreatorsClientProps) {
  const { creators: contextCreators, projects, isLoadingDb } = useSession();
  const creators = contextCreators.length > 0 ? contextCreators : initialCreators;

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

      // Discipline filter matching (checks exact skill or normalized category match)
      const activeDiscipline = filters.discipline;
      if (activeDiscipline && activeDiscipline !== "All") {
        const targetTax = getCategoryTaxonomy(activeDiscipline);
        const matchDiscipline = creator.skills.some((skill) => {
          if (skill.toLowerCase() === activeDiscipline.toLowerCase()) return true;
          if (targetTax) {
            if (skill.toLowerCase() === targetTax.name.toLowerCase()) return true;
            if (skill.toLowerCase() === targetTax.shortName.toLowerCase()) return true;
            if (targetTax.subCategories.some((sub) => sub.toLowerCase() === skill.toLowerCase())) return true;
            if (targetTax.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase())) return true;
          }
          return false;
        });
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

  if (isLoadingDb && creators.length === 0) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Creators" }]} />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[var(--border-neutral)] mb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 sm:h-12 w-80 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
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
            {["w-14", "w-32", "w-28", "w-28", "w-24", "w-32", "w-28"].map((w, idx) => (
              <div key={idx} className={`h-8 ${w} shrink-0 rounded-full bg-[var(--bg-neutral)]/70`} />
            ))}
          </div>
        </div>
        <CreatorGridSkeleton count={6} />
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
            { label: "Creators" },
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
                "text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--content-primary)] leading-tight tracking-tight"
              )}
            >
              Discover Global Creators
            </h1>
            <p className="mt-2 type-body-large text-[var(--content-secondary)] leading-relaxed">
              Explore independent designers, art directors, typographers, and creative engineers publishing on Craft worldwide.
            </p>
          </div>

          {/* Right-aligned Directory Stats Cards */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5 shadow-xs">
              <Users className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {creators.length} Creators
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  {MASTER_TAXONOMY.length} Disciplines
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5 shadow-xs">
              <Globe className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {uniqueCitiesCount} Cities
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  Worldwide
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED INTERACTIVE SEARCH & DISCIPLINE FILTER TOOLBAR                    */}
        {/* ========================================================================= */}
        <div className="space-y-4 mb-8">
          {/* Main Search Input */}
          <div className="w-full">
            <SearchField
              placeholder="Search creators by name, username, bio, discipline, or city..."
              initialQuery={searchQuery}
              onOpenFilter={() => setIsFilterOpen(true)}
              hasActiveFilters={activeFilterCount > 0}
              filterCount={activeFilterCount}
              className="w-full"
            />
          </div>

          {/* Quick Discipline Pills Strip (13 Categories) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar border-b border-[var(--border-neutral)]">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, discipline: "All" })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs transition-all shrink-0 cursor-pointer font-semibold select-none",
                filters.discipline === "All"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "bg-[var(--bg-neutral)]/70 text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              All
            </button>
            {MASTER_TAXONOMY.map((cat) => {
              const isSelected =
                filters.discipline === cat.name || filters.discipline === cat.shortName;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, discipline: cat.name })}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs transition-all shrink-0 cursor-pointer font-medium select-none",
                    isSelected
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                      : "bg-[var(--bg-neutral)]/70 text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                  )}
                  title={cat.name}
                >
                  {cat.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 p-3 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
            <span className="text-xs font-semibold text-[var(--content-secondary)] mr-1">
              Active filters:
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
                onRemove={() => setFilters({ ...filters, hasPublishedOnly: false })}
              >
                With Published Works
              </FilterChip>
            )}

            <button
              type="button"
              onClick={() =>
                setFilters({
                  discipline: "All",
                  city: "All",
                  hasPublishedOnly: false,
                })
              }
              className="text-xs text-[var(--content-link)] hover:underline ml-auto font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATORS GRID DISPLAY                                                     */}
        {/* ========================================================================= */}
        {filteredCreators.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 text-center my-8">
            <p className="type-title-subsection text-[var(--content-primary)] font-bold text-lg">
              No matching creators found
            </p>
            <p className="type-body-default text-[var(--content-secondary)] mt-2 max-w-md mx-auto text-sm">
              Try adjusting your search query, changing the discipline pill, or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  discipline: "All",
                  city: "All",
                  hasPublishedOnly: false,
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full font-bold bg-[var(--accent)] text-[#090C09] hover:bg-[var(--accent-hover)] px-5 py-2 text-xs shadow-xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
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
      </FadeIn>

      {/* Filter Drawer for deeper multi-faceted filtering */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        mode="creators"
        creatorFilters={filters}
        onCreatorFiltersChange={setFilters}
      />
    </div>
  );
}
