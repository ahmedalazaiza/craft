"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project, Creator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowRight, User, FolderKanban, X } from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  initialQuery?: string;
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onOpenFilter?: () => void;
  hasActiveFilters?: boolean;
  filterCount?: number;
  compact?: boolean;
  className?: string;
  showFilterButton?: boolean;
  autoFocus?: boolean;
}

export function SearchField({
  initialQuery = "",
  placeholder = "Search projects, creators, tools, or tags...",
  onSearchChange,
  onOpenFilter,
  hasActiveFilters = false,
  filterCount = 0,
  compact = false,
  className,
  showFilterButton = true,
  autoFocus = false,
}: SearchFieldProps) {
  const router = useRouter();
  const { projects, creators } = useSession();

  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions (max 6 total: up to 3 projects, up to 3 creators)
  const trimmed = query.trim().toLowerCase();

  const matchedProjects: Project[] = trimmed
    ? projects
        .filter((p) => p.published)
        .filter(
          (p) =>
            p.title.toLowerCase().includes(trimmed) ||
            p.summary.toLowerCase().includes(trimmed) ||
            p.tags.some((t) => t.toLowerCase().includes(trimmed)) ||
            p.tools.some((t) => t.toLowerCase().includes(trimmed))
        )
        .slice(0, 3)
    : [];

  const matchedCreators: Creator[] = trimmed
    ? creators
        .filter(
          (u) =>
            u.displayName.toLowerCase().includes(trimmed) ||
            u.username.toLowerCase().includes(trimmed) ||
            u.city.toLowerCase().includes(trimmed) ||
            u.skills.some((s) => s.toLowerCase().includes(trimmed))
        )
        .slice(0, 3)
    : [];


  const flatSuggestions = [
    ...matchedProjects.map((p) => ({ type: "project" as const, item: p })),
    ...matchedCreators.map((c) => ({ type: "creator" as const, item: c })),
  ];

  const totalSuggestions = flatSuggestions.length;

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Click outside to close autosuggest
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex((prev) =>
        prev < totalSuggestions - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : totalSuggestions - 1
      );
    } else if (e.key === "Enter") {
      if (isOpen && selectedIndex >= 0 && selectedIndex < totalSuggestions) {
        e.preventDefault();
        const selected = flatSuggestions[selectedIndex];
        setIsOpen(false);
        if (selected.type === "project") {
          router.push(`/project/${selected.item.slug}`);
        } else {
          router.push(`/u/${selected.item.username}`);
        }
      } else {
        handleSearchSubmit(e);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          "flex items-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] transition-all shadow-xs",
          isOpen && "ring-2 ring-[var(--btn-cta-bg)] border-[var(--btn-cta-bg)]",
          compact ? "h-10 pl-4 pr-1.5" : "h-12 pl-4 pr-1.5"
        )}
      >
        <Search className="h-4 w-4 text-[var(--content-tertiary)] shrink-0 mr-2.5" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            onSearchChange?.(val);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (trimmed) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent text-base md:text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden appearance-none"
        />

        {/* Clear Button — positioned immediately after text input */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              onSearchChange?.("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="shrink-0 ml-1 rounded-full p-1 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] cursor-pointer transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Action buttons group — separated from input area */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Filter Button */}
          {showFilterButton && onOpenFilter && (
            <button
              type="button"
              onClick={onOpenFilter}
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                hasActiveFilters
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
                  : "bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)]"
              )}
              title="Open filter panel"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filter</span>
              {filterCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#962EE6] px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
                  {filterCount}
                </span>
              )}
            </button>
          )}

          {/* Search Submit Action Button */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className={cn("shrink-0 text-xs font-semibold transition-all shadow-xs", compact ? "h-7 px-3.5" : "h-8 px-4")}
          >
            <span>Search</span>
          </Button>
        </div>
      </form>

      {/* Autosuggest / Autocomplete Dropdown */}
      {isOpen && trimmed && totalSuggestions > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[380px] overflow-y-auto rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 shadow-xl">
          {/* Projects Group */}
          {matchedProjects.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider">
                <FolderKanban className="h-3.5 w-3.5 text-[var(--primary-forest-green)]" />
                <span>Projects</span>
              </div>
              <div className="space-y-1">
                {matchedProjects.map((project, idx) => {
                  const itemIndex = idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <Link
                      key={project.id}
                      href={`/project/${project.slug}`}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[12px] p-2.5 transition-colors",
                        isSelected
                          ? "bg-[var(--bg-neutral-hover)]"
                          : "hover:bg-[var(--bg-neutral)]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-12 rounded-[8px] overflow-hidden bg-[var(--bg-neutral)] shrink-0">
                          <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="type-title-group text-[var(--content-primary)] truncate">
                            {project.title}
                          </div>
                          <div className="type-label text-[var(--content-tertiary)] truncate">
                            by {project.creator.displayName} • {project.category}
                          </div>
                        </div>
                      </div>
                      <Badge variant="accent" size="sm" className="shrink-0">
                        {project.category}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Creators Group */}
          {matchedCreators.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider border-t border-[var(--border-neutral)] pt-2.5">
                <User className="h-3.5 w-3.5 text-[var(--primary-forest-green)]" />
                <span>Creators</span>
              </div>
              <div className="space-y-1">
                {matchedCreators.map((creator, idx) => {
                  const itemIndex = matchedProjects.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <Link
                      key={creator.id}
                      href={`/u/${creator.username}`}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[12px] p-2.5 transition-colors",
                        isSelected
                          ? "bg-[var(--bg-neutral-hover)]"
                          : "hover:bg-[var(--bg-neutral)]"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[var(--bg-neutral)] shrink-0 ring-1 ring-[var(--border-neutral)]">
                          <Image
                            src={getValidAvatarUrl(creator.avatarUrl)}
                            alt={creator.displayName}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="type-title-group text-[var(--content-primary)] truncate">
                            {creator.displayName}
                          </div>
                          <div className="type-label text-[var(--content-tertiary)] truncate">
                            @{creator.username} • {creator.city || creator.location}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Search Option */}
          <div className="mt-2 pt-2 border-t border-[var(--border-neutral)]">
            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-xs font-semibold text-[var(--content-link)] hover:bg-[var(--bg-neutral)] cursor-pointer"
            >
              <span>See all results for &ldquo;{query}&rdquo;</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
