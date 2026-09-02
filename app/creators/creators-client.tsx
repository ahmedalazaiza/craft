"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CreatorListItem } from "@/components/creator/creator-list-item";
import { CreatorGridSkeleton } from "@/components/creator/creator-grid-skeleton";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, CreatorFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Creator } from "@/lib/types";
import { MASTER_TAXONOMY, normalizeCategory, getCategoryTaxonomy } from "@/lib/taxonomy";
import { computeCreatorRank } from "@/lib/ranking";
import { Sparkles } from "lucide-react";
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

  // 1. Initialize filter and search state from URL query on client mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const disc = urlParams.get("discipline");
    const city = urlParams.get("city");
    const hasWork = urlParams.get("hasWork") === "true";
    const q = urlParams.get("q");

    if (q) setSearchQuery(q);

    setFilters((prev) => ({
      ...prev,
      discipline: disc || prev.discipline,
      city: city || prev.city,
      hasPublishedOnly: hasWork || prev.hasPublishedOnly,
    }));
  }, []);

  // 2. Real-time URL query synchronization
  const syncUrlParams = (newFilters: CreatorFilters, newQuery: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newFilters.discipline && newFilters.discipline !== "All") params.set("discipline", newFilters.discipline);
    if (newFilters.city && newFilters.city !== "All") params.set("city", newFilters.city);
    if (newFilters.hasPublishedOnly) params.set("hasWork", "true");

    const newUrl = params.toString() ? `/creators?${params.toString()}` : "/creators";
    window.history.replaceState(null, "", newUrl);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    syncUrlParams(filters, query);
  };

  const handleFiltersChange = (updated: CreatorFilters) => {
    setFilters(updated);
    syncUrlParams(updated, searchQuery);
  };

  const filteredCreators = useMemo(() => {
    const hasSearchQuery = searchQuery.trim().length > 0;
    const q = searchQuery.toLowerCase().trim();

    return creators
      .filter((creator) => {
        // Find published projects belonging to this creator
        const creatorProjects = projects.filter(
          (p) =>
            p.creator &&
            (p.creator.id === creator.id ||
              p.creator.username.toLowerCase() === creator.username.toLowerCase()) &&
            p.published
        );

        // Visibility Rule: In the general directory (no search query), creators with 0 published works are hidden
        if (!hasSearchQuery && creatorProjects.length === 0) {
          return false;
        }

        // If explicit toggle "hasPublishedOnly" is active
        if (filters.hasPublishedOnly && creatorProjects.length === 0) {
          return false;
        }

        // Search text matching (when searching, search by name, handle, bio, city, or skills)
        if (hasSearchQuery) {
          const matchName = creator.displayName.toLowerCase().includes(q);
          const matchUsername = creator.username.toLowerCase().includes(q);
          const matchBio = creator.bio.toLowerCase().includes(q);
          const matchCity = (creator.city || "").toLowerCase().includes(q);
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

        // Location filter (supports exact city, country, or partial string match)
        if (filters.city && filters.city !== "All") {
          const target = filters.city.toLowerCase().trim();
          const cCity = (creator.city || "").toLowerCase().trim();
          const cLoc = (creator.location || "").toLowerCase().trim();
          const targetMainCity = target.split(",")[0].trim();

          const match =
            cCity === target ||
            cLoc === target ||
            cCity.includes(target) ||
            cLoc.includes(target) ||
            target.includes(cCity) ||
            target.includes(cLoc) ||
            (targetMainCity && (cCity.includes(targetMainCity) || cLoc.includes(targetMainCity)));

          if (!match) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const aProjects = projects.filter(
          (p) =>
            p.creator &&
            (p.creator.id === a.id || p.creator.username.toLowerCase() === a.username.toLowerCase()) &&
            p.published
        );
        const bProjects = projects.filter(
          (p) =>
            p.creator &&
            (p.creator.id === b.id || p.creator.username.toLowerCase() === b.username.toLowerCase()) &&
            p.published
        );

        const scoreA = computeCreatorRank(a, aProjects, hasSearchQuery ? q : undefined);
        const scoreB = computeCreatorRank(b, bProjects, hasSearchQuery ? q : undefined);

        return scoreB - scoreA;
      });
  }, [creators, projects, searchQuery, filters]);

  const activeFilterCount =
    (filters.discipline !== "All" ? 1 : 0) +
    (filters.city !== "All" ? 1 : 0) +
    (filters.hasPublishedOnly ? 1 : 0);



  if (isLoadingDb && creators.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 space-y-6 animate-pulse">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Creators" }]} />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-[var(--border-neutral)] mb-8">
          <div className="space-y-3 max-w-xl">
            <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 sm:h-12 w-80 max-w-full rounded-2xl bg-[var(--bg-neutral)]" />
            <div className="h-4 w-full max-w-lg rounded-full bg-[var(--bg-neutral)]/70" />
          </div>
          <div className="h-12 w-full lg:w-[420px] rounded-full bg-[var(--bg-neutral)] shrink-0" />
        </div>
        <CreatorGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Creators" },
          ]}
        />

        {/* ========================================================================= */}
        {/* BALANCED 2-COLUMN HEADER (Title & Description on Left + Search on Right)  */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-neutral-900 dark:text-white" />
              <span>Creator Directory</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[40px] font-black text-neutral-950 dark:text-white leading-tight tracking-tight"
              )}
            >
              Discover Global Creators
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              Explore independent designers, art directors, typographers, and creative engineers publishing on Layerat worldwide.
            </p>
          </div>

          {/* Right: Search Input (Vertically Centered with Title & Description) */}
          <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
            <SearchField
              placeholder="Search creators by name, username, bio, discipline, or city..."
              initialQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onOpenFilter={() => setIsFilterOpen(true)}
              hasActiveFilters={activeFilterCount > 0}
              filterCount={activeFilterCount}
              className="w-full"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBHEADER TOOLBAR: Results Count                                          */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-xs font-semibold text-[var(--content-secondary)]">
            Showing <strong className="text-[var(--content-primary)] font-bold">{filteredCreators.length}</strong> {filteredCreators.length === 1 ? "creator" : "creators"}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        <AnimatePresence initial={false}>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "2rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mr-1">
                  Active filters:
                </span>

                {filters.discipline !== "All" && (
                  <FilterChip
                    active
                    onRemove={() => handleFiltersChange({ ...filters, discipline: "All" })}
                  >
                    Discipline: {filters.discipline}
                  </FilterChip>
                )}

                {filters.city !== "All" && (
                  <FilterChip
                    active
                    onRemove={() => handleFiltersChange({ ...filters, city: "All" })}
                  >
                    Location: {filters.city}
                  </FilterChip>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleFiltersChange({
                      discipline: "All",
                      city: "All",
                      hasPublishedOnly: false,
                    })
                  }
                  className="text-xs text-neutral-900 dark:text-white hover:underline ml-auto font-bold cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* CREATORS GRID DISPLAY                                                     */}
        {/* ========================================================================= */}
        {filteredCreators.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-12 text-center my-8 shadow-xs min-h-[400px] flex flex-col items-center justify-center">
            <p className={cn(bricolage.className, "text-xl font-bold text-neutral-950 dark:text-white")}>
              No matching creators found
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed font-normal">
              Try adjusting your search query, changing the discipline pill, or resetting filters.
            </p>
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                handleSearchChange("");
                handleFiltersChange({
                  discipline: "All",
                  city: "All",
                  hasPublishedOnly: false,
                });
              }}
              className="mt-5 rounded-full px-6 text-xs font-bold"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 min-h-[500px]">
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
        onCreatorFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
