"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { Project, Creator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Search,
  ArrowRight,
  User,
  FolderKanban,
  X,
  Heart,
  CornerDownLeft,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { sortProjects, computeCreatorRank } from "@/lib/ranking";
import { cn } from "@/lib/utils";

interface HeroSearchProps {
  className?: string;
}

export function HeroSearch({ className }: HeroSearchProps) {
  const router = useRouter();
  const { projects, creators } = useSession();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions only when user has typed text
  const trimmed = query.trim().toLowerCase();

  const matchedProjects: Project[] = trimmed
    ? sortProjects(
        projects.filter(
          (p) =>
            p.published &&
            (p.title.toLowerCase().includes(trimmed) ||
              p.summary.toLowerCase().includes(trimmed) ||
              p.creator.displayName.toLowerCase().includes(trimmed) ||
              p.creator.username.toLowerCase().includes(trimmed) ||
              (p.category && p.category.toLowerCase().includes(trimmed)) ||
              (p.categories &&
                p.categories.some((c) => c.toLowerCase().includes(trimmed))) ||
              p.tags.some((t) => t.toLowerCase().includes(trimmed)) ||
              p.tools.some((t) => t.toLowerCase().includes(trimmed)))
        ),
        "curated"
      ).slice(0, 4)
    : [];

  const matchedCreators: Creator[] = trimmed
    ? creators
        .filter(
          (u) =>
            u.displayName.toLowerCase().includes(trimmed) ||
            u.username.toLowerCase().includes(trimmed) ||
            (u.city && u.city.toLowerCase().includes(trimmed)) ||
            (u.bio && u.bio.toLowerCase().includes(trimmed)) ||
            u.skills.some((s) => s.toLowerCase().includes(trimmed))
        )
        .sort((a, b) => {
          const aProjects = projects.filter(
            (p) =>
              p.creator &&
              (p.creator.id === a.id ||
                p.creator.username.toLowerCase() === a.username.toLowerCase()) &&
              p.published
          );
          const bProjects = projects.filter(
            (p) =>
              p.creator &&
              (p.creator.id === b.id ||
                p.creator.username.toLowerCase() === b.username.toLowerCase()) &&
              p.published
          );
          return (
            computeCreatorRank(b, bProjects, trimmed) -
            computeCreatorRank(a, aProjects, trimmed)
          );
        })
        .slice(0, 4)
    : [];

  const flatSuggestions = [
    ...matchedProjects.map((p) => ({ type: "project" as const, item: p })),
    ...matchedCreators.map((c) => ({ type: "creator" as const, item: c })),
  ];

  const totalSuggestions = flatSuggestions.length;

  // Handle click outside to close dropdown
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          if (trimmed) setIsOpen(true);
          return;
        }
        if (totalSuggestions === 0) return;
        setSelectedIndex((prev) =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          if (trimmed) setIsOpen(true);
          return;
        }
        if (totalSuggestions === 0) return;
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
        } else if (query.trim()) {
          e.preventDefault();
          setIsOpen(false);
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    },
    [isOpen, trimmed, totalSuggestions, selectedIndex, flatSuggestions, query, router]
  );

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full max-w-2xl mx-auto z-50", className)}>
      {/* Expanded Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className={cn(
          "relative flex items-center h-13 sm:h-14 pl-4 sm:pl-5 pr-1.5 sm:pr-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/95 backdrop-blur-md transition-all duration-200 shadow-md group",
          isOpen && trimmed
            ? "border-[var(--brand-secondary)] ring-3 ring-[var(--brand-secondary)]/20 shadow-lg"
            : "hover:border-[var(--content-secondary)] hover:shadow-lg"
        )}
      >
        <Search className="h-5 w-5 text-[var(--brand-secondary)] shrink-0 mr-3" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => {
            // Only open suggestions if user already typed text
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            // Open ONLY when there is typed text, close immediately if cleared
            if (val.trim().length > 0) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search projects, creators, tools, or skills..."
          className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none appearance-none pr-2"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="h-7 w-7 rounded-full bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center justify-center cursor-pointer transition-colors shrink-0 mr-2"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Submit Action Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-bold shrink-0 rounded-full shadow-xs gap-1.5 cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </form>

      {/* Live Autosuggest / Autocomplete Dropdown — ONLY rendered when user has typed text */}
      <AnimatePresence>
        {isOpen && trimmed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-2.5 rounded-[24px] sm:rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden z-[100] text-left backdrop-blur-2xl"
          >
            <div className="max-h-[340px] sm:max-h-[380px] overflow-y-auto p-3.5 sm:p-4 space-y-4 custom-scrollbar">
              {/* STATE 1: RESULTS FOUND FOR QUERY */}
              {totalSuggestions > 0 ? (
                <div className="space-y-5">
                  {/* Matched Projects */}
                  {matchedProjects.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                        <FolderKanban className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                        <span>Projects</span>
                      </div>

                      <div className="space-y-1">
                        {matchedProjects.map((project, idx) => {
                          const isSelected = selectedIndex === idx;
                          return (
                            <Link
                              key={project.id}
                              href={`/project/${project.slug}`}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 cursor-pointer group",
                                isSelected
                                  ? "border-[var(--content-primary)] bg-[var(--bg-neutral)]"
                                  : "border-transparent hover:border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                              )}
                            >
                              <div className="relative h-11 w-14 sm:h-12 sm:w-16 rounded-xl overflow-hidden bg-[var(--bg-neutral)] shrink-0 border border-[var(--border-neutral)]">
                                {project.coverImage ? (
                                  <Image
                                    src={project.coverImage}
                                    alt={project.title}
                                    fill
                                    sizes="64px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[var(--content-tertiary)]">
                                    <FolderKanban className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-[var(--content-primary)] truncate group-hover:text-[var(--brand-secondary)] transition-colors">
                                  {project.title}
                                </h4>
                                <p className="text-[11px] text-[var(--content-secondary)] truncate mt-0.5">
                                  by {project.creator.displayName} • {project.category}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-[var(--content-tertiary)] shrink-0">
                                <span className="hidden sm:inline-flex items-center gap-1 font-mono">
                                  <Heart className="h-3 w-3 fill-[var(--content-tertiary)] text-[var(--content-tertiary)]" />
                                  <span>{project.appreciations}</span>
                                </span>
                                <ArrowRight className="h-4 w-4 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matched Creators */}
                  {matchedCreators.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                        <User className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                        <span>Creators</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedCreators.map((creator, idx) => {
                          const itemIndex = matchedProjects.length + idx;
                          const isSelected = selectedIndex === itemIndex;
                          return (
                            <Link
                              key={creator.id}
                              href={`/u/${creator.username}`}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer group",
                                isSelected
                                  ? "border-[var(--content-primary)] bg-[var(--bg-neutral)]"
                                  : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)]"
                              )}
                            >
                              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
                                <Image
                                  src={getValidAvatarUrl(creator.avatarUrl)}
                                  alt={creator.displayName}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs sm:text-sm font-bold text-[var(--content-primary)] truncate">
                                    {creator.displayName}
                                  </span>
                                  {creator.isVerified !== false && (
                                    <VerifiedBadge size="sm" />
                                  )}
                                </div>
                                <span className="text-[11px] text-[var(--content-secondary)] truncate block font-mono">
                                  @{creator.username}
                                </span>
                              </div>

                              <ArrowRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] group-hover:translate-x-0.5 transition-all shrink-0 mr-1" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* STATE 2: NO RESULTS FOUND FOR QUERY */
                <div className="text-center py-8 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-tertiary)]">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--content-primary)]">
                      No direct matches for &ldquo;{query}&rdquo;
                    </h3>
                    <p className="text-xs text-[var(--content-secondary)] max-w-sm mx-auto">
                      Try searching with broader terms, exploring disciplines, or submit to view all potential matches.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSearchSubmit}
                    className="font-bold gap-2 text-xs"
                  >
                    <span>Search all records for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-3 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)] flex items-center justify-between text-xs text-[var(--content-secondary)] shrink-0">
              <div className="hidden sm:flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    ↓
                  </kbd>
                  <span className="text-[11px] ml-1">Navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    <CornerDownLeft className="h-2.5 w-2.5 inline" />
                  </kbd>
                  <span className="text-[11px] ml-1">Select</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="font-bold text-[var(--content-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer ml-auto"
              >
                <span>See all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
