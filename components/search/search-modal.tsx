"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { Project, Creator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Search,
  ArrowRight,
  User,
  FolderKanban,
  X,
  Sparkles,
  Heart,
  TrendingUp,
  Tag,
  CornerDownLeft,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { sortProjects, computeCreatorRank } from "@/lib/ranking";
import { cn } from "@/lib/utils";

const QUICK_CATEGORIES = [
  "UI/UX Design",
  "Branding & Identity",
  "3D & Motion",
  "Web Development",
  "Graphic Design",
  "Illustration",
  "Typography",
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { projects, creators } = useSession();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Filter suggestions (up to 4 projects, up to 4 creators)
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
              (p.creator.id === a.id || p.creator.username.toLowerCase() === a.username.toLowerCase()) &&
              p.published
          );
          const bProjects = projects.filter(
            (p) =>
              p.creator &&
              (p.creator.id === b.id || p.creator.username.toLowerCase() === b.username.toLowerCase()) &&
            p.published
          );
          return (
            computeCreatorRank(b, bProjects, trimmed) -
            computeCreatorRank(a, aProjects, trimmed)
          );
        })
        .slice(0, 4)
    : [];

  // Default featured items when search query is empty
  const featuredProjects = projects.filter((p) => p.published && p.featured).slice(0, 3);
  const featuredCreators = creators.filter((c) => c.isVerified).slice(0, 3);

  const flatSuggestions = [
    ...matchedProjects.map((p) => ({ type: "project" as const, item: p })),
    ...matchedCreators.map((c) => ({ type: "creator" as const, item: c })),
  ];

  const totalSuggestions = flatSuggestions.length;

  // Reset state and focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(-1);
      // Disable background scroll
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Global shortcut (Escape to close)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (totalSuggestions === 0) return;
        setSelectedIndex((prev) =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (totalSuggestions === 0) return;
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalSuggestions) {
          const selected = flatSuggestions[selectedIndex];
          onClose();
          if (selected.type === "project") {
            router.push(`/project/${selected.item.slug}`);
          } else {
            router.push(`/u/${selected.item.username}`);
          }
        } else if (query.trim()) {
          onClose();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    },
    [totalSuggestions, selectedIndex, flatSuggestions, query, onClose, router]
  );

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleCategoryClick = (cat: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(cat)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Blurred Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Centered Spotlight Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className="relative w-full max-w-2xl rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden z-10 my-auto flex flex-col max-h-[88vh]"
            role="dialog"
            aria-modal="true"
            aria-label="Search Layerat Platform"
          >
            {/* Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center h-16 sm:h-18 px-4 sm:px-6 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)] shrink-0 gap-3"
            >
              <Search className="h-5 w-5 text-[var(--brand-secondary)] shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, creators, tools, or skills..."
                className="flex-1 min-w-0 bg-transparent text-base sm:text-lg text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none appearance-none"
              />

              {/* Clear Query Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="h-7 w-7 rounded-full bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                  title="Clear query"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* ESC Key Hint Badge */}
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-2 py-1 text-[10px] font-mono font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer shrink-0"
                title="Press Escape to close"
              >
                <span>ESC</span>
              </button>

              {/* Search Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="h-9 px-4 text-xs font-bold shrink-0 shadow-xs"
              >
                Search
              </Button>
            </form>

            {/* Scrollable Results & Suggestions Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[60vh] custom-scrollbar">
              {/* ============================================================= */}
              {/* STATE 1: QUERY TYPED & RESULTS FOUND                          */}
              {/* ============================================================= */}
              {trimmed && totalSuggestions > 0 && (
                <div className="space-y-6">
                  {/* Matched Projects */}
                  {matchedProjects.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                        <FolderKanban className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                        <span>Projects</span>
                      </div>

                      <div className="space-y-1.5">
                        {matchedProjects.map((project, idx) => {
                          const isSelected = selectedIndex === idx;
                          return (
                            <Link
                              key={project.id}
                              href={`/project/${project.slug}`}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 cursor-pointer group",
                                isSelected
                                  ? "border-[var(--content-primary)] bg-[var(--bg-neutral)]"
                                  : "border-transparent hover:border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                              )}
                            >
                              {/* Thumbnail */}
                              <div className="relative h-12 w-16 sm:h-14 sm:w-20 rounded-xl overflow-hidden bg-[var(--bg-neutral)] shrink-0 border border-[var(--border-neutral)]">
                                {project.coverImage ? (
                                  <Image
                                    src={project.coverImage}
                                    alt={project.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[var(--content-tertiary)]">
                                    <FolderKanban className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              {/* Project Metadata */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[var(--content-primary)] truncate group-hover:text-[var(--content-primary)]">
                                  {project.title}
                                </h4>
                                <p className="text-xs text-[var(--content-secondary)] truncate mt-0.5">
                                  by {project.creator.displayName} •{" "}
                                  <span className="text-[var(--content-tertiary)]">
                                    {project.category || "Design"}
                                  </span>
                                </p>
                              </div>

                              {/* Appreciations & Arrow */}
                              <div className="flex items-center gap-3 shrink-0 text-xs text-[var(--content-secondary)]">
                                <span className="inline-flex items-center gap-1 font-mono">
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
                    <div className="space-y-2.5">
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
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-150 cursor-pointer group",
                                isSelected
                                  ? "border-[var(--content-primary)] bg-[var(--bg-neutral)]"
                                  : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)]"
                              )}
                            >
                              <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
                                <Image
                                  src={getValidAvatarUrl(creator.avatarUrl)}
                                  alt={creator.displayName}
                                  fill
                                  sizes="40px"
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
              )}

              {/* ============================================================= */}
              {/* STATE 2: NO RESULTS FOUND FOR QUERY                           */}
              {/* ============================================================= */}
              {trimmed && totalSuggestions === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-tertiary)]">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[var(--content-primary)]">
                      No direct matches for &ldquo;{query}&rdquo;
                    </h3>
                    <p className="text-xs text-[var(--content-secondary)] max-w-sm mx-auto">
                      Try searching with a broader keyword, checking project tags, or press Search to explore all matching records.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSearchSubmit}
                    className="font-bold gap-2"
                  >
                    <span>Search all records for &ldquo;{query}&rdquo;</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* ============================================================= */}
              {/* STATE 3: EMPTY INITIAL STATE (QUICK TAGS & TRENDING)          */}
              {/* ============================================================= */}
              {!trimmed && (
                <div className="space-y-6">
                  {/* Quick Categories */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                      <Tag className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                      <span>Popular Categories</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {QUICK_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryClick(cat)}
                          className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] hover:border-[var(--content-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--content-primary)] transition-all cursor-pointer shadow-2xs"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Featured Projects Discovery */}
                  {featuredProjects.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                        <Sparkles className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                        <span>Featured Work</span>
                      </div>

                      <div className="space-y-1.5">
                        {featuredProjects.map((project) => (
                          <Link
                            key={project.id}
                            href={`/project/${project.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-2.5 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer group"
                          >
                            <div className="relative h-10 w-14 rounded-xl overflow-hidden bg-[var(--bg-neutral)] shrink-0 border border-[var(--border-neutral)]">
                              {project.coverImage && (
                                <Image
                                  src={project.coverImage}
                                  alt={project.title}
                                  fill
                                  sizes="60px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-[var(--content-primary)] truncate">
                                {project.title}
                              </h4>
                              <p className="text-[11px] text-[var(--content-secondary)] truncate">
                                by {project.creator.displayName}
                              </p>
                            </div>
                            <Badge variant="accent" size="sm" className="shrink-0 text-[10px]">
                              Featured
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Creators */}
                  {featuredCreators.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                        <span>Featured Creators</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {featuredCreators.map((creator) => (
                          <Link
                            key={creator.id}
                            href={`/u/${creator.username}`}
                            onClick={onClose}
                            className="flex items-center gap-2.5 p-2 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer group"
                          >
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
                              <Image
                                src={getValidAvatarUrl(creator.avatarUrl)}
                                alt={creator.displayName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-bold text-[var(--content-primary)] truncate block">
                                {creator.displayName}
                              </span>
                              <span className="text-[10px] text-[var(--content-secondary)] truncate block font-mono">
                                @{creator.username}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Action Bar */}
            <div className="p-3 sm:p-4 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)] flex items-center justify-between text-xs text-[var(--content-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    ↓
                  </kbd>
                  <span className="text-[11px] ml-1">Navigate</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="rounded border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    <CornerDownLeft className="h-2.5 w-2.5 inline" />
                  </kbd>
                  <span className="text-[11px] ml-1">Select</span>
                </span>
              </div>

              {query.trim() ? (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="font-bold text-[var(--content-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>See all results for &ldquo;{query}&rdquo;</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : (
                <span className="text-[11px] text-[var(--content-tertiary)]">
                  Type to search live portfolio database
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
