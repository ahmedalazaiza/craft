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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#8DFF00]" />
              <span>Project Showcase</span>
              <span className="text-[var(--content-tertiary)]">•</span>
              <span className="font-normal text-[var(--chip-fg)]">Design Case Studies</span>
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
              Discover standout UI designs, brand identities, typography, and creative projects published worldwide.
            </p>
          </div>

          {/* Right-aligned Showcase Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2.5 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] px-4 py-2.5 shadow-xs">
              <FolderKanban className="h-4 w-4 text-[var(--primary-forest-green)]" />
              <div className="text-left">
                <span className="block text-xs font-bold text-[var(--content-primary)]">
                  {publishedProjects.length} Projects
                </span>
                <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                  {distinctCategoriesCount} Categories
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
          <div className="space-y-3 pb-3 border-b border-[var(--border-neutral)]">
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
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                      : "bg-[var(--bg-neutral)]/70 text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
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

            {/* Dynamic Sub-Category Pill Strip (When Category Selected) */}
            {availableSubCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 pt-1 no-scrollbar border-t border-[var(--border-neutral)]/50">
                <span className="text-[11px] font-mono text-[var(--content-tertiary)] font-bold uppercase tracking-wider shrink-0 mr-1">
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
                          ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] font-bold border-transparent"
                          : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                      )}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE FILTERS PILL BAR (If any active)                                   */}
        {/* ========================================================================= */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
            <span className="text-xs font-semibold text-[var(--content-secondary)] mr-1">
              Active filters:
            </span>

            {/* Category Filter */}
            {filters.category && filters.category !== "All" && (
              <span className="inline-flex items-center gap-1 bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <span>Category: {activeTaxonomy?.shortName || filters.category}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ ...filters, category: "All", subCategory: "All" })
                  }
                  className="hover:text-[var(--negative)] ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Sub-Category Filter */}
            {filters.subCategory && filters.subCategory !== "All" && (
              <span className="inline-flex items-center gap-1 bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                <span>Sub: {filters.subCategory}</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, subCategory: "All" })}
                  className="hover:text-red-300 ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Medium Filter */}
            {filters.medium && filters.medium !== "All" && (
              <span className="inline-flex items-center gap-1 bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-1 rounded-full text-xs font-semibold">
                <span>Format: {filters.medium}</span>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, medium: "All" })}
                  className="hover:text-[var(--negative)] ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Tags Filters */}
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-[var(--bg-elevated)] text-[var(--content-primary)] border border-[var(--border-neutral)] px-2.5 py-1 rounded-full text-xs font-semibold"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-[var(--negative)] ml-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {/* Tools Filters */}
            {(filters.tools || []).map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 bg-[var(--accent)] text-[#090C09] px-2.5 py-1 rounded-full text-xs font-bold"
              >
                <span>{tool}</span>
                <button
                  type="button"
                  onClick={() => removeTool(tool)}
                  className="hover:text-red-700 ml-0.5 cursor-pointer"
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
              className="text-xs text-[var(--content-link)] hover:underline ml-auto font-semibold cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROJECTS GRID DISPLAY                                                     */}
        {/* ========================================================================= */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 text-center my-8">
            <p className="type-title-subsection text-[var(--content-primary)] font-bold text-lg">
              No matching projects found
            </p>
            <p className="type-body-default text-[var(--content-secondary)] mt-2 max-w-md mx-auto text-sm">
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
              className="mt-5 inline-flex items-center gap-2 rounded-full font-bold bg-[var(--accent)] text-[#090C09] hover:bg-[var(--accent-hover)] px-5 py-2 text-xs shadow-xs transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
