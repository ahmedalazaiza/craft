"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectGridSkeleton } from "@/components/project/project-grid-skeleton";
import { SearchField } from "@/components/search/search-field";
import { FilterDrawer, ProjectFilters } from "@/components/search/filter-drawer";
import { FilterChip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectCategory, Project } from "@/lib/types";
import {
  MASTER_TAXONOMY,
  normalizeCategory,
  getCategoryTaxonomy,
} from "@/lib/taxonomy";
import {
  Sparkles,
  ArrowUpDown,
  X,
} from "lucide-react";
import { sortProjects } from "@/lib/ranking";
import { cn } from "@/lib/utils";

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
    subCategory: "All",
    tags: [],
    tools: [],
    medium: "All",
    sortBy: "curated",
  });

  // 1. Initialize filter and search state from URL query on client mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get("category");
    const subCat = urlParams.get("subCategory");
    const med = urlParams.get("medium");
    const sort = urlParams.get("sort") || urlParams.get("sortBy");
    const tagsParam = urlParams.get("tags");
    const toolsParam = urlParams.get("tools");
    const q = urlParams.get("q");

    if (q) setSearchQuery(q);

    setFilters((prev) => ({
      ...prev,
      category: cat || prev.category,
      subCategory: subCat || prev.subCategory,
      medium: med || prev.medium,
      sortBy: (sort as any) || prev.sortBy,
      tags: tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : prev.tags,
      tools: toolsParam ? toolsParam.split(",").map((t) => t.trim()).filter(Boolean) : prev.tools,
    }));
  }, []);

  // 2. Real-time URL query synchronization
  const syncUrlParams = (newFilters: ProjectFilters, newQuery: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newFilters.category && newFilters.category !== "All") params.set("category", newFilters.category);
    if (newFilters.subCategory && newFilters.subCategory !== "All") params.set("subCategory", newFilters.subCategory);
    if (newFilters.medium && newFilters.medium !== "All") params.set("medium", newFilters.medium);
    if (newFilters.sortBy && newFilters.sortBy !== "curated") params.set("sort", newFilters.sortBy);
    if (newFilters.tags && newFilters.tags.length > 0) params.set("tags", newFilters.tags.join(","));
    if (newFilters.tools && newFilters.tools.length > 0) params.set("tools", newFilters.tools.join(","));

    const newUrl = params.toString() ? `/explore?${params.toString()}` : "/explore";
    window.history.replaceState(null, "", newUrl);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    syncUrlParams(filters, query);
  };

  const handleFiltersChange = (updated: ProjectFilters) => {
    setFilters(updated);
    syncUrlParams(updated, searchQuery);
  };

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Dynamic Sub-categories based on selected Category
  const activeTaxonomy = useMemo(() => {
    if (!filters.category || filters.category === "All") return null;
    return getCategoryTaxonomy(filters.category);
  }, [filters.category]);



  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return sortProjects(
      publishedProjects.filter((p) => {
        // Search text matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSummary = p.summary.toLowerCase().includes(q);
          const matchCreator = p.creator.displayName.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchTools = p.tools.some((t) => t.toLowerCase().includes(q));
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchSubCategory = p.subCategory?.toLowerCase().includes(q);

          if (
            !matchTitle &&
            !matchSummary &&
            !matchCreator &&
            !matchTags &&
            !matchTools &&
            !matchCategory &&
            !matchSubCategory
          ) {
            return false;
          }
        }

        // Category filter (with normalization)
        if (filters.category && filters.category !== "All") {
          const targetNorm = normalizeCategory(filters.category);
          const projectNorm = normalizeCategory(p.category);
          if (targetNorm !== projectNorm && p.category !== filters.category) {
            return false;
          }
        }

        // Sub-Category filter
        if (filters.subCategory && filters.subCategory !== "All") {
          const sub = filters.subCategory.toLowerCase();
          const matchSub = p.subCategory?.toLowerCase() === sub;
          const matchTag = p.tags.some((t) => t.toLowerCase() === sub);
          if (!matchSub && !matchTag) return false;
        }

        // Medium filter
        if (filters.medium && filters.medium !== "All") {
          if (p.medium !== filters.medium) return false;
        }

        // Multi-tags filter (must match all selected tags)
        if (filters.tags.length > 0) {
          const hasAllTags = filters.tags.every((tag) =>
            p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
          );
          if (!hasAllTags) return false;
        }

        // Multi-tools filter (must match all selected tools)
        if (filters.tools && filters.tools.length > 0) {
          const hasAllTools = filters.tools.every((tool) =>
            p.tools.some((t) => t.toLowerCase() === tool.toLowerCase())
          );
          if (!hasAllTools) return false;
        }

          return true;
        })
    );
  }, [publishedProjects, searchQuery, filters]);



  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category && filters.category !== "All") count++;
    if (filters.subCategory && filters.subCategory !== "All") count++;
    if (filters.medium && filters.medium !== "All") count++;
    count += filters.tags.length;
    count += (filters.tools?.length || 0);
    return count;
  }, [filters]);

  const removeTag = (tagToRemove: string) => {
    const updated = {
      ...filters,
      tags: filters.tags.filter((t) => t !== tagToRemove),
    };
    handleFiltersChange(updated);
  };

  const removeTool = (toolToRemove: string) => {
    const updated = {
      ...filters,
      tools: (filters.tools || []).filter((t) => t !== toolToRemove),
    };
    handleFiltersChange(updated);
  };

  // Guard skeleton: Only show skeleton during cold empty fetch
  if (isLoadingDb && projects.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-28 rounded-full bg-[var(--bg-neutral)]" />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-[var(--border-neutral)] mb-8">
          <div className="space-y-3 max-w-xl">
            <div className="h-6 w-36 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 w-72 rounded-2xl bg-[var(--bg-neutral)]" />
            <div className="h-4 w-full max-w-lg rounded-full bg-[var(--bg-neutral)]/70" />
          </div>
          <div className="h-12 w-full lg:w-[420px] rounded-full bg-[var(--bg-neutral)] shrink-0" />
        </div>
        <ProjectGridSkeleton count={8} columns={4} />
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
            { label: "Explore" },
          ]}
        />

        {/* ========================================================================= */}
        {/* BALANCED 2-COLUMN HEADER (Title on Left + Search on Right)                */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-neutral-900 dark:text-white" />
              <span>Project Showcase</span>
              <span className="text-neutral-400 dark:text-neutral-500">•</span>
              <span className="font-normal text-neutral-500 dark:text-neutral-400">Design Case Studies</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[40px] font-black text-neutral-950 dark:text-white leading-tight tracking-tight"
              )}
            >
              Explore Projects
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              Discover standout UI designs, brand identities, typography, and creative projects published worldwide.
            </p>
          </div>

          {/* Right: Search Input (Vertically Centered with Title & Description) */}
          <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
            <SearchField
              placeholder="Search projects by title, creator, or tag..."
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
        {/* SUBHEADER TOOLBAR: Results Count & Sort Controls                          */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-xs font-semibold text-[var(--content-secondary)]">
            Showing <strong className="text-[var(--content-primary)] font-bold">{filteredProjects.length}</strong> {filteredProjects.length === 1 ? "project" : "projects"}
          </div>

          <button
            type="button"
            onClick={() => {
              const nextSort =
                filters.sortBy === "curated"
                  ? "newest"
                  : filters.sortBy === "newest"
                  ? "appreciated"
                  : "curated";
              handleFiltersChange({
                ...filters,
                sortBy: nextSort,
              });
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
            title="Cycle sorting order"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>
              {filters.sortBy === "appreciated"
                ? "Most Appreciated"
                : filters.sortBy === "newest"
                ? "Newest First"
                : "Curated & Trending"}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        {activeFilterCount > 0 && (
          <div className="mb-6 overflow-hidden animate-fade-in">
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mr-1">
                Active filters:
              </span>

              {/* Category Filter */}
              {filters.category && filters.category !== "All" && (
                <span className="inline-flex items-center gap-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  <span>Category: {activeTaxonomy?.shortName || filters.category}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleFiltersChange({ ...filters, category: "All", subCategory: "All" })
                    }
                    className="hover:text-red-400 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Sub-Category Filter */}
              {filters.subCategory && filters.subCategory !== "All" && (
                <span className="inline-flex items-center gap-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  <span>Sub: {filters.subCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, subCategory: "All" })}
                    className="hover:text-red-400 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Medium Filter */}
              {filters.medium && filters.medium !== "All" && (
                <span className="inline-flex items-center gap-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-1 rounded-full text-xs font-semibold">
                  <span>Format: {filters.medium}</span>
                  <button
                    type="button"
                    onClick={() => handleFiltersChange({ ...filters, medium: "All" })}
                    className="hover:text-red-400 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {/* Tags Filters */}
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Tools Filters */}
              {(filters.tools || []).map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 px-3 py-1 rounded-full text-xs font-bold shadow-xs"
                >
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="hover:text-red-500 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              {/* Reset All Button */}
              <button
                type="button"
                onClick={() =>
                  handleFiltersChange({
                    category: "All",
                    subCategory: "All",
                    tags: [],
                    tools: [],
                    medium: "All",
                    sortBy: "newest",
                  })
                }
                className="text-xs text-neutral-900 dark:text-white hover:underline ml-auto font-bold cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROJECTS GRID DISPLAY                                                     */}
        {/* ========================================================================= */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-12 text-center my-8 shadow-xs min-h-[400px] flex flex-col items-center justify-center">
            <p className={cn(bricolage.className, "text-xl font-bold text-neutral-950 dark:text-white")}>
              No matching projects found
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
              Try adjusting your search keywords, clearing tags, or switching to &ldquo;All Categories&rdquo;.
            </p>
            <Button
              type="button"
              variant="accent"
              onClick={() => {
                handleSearchChange("");
                handleFiltersChange({
                  category: "All",
                  subCategory: "All",
                  tags: [],
                  tools: [],
                  medium: "All",
                  sortBy: "newest",
                });
              }}
              className="mt-5 rounded-full px-6 text-xs font-bold"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px]">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </FadeIn>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        mode="projects"
        projectFilters={filters}
        onProjectFiltersChange={handleFiltersChange}
      />
    </div>
  );
}
