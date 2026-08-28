"use client";

import React from "react";
import { ProjectCategory, ProjectMedium } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge, FilterChip } from "@/components/ui/badge";
import { SlidersHorizontal, X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectFilters {
  category?: ProjectCategory | "All";
  tags: string[];
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

const CATEGORIES: (ProjectCategory | "All")[] = [
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

const MEDIUMS: (ProjectMedium | "All")[] = [
  "All",
  "Image",
  "Video",
  "PDF/Case study",
  "Prototype",
  "3D",
];

const ALL_TAGS = [
  "Typography",
  "Architecture",
  "Systems",
  "Interaction",
  "Design Engineering",
  "Minimalism",
  "Print",
  "CGI",
  "Generative",
  "Tokens",
  "Hardware",
  "Audio",
  "Spatial Design",
  "Timber",
];

const DISCIPLINES = [
  "All",
  "Brand Systems",
  "Typography",
  "UI Systems",
  "Photography",
  "Editorial",
  "Industrial Design",
  "Architecture",
  "Creative Code",
];

const CITIES = [
  "All",
  "Berlin",
  "Tokyo",
  "London",
  "Zurich",
  "New York",
  "Stockholm",
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
  if (!isOpen) return null;

  const handleToggleTag = (tag: string) => {
    if (!projectFilters || !onProjectFiltersChange) return;
    const exists = projectFilters.tags.includes(tag);
    const newTags = exists
      ? projectFilters.tags.filter((t) => t !== tag)
      : [...projectFilters.tags, tag];
    onProjectFiltersChange({ ...projectFilters, tags: newTags });
  };

  const handleResetProjects = () => {
    if (!onProjectFiltersChange) return;
    onProjectFiltersChange({
      category: "All",
      tags: [],
      medium: "All",
      sortBy: "newest",
    });
  };

  const handleResetCreators = () => {
    if (!onCreatorFiltersChange) return;
    onCreatorFiltersChange({
      discipline: "All",
      city: "All",
      hasPublishedOnly: false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end bg-[var(--base-dark)]/50 backdrop-blur-xs transition-opacity p-0"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] sm:max-h-full h-auto sm:h-full w-full max-w-md flex-col rounded-t-[28px] sm:rounded-none bg-[var(--bg-screen)] border-t sm:border-t-0 sm:border-l border-[var(--border-neutral)] shadow-2xl p-5 sm:p-8 overflow-y-auto pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1 rounded-full bg-[var(--border-neutral)] mx-auto mb-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-[var(--border-neutral)] shrink-0">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-[var(--primary-forest-green)]" />
            <h2 className="type-title-subsection text-[var(--content-primary)]">
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
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5">
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

              {/* Primary Category */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5">
                  Primary Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <FilterChip
                      key={cat}
                      active={projectFilters.category === cat}
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          category: cat,
                        })
                      }
                    >
                      {cat}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Medium / Artifact Format */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5">
                  Medium / Artifact Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIUMS.map((med) => (
                    <FilterChip
                      key={med}
                      active={projectFilters.medium === med}
                      onClick={() =>
                        onProjectFiltersChange({
                          ...projectFilters,
                          medium: med,
                        })
                      }
                    >
                      {med}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Secondary Tags Multi-select */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
                  Disciplines & Tags (Multi-select)
                </label>
                <p className="type-label text-[var(--content-tertiary)] mb-2.5">
                  Filter by specific techniques and materials.
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                  {ALL_TAGS.map((tag) => {
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
            </>
          ) : mode === "creators" && creatorFilters && onCreatorFiltersChange ? (
            <>
              {/* Creator Discipline */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5">
                  Discipline / Focus
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DISCIPLINES.map((disc) => (
                    <FilterChip
                      key={disc}
                      active={creatorFilters.discipline === disc}
                      onClick={() =>
                        onCreatorFiltersChange({
                          ...creatorFilters,
                          discipline: disc,
                        })
                      }
                    >
                      {disc}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Creator City */}
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-2.5">
                  City / Region
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CITIES.map((c) => (
                    <FilterChip
                      key={c}
                      active={creatorFilters.city === c}
                      onClick={() =>
                        onCreatorFiltersChange({
                          ...creatorFilters,
                          city: c,
                        })
                      }
                    >
                      {c}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Has published work toggle */}
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
                    className="h-4 w-4 rounded accent-[var(--btn-cta-bg)]"
                  />
                  <span className="type-body-default font-medium text-[var(--content-primary)]">
                    Only show creators with published monographs
                  </span>
                </label>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[var(--border-neutral)] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={mode === "projects" ? handleResetProjects : handleResetCreators}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All</span>
          </Button>

          <Button type="button" variant="accent" size="default" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
