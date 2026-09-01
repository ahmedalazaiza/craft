"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCategory, ProjectMedium } from "@/lib/types";
import {
  MASTER_TAXONOMY,
  ALL_TAGS,
  ALL_TOOLS,
  ALL_SUB_CATEGORIES,
  getCategoryTaxonomy,
  getTagsForCategory,
  getToolsForCategory,
  getSubCategoriesForCategory,
} from "@/lib/taxonomy";
import { POPULAR_CITIES } from "@/lib/location";
import { Button } from "@/components/ui/button";
import { Badge, FilterChip } from "@/components/ui/badge";
import { SlidersHorizontal, X, RotateCcw, Check, Wrench, Tag, Layers, Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectFilters {
  category?: ProjectCategory | "All";
  subCategory?: string | "All";
  tags: string[];
  tools?: string[];
  medium?: ProjectMedium | "All";
  sortBy: "newest" | "appreciated";
}

export interface CreatorFilters {
  discipline?: string | "All";
  city?: string | "All";
  hasPublishedOnly: boolean;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "projects" | "creators";
  projectFilters?: ProjectFilters;
  onProjectFiltersChange?: (filters: ProjectFilters) => void;
  creatorFilters?: CreatorFilters;
  onCreatorFiltersChange?: (filters: CreatorFilters) => void;
}

const MEDIUMS: (ProjectMedium | "All")[] = [
  "All",
  "Image",
  "Video",
  "PDF/Case study",
  "Prototype",
  "3D",
];

const CITIES = [
  "All",
  "Berlin",
  "Tokyo",
  "London",
  "Zurich",
  "New York",
  "Stockholm",
  "San Francisco",
  "Paris",
];

export function FilterDrawer({
  isOpen,
  onClose,
  mode = "projects",
  projectFilters,
  onProjectFiltersChange,
  creatorFilters,
  onCreatorFiltersChange,
}: FilterDrawerProps) {
  const [locationQuery, setLocationQuery] = useState("");

  const availableCities = useMemo(() => {
    const baseCities = POPULAR_CITIES.filter((c) => c !== "Worldwide");
    if (!locationQuery.trim()) {
      return [
        "All",
        "Berlin, Germany",
        "Tokyo, Japan",
        "London, United Kingdom",
        "New York, USA",
        "San Francisco, USA",
        "Paris, France",
        "Amsterdam, Netherlands",
        "Zurich, Switzerland",
        "Stockholm, Sweden",
        "Dubai, UAE",
        "Riyadh, Saudi Arabia",
        "Cairo, Egypt",
        "Gaza, Palestine",
        "Amman, Jordan",
        "Toronto, Canada",
      ];
    }
    const q = locationQuery.toLowerCase().trim();
    return baseCities.filter((city) => city.toLowerCase().includes(q));
  }, [locationQuery]);

  const currentCategoryTaxonomy = useMemo(() => {
    if (!projectFilters?.category || projectFilters.category === "All") return null;
    return getCategoryTaxonomy(projectFilters.category);
  }, [projectFilters?.category]);

  const availableSubCategories = useMemo(() => {
    if (currentCategoryTaxonomy) {
      return ["All", ...currentCategoryTaxonomy.subCategories];
    }
    return ["All", ...ALL_SUB_CATEGORIES.slice(0, 18)];
  }, [currentCategoryTaxonomy]);

  const availableTags = useMemo(() => {
    if (currentCategoryTaxonomy) {
      return currentCategoryTaxonomy.tags;
    }
    return ALL_TAGS.slice(0, 30);
  }, [currentCategoryTaxonomy]);

  const availableTools = useMemo(() => {
    if (currentCategoryTaxonomy) {
      return currentCategoryTaxonomy.tools;
    }
    return ALL_TOOLS.slice(0, 24);
  }, [currentCategoryTaxonomy]);

  const handleToggleTag = (tag: string) => {
    if (!projectFilters || !onProjectFiltersChange) return;
    const exists = projectFilters.tags.includes(tag);
    const newTags = exists
      ? projectFilters.tags.filter((t) => t !== tag)
      : [...projectFilters.tags, tag];
    onProjectFiltersChange({ ...projectFilters, tags: newTags });
  };

  const handleToggleTool = (tool: string) => {
    if (!projectFilters || !onProjectFiltersChange) return;
    const currentTools = projectFilters.tools || [];
    const exists = currentTools.includes(tool);
    const newTools = exists
      ? currentTools.filter((t) => t !== tool)
      : [...currentTools, tool];
    onProjectFiltersChange({ ...projectFilters, tools: newTools });
  };

  const handleResetProjects = () => {
    if (!onProjectFiltersChange) return;
    onProjectFiltersChange({
      category: "All",
      subCategory: "All",
      tags: [],
      tools: [],
      medium: "All",
      sortBy: "newest",
    });
  };

  const handleResetCreators = () => {
    if (!onCreatorFiltersChange) return;
    setLocationQuery("");
    onCreatorFiltersChange({
      discipline: "All",
      city: "All",
      hasPublishedOnly: false,
    });
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll while filter drawer is open to prevent page layout jumps
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-stretch justify-center sm:justify-end bg-[var(--base-dark)]/50 backdrop-blur-xs p-0"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%", x: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[90vh] sm:max-h-full h-auto sm:h-full w-full max-w-lg flex-col rounded-t-[28px] sm:rounded-none bg-[var(--bg-screen)] border-t sm:border-t-0 sm:border-l border-[var(--border-neutral)] shadow-2xl p-5 sm:p-8 overflow-y-auto pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 rounded-full bg-[var(--border-neutral)] mx-auto mb-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[var(--border-neutral)] shrink-0">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-[var(--primary-forest-green)]" />
            <h2 className="type-title-subsection text-[var(--content-primary)] font-bold text-base sm:text-lg">
              {mode === "projects" ? "Filter Projects" : "Filter Creators"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="flex-1 py-6 space-y-7">
          {mode === "projects" && projectFilters && onProjectFiltersChange ? (
            <>
              {/* Sort Order */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5 text-xs uppercase tracking-wider font-mono">
                  Sort Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onProjectFiltersChange({ ...projectFilters, sortBy: "newest" })
                    }
                    className={cn(
                      "flex h-10 items-center justify-center rounded-[12px] text-xs font-semibold border transition-all cursor-pointer",
                      projectFilters.sortBy === "newest"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                        : "bg-[var(--bg-screen)] text-[var(--content-primary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                    )}
                  >
                    Newest First
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onProjectFiltersChange({
                        ...projectFilters,
                        sortBy: "appreciated",
                      })
                    }
                    className={cn(
                      "flex h-10 items-center justify-center rounded-[12px] text-xs font-semibold border transition-all cursor-pointer",
                      projectFilters.sortBy === "appreciated"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                        : "bg-[var(--bg-screen)] text-[var(--content-primary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                    )}
                  >
                    Most Appreciated
                  </button>
                </div>
              </div>

              {/* Primary Category (13 Master Categories) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="type-body-default-bold text-[var(--content-primary)] block text-xs uppercase tracking-wider font-mono">
                    Category ({MASTER_TAXONOMY.length})
                  </label>
                  {projectFilters.category && projectFilters.category !== "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          category: "All",
                          subCategory: "All",
                        })
                      }
                      className="text-[11px] text-[var(--content-link)] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  <FilterChip
                    active={!projectFilters.category || projectFilters.category === "All"}
                    onClick={() =>
                      onProjectFiltersChange({
                        ...projectFilters,
                        category: "All",
                        subCategory: "All",
                      })
                    }
                  >
                    All Categories
                  </FilterChip>
                  {MASTER_TAXONOMY.map((cat) => {
                    const isSelected =
                      projectFilters.category === cat.name ||
                      projectFilters.category === cat.shortName;
                    return (
                      <FilterChip
                        key={cat.id}
                        active={isSelected}
                        onClick={() =>
                          onProjectFiltersChange({
                            ...projectFilters,
                            category: cat.name,
                            subCategory: "All",
                          })
                        }
                      >
                        {cat.name}
                      </FilterChip>
                    );
                  })}
                </div>
              </div>

              {/* Sub-Categories */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="type-body-default-bold text-[var(--content-primary)] block text-xs uppercase tracking-wider font-mono">
                    Sub-Category
                  </label>
                  {projectFilters.subCategory && projectFilters.subCategory !== "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          subCategory: "All",
                        })
                      }
                      className="text-[11px] text-[var(--content-link)] hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {availableSubCategories.map((sub) => (
                    <FilterChip
                      key={sub}
                      active={
                        (!projectFilters.subCategory && sub === "All") ||
                        projectFilters.subCategory === sub
                      }
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          subCategory: sub,
                        })
                      }
                    >
                      {sub}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Secondary Tags Multi-select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="type-body-default-bold text-[var(--content-primary)] block text-xs uppercase tracking-wider font-mono">
                    Tags ({projectFilters.tags.length} selected)
                  </label>
                  {projectFilters.tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          tags: [],
                        })
                      }
                      className="text-[11px] text-[var(--content-link)] hover:underline"
                    >
                      Clear ({projectFilters.tags.length})
                    </button>
                  )}
                </div>
                <p className="type-label text-[var(--content-tertiary)] mb-2.5 text-xs">
                  Filter by design principles, styles, and methodologies.
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  {availableTags.map((tag) => {
                    const isSelected = projectFilters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] ring-1 ring-[var(--chip-bg)]"
                            : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral-hover)]"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[var(--chip-fg)]" />}
                        <span>#{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Software Multi-select */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="type-body-default-bold text-[var(--content-primary)] block text-xs uppercase tracking-wider font-mono">
                    Tools & Stack ({projectFilters.tools?.length || 0} selected)
                  </label>
                  {projectFilters.tools && projectFilters.tools.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          tools: [],
                        })
                      }
                      className="text-[11px] text-[var(--content-link)] hover:underline"
                    >
                      Clear ({projectFilters.tools.length})
                    </button>
                  )}
                </div>
                <p className="type-label text-[var(--content-tertiary)] mb-2.5 text-xs">
                  Filter by creative software and production engines.
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {availableTools.map((tool) => {
                    const isSelected = (projectFilters.tools || []).includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => handleToggleTool(tool)}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#962EE6] text-white ring-1 ring-[#962EE6] font-bold"
                            : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral-hover)]"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                        <span>{tool}</span>
                      </button>
                    );
                  })}
                </div>
              </div>


            </>
          ) : mode === "creators" && creatorFilters && onCreatorFiltersChange ? (
            <>
              {/* Creator Discipline */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5 text-xs uppercase tracking-wider font-mono">
                  Discipline / Specialization
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1">
                  <FilterChip
                    active={!creatorFilters.discipline || creatorFilters.discipline === "All"}
                    onClick={() =>
                      onCreatorFiltersChange({
                        ...creatorFilters,
                        discipline: "All",
                      })
                    }
                  >
                    All Disciplines
                  </FilterChip>
                  {MASTER_TAXONOMY.map((cat) => (
                    <FilterChip
                      key={cat.id}
                      active={creatorFilters.discipline === cat.name || creatorFilters.discipline === cat.shortName}
                      onClick={() =>
                        onCreatorFiltersChange({
                          ...creatorFilters,
                          discipline: cat.name,
                        })
                      }
                    >
                      {cat.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Location Filter with Auto-Suggest / Search */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="type-body-default-bold text-[var(--content-primary)] block text-xs uppercase tracking-wider font-mono">
                    Location
                  </label>
                  {creatorFilters.city && creatorFilters.city !== "All" && (
                    <button
                      type="button"
                      onClick={() =>
                        onCreatorFiltersChange({
                          ...creatorFilters,
                          city: "All",
                        })
                      }
                      className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline cursor-pointer"
                    >
                      Reset ({creatorFilters.city})
                    </button>
                  )}
                </div>

                {/* Auto-suggest Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search city or country (e.g. Tokyo, Berlin, London)..."
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 pl-9 pr-8 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-900 dark:focus:border-white focus:outline-hidden transition-all"
                  />
                  {locationQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Dynamic Auto-suggest / Auto-layout Location Pills */}
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar pt-1">
                  {/* Custom typed location fallback if not in list */}
                  {locationQuery.trim() &&
                    !availableCities.some(
                      (c) => c.toLowerCase() === locationQuery.trim().toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          onCreatorFiltersChange({
                            ...creatorFilters,
                            city: locationQuery.trim(),
                          });
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
                          creatorFilters.city?.toLowerCase() === locationQuery.trim().toLowerCase()
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        )}
                      >
                        <MapPin className="h-3 w-3 text-neutral-900 dark:text-white" />
                        <span>Filter by &ldquo;{locationQuery.trim()}&rdquo;</span>
                      </button>
                    )}

                  {/* Render location options */}
                  {availableCities.map((city) => {
                    const isSelected =
                      (city === "All" && (!creatorFilters.city || creatorFilters.city === "All")) ||
                      creatorFilters.city === city ||
                      (city !== "All" && creatorFilters.city && (
                        city.toLowerCase().includes(creatorFilters.city.toLowerCase()) ||
                        creatorFilters.city.toLowerCase().includes(city.toLowerCase())
                      ));

                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          onCreatorFiltersChange({
                            ...creatorFilters,
                            city: city,
                          });
                        }}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-all shrink-0 cursor-pointer select-none",
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-xs"
                            : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium"
                        )}
                      >
                        {city !== "All" && <MapPin className="h-2.5 w-2.5 opacity-60" />}
                        <span>{city}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Published Projects Only */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={creatorFilters.hasPublishedOnly}
                    onChange={(e) =>
                      onCreatorFiltersChange({
                        ...creatorFilters,
                        hasPublishedOnly: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded-[4px] border-[var(--border-neutral)] text-[var(--primary-forest-green)] focus:ring-[var(--primary-forest-green)] accent-[var(--primary-forest-green)]"
                  />
                  <span className="type-body-default text-[var(--content-primary)] font-medium text-xs sm:text-sm">
                    Only show creators with published work
                  </span>
                </label>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-5 border-t border-[var(--border-neutral)] shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={mode === "projects" ? handleResetProjects : handleResetCreators}
            className="flex-1 gap-2 font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            type="button"
            variant="accent"
            size="default"
            onClick={onClose}
            className="flex-1 font-bold shadow-xs"
          >
            <span>Apply Filters</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>,
document.body
);
}
