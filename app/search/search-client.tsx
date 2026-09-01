"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { ProjectCategory } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { CreatorListItem } from "@/components/creator/creator-list-item";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, ProjectFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Search, FolderKanban, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTER_CATEGORIES: (ProjectCategory | "All")[] = [
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

export function SearchClient() {
  const searchParams = useSearchParams();
  const rawQ = searchParams?.get("q") || "";
  const q = rawQ.trim();

  const { projects, creators, isLoadingDb } = useSession();



  const [activeTab, setActiveTab] = useState<"all" | "projects" | "creators">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProjectFilters>({
    category: "All",
    tags: [],
    medium: "All",
    sortBy: "newest",
  });

  // Filter projects by query and filters
  const filteredProjects = useMemo(() => {
    const query = q.toLowerCase();

    return projects
      .filter((p) => p.published)
      .filter((p) => {
        // Query match
        if (query) {
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchSummary = p.summary.toLowerCase().includes(query);
          const matchCreator = p.creator.displayName.toLowerCase().includes(query);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
          const matchTools = p.tools.some((t) => t.toLowerCase().includes(query));
          if (!matchTitle && !matchSummary && !matchCreator && !matchTags && !matchTools) {
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

        // Tags filter
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
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [projects, q, filters]);

  // Filter creators by query
  const filteredCreators = useMemo(() => {
    const query = q.toLowerCase();

    return creators.filter((creator) => {

      if (!query) return true;
      const matchName = creator.displayName.toLowerCase().includes(query);
      const matchUsername = creator.username.toLowerCase().includes(query);
      const matchBio = creator.bio.toLowerCase().includes(query);
      const matchCity = creator.city.toLowerCase().includes(query);
      const matchSkills = creator.skills.some((s) => s.toLowerCase().includes(query));
      return matchName || matchUsername || matchBio || matchCity || matchSkills;
    });
  }, [q]);

  const totalResults = filteredProjects.length + filteredCreators.length;

  const activeFilterCount =
    (filters.category !== "All" ? 1 : 0) +
    (filters.medium !== "All" ? 1 : 0) +
    filters.tags.length +
    (filters.sortBy !== "newest" ? 1 : 0);

  if (isLoadingDb && projects.length === 0) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-pulse">
        <Breadcrumbs items={[{ label: "Search", href: "/search" }, { label: q ? `"${q}"` : "All Results" }]} />
        <div className="max-w-3xl mb-8 space-y-3">
          <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
          <div className="h-12 w-full rounded-2xl bg-[var(--bg-neutral)]" />
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
            { label: "Search", href: "/search" },
            { label: q ? `"${q}"` : "All Results", isCurrent: true },
          ]}
        />


        {/* Header Search Field */}
        <div className="max-w-3xl mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="type-label text-[var(--content-tertiary)] uppercase tracking-wider">
              Search Results
            </span>
          </div>
          <SearchField
            initialQuery={q}
            placeholder="Search projects, creators, tools, or tags..."
            onOpenFilter={() => setIsFilterOpen(true)}
            hasActiveFilters={activeFilterCount > 0}
            filterCount={activeFilterCount}
          />
        </div>

        {/* Results Metadata */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--border-neutral)] pb-4">
          <div>
            <h1
              className={cn(
                bricolage.className,
                "type-title-screen text-[var(--primary-forest-green)] font-bold"
              )}
            >
              {q ? (
                <>
                  Results for &ldquo;<span className="text-[var(--content-primary)]">{q}</span>&rdquo;
                </>
              ) : (
                "All Projects & Creators"
              )}
            </h1>
            <p className="type-body-default text-[var(--content-tertiary)] mt-1">
              Found {totalResults} result{totalResults === 1 ? "" : "s"} across projects and creator profiles.
            </p>
          </div>

          {/* Tab Switcher: All / Projects / Creators */}
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg-neutral)] p-1 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 sm:flex-initial rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center",
                activeTab === "all"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              )}
            >
              All ({totalResults})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={cn(
                "flex-1 sm:flex-initial rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center",
                activeTab === "projects"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              )}
            >
              Projects ({filteredProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("creators")}
              className={cn(
                "flex-1 sm:flex-initial rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer text-center",
                activeTab === "creators"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
              )}
            >
              Creators ({filteredCreators.length})
            </button>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-8 overflow-x-auto">
          {FILTER_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={filters.category === cat}
              onClick={() => setFilters({ ...filters, category: cat })}
            >
              {cat}
            </FilterChip>
          ))}
        </div>

        {/* Empty State */}
        {totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-12 text-center my-8">
            <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="type-title-subsection text-[var(--content-primary)]">
              No matching projects or creators
            </h3>
            <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
              We couldn&apos;t find anything matching &ldquo;{q}&rdquo;. Try broader keywords or explore all projects.
            </p>
          </div>
        ) : (
          <div className="space-y-14 min-h-[500px]">
            {/* Projects Section */}
            {(activeTab === "all" || activeTab === "projects") &&
              filteredProjects.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <div className="flex items-center gap-2 mb-6">
                      <FolderKanban className="h-5 w-5 text-[var(--primary-forest-green)]" />
                      <h2
                        className={cn(
                          bricolage.className,
                          "type-title-section text-[var(--content-primary)] font-semibold"
                        )}
                      >
                        Project Matches ({filteredProjects.length})
                      </h2>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project, idx) => (
                      <StaggerGridItem key={project.id} index={idx}>
                        <ProjectCard project={project} />
                      </StaggerGridItem>
                    ))}
                  </div>
                </div>
              )}

            {/* Creators Section */}
            {(activeTab === "all" || activeTab === "creators") &&
              filteredCreators.length > 0 && (
                <div>
                  {activeTab === "all" && (
                    <div className="flex items-center gap-2 mb-6 pt-6 border-t border-[var(--border-neutral)]">
                      <Users className="h-5 w-5 text-[var(--primary-forest-green)]" />
                      <h2
                        className={cn(
                          bricolage.className,
                          "type-title-section text-[var(--content-primary)] font-semibold"
                        )}
                      >
                        Creator Matches ({filteredCreators.length})
                      </h2>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCreators.map((creator, idx) => (
                      <StaggerGridItem key={creator.id} index={idx}>
                        <CreatorListItem creator={creator} />
                      </StaggerGridItem>
                    ))}
                  </div>
                </div>
              )}
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
