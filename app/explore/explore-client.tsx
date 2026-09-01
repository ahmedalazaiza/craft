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
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProjectCategory, Project } from "@/lib/types";
import {
  MASTER_TAXONOMY,
  normalizeCategory,
  getCategoryTaxonomy,
  getSubCategoriesForCategory,
} from "@/lib/taxonomy";
import {
  FolderKanban,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  X,
} from "lucide-react";
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
    sortBy: "newest",
  });

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Dynamic Sub-categories based on selected Category
  const activeTaxonomy = useMemo(() => {
    if (!filters.category || filters.category === "All") return null;
    return getCategoryTaxonomy(filters.category);
  }, [filters.category]);

  const availableSubCategories = useMemo(() => {
    if (activeTaxonomy) {
      return ["All", ...activeTaxonomy.subCategories];
    }
    return [];
  }, [activeTaxonomy]);

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
      .sort((a, b) => {
        if (filters.sortBy === "appreciated") {
          return b.appreciations - a.appreciations;
        }
        // default newest
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [publishedProjects, searchQuery, filters]);

  // Distinct categories count
  const distinctCategoriesCount = useMemo(() => {
    return new Set(publishedProjects.map((p) => normalizeCategory(p.category))).size;
  }, [publishedProjects]);

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
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const removeTool = (toolToRemove: string) => {
    setFilters((prev) => ({
      ...prev,
      tools: (prev.tools || []).filter((t) => t !== toolToRemove),
    }));
  };

  // Guard skeleton: Only show skeleton during cold empty fetch
  if (isLoadingDb && projects.length === 0) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
          <div className="space-y-3">
            <div className="h-6 w-32 rounded-full bg-[var(--bg-neutral)]" />
            <div className="h-10 w-64 rounded-2xl bg-[var(--bg-neutral)]" />
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-neutral-900 dark:text-white" />
              <span>Project Showcase</span>
              <span className="text-neutral-400 dark:text-neutral-500">•</span>
              <span className="font-normal text-neutral-500 dark:text-neutral-400">Design Case Studies</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[44px] font-black text-neutral-950 dark:text-white leading-tight tracking-tight"
              )}
            >
              Explore Projects
            </h1>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
              Discover standout UI designs, brand identities, typography, and creative projects published worldwide.
            </p>
          </div>

          {/* Right-aligned Showcase Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white dark:bg-[#141713] border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 shadow-xs">
              <FolderKanban className="h-4 w-4 text-neutral-900 dark:text-white" />
              <div className="text-left">
                <span className="block text-xs font-bold text-neutral-950 dark:text-white">
                  {publishedProjects.length} Projects
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-mono">
                  {distinctCategoriesCount} Categories
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl bg-white dark:bg-[#141713] border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 shadow-xs">
              <Layers className="h-4 w-4 text-neutral-900 dark:text-white" />
              <div className="text-left">
                <span className="block text-xs font-bold text-neutral-950 dark:text-white">
                  100% Intrinsic
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-mono">
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
          <div className="space-y-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Scrollable Quick Category Pills (13 Categories) */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ ...filters, category: "All", subCategory: "All" })
                  }
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs transition-all shrink-0 cursor-pointer font-semibold select-none",
                    !filters.category || filters.category === "All"
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs font-bold"
                      : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  )}
                >
                  All
                </button>
                {MASTER_TAXONOMY.map((cat) => {
                  const isSelected =
                    filters.category === cat.name || filters.category === cat.shortName;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFilters({
                          ...filters,
                          category: cat.name,
                          subCategory: "All",
                        })
                      }
                      className={cn(
                        "rounded-full px-3.5 py-1.5 text-xs transition-all shrink-0 cursor-pointer select-none",
                        isSelected
                          ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs"
                          : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium"
                      )}
                      title={cat.name}
                    >
                      {cat.shortName}
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
                  title="Change sorting order"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                  <span>
                    {filters.sortBy === "appreciated"
                      ? "Most Appreciated"
                      : "Newest First"}
                  </span>
                </button>
              </div>
            </div>

            {/* Dynamic Sub-Category Pill Strip (When Category Selected) */}
            <AnimatePresence initial={false}>
              {availableSubCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 pt-1.5 no-scrollbar border-t border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider shrink-0 mr-1">
                      Focus:
                    </span>
                    {availableSubCategories.map((sub) => {
                      const isSelected =
                        (!filters.subCategory && sub === "All") ||
                        filters.subCategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setFilters({ ...filters, subCategory: sub })}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs transition-all shrink-0 cursor-pointer font-medium select-none border",
                            isSelected
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold border-transparent shadow-xs"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          )}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        <AnimatePresence initial={false}>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "1.5rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
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
                        setFilters({ ...filters, category: "All", subCategory: "All" })
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
                      onClick={() => setFilters({ ...filters, subCategory: "All" })}
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
                      onClick={() => setFilters({ ...filters, medium: "All" })}
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
                    setFilters({
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
            </motion.div>
          )}
        </AnimatePresence>

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
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  category: "All",
                  subCategory: "All",
                  tags: [],
                  tools: [],
                  medium: "All",
                  sortBy: "newest",
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full font-bold bg-[#962EE6] text-white hover:bg-[#5F0EBA] px-6 py-2.5 text-xs shadow-xs transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[500px]">
            {filteredProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
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
        onProjectFiltersChange={setFilters}
      />
    </div>
  );
}
