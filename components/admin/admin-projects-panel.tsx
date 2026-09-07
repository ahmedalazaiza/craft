"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { FoundingBadge } from "@/components/ui/founding-badge";
import { toast } from "@/components/ui/toast";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { getValidAvatarUrl } from "@/lib/avatar";
import {
  Search,
  FolderKanban,
  ExternalLink,
  Edit3,
  SlidersHorizontal,
  Eye,
  Heart,
  Sparkles,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
} from "lucide-react";

export function AdminProjectsPanel() {
  const { projects, taxonomy, adminUpdateProjectCategory, isAdmin } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes">("date");
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);

  // Compute category options from active taxonomy
  const categoryNames = useMemo(() => {
    return (taxonomy && taxonomy.length > 0 ? taxonomy : []).map((c) => c.name);
  }, [taxonomy]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search query: Title, creator username, or creator display name
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const titleMatch = project.title.toLowerCase().includes(q);
          const usernameMatch = project.creator?.username?.toLowerCase().includes(q);
          const nameMatch = project.creator?.displayName?.toLowerCase().includes(q);
          const categoryMatch = project.category?.toLowerCase().includes(q);
          if (!titleMatch && !usernameMatch && !nameMatch && !categoryMatch) {
            return false;
          }
        }

        // Category filter
        if (selectedCategoryFilter !== "all" && project.category !== selectedCategoryFilter) {
          return false;
        }

        // Status filter
        if (selectedStatusFilter === "published" && project.published === false) {
          return false;
        }
        if (selectedStatusFilter === "draft" && project.published !== false) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "views") {
          return (b.views || 0) - (a.views || 0);
        }
        if (sortBy === "likes") {
          return (b.appreciations || 0) - (a.appreciations || 0);
        }
        // Default by date (newest first)
        const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [projects, searchQuery, selectedCategoryFilter, selectedStatusFilter, sortBy]);

  // Quick Category Switch Handler
  const handleCategorySwitch = async (projectId: string, newCategory: string) => {
    if (!newCategory) return;
    setUpdatingProjectId(projectId);
    try {
      await adminUpdateProjectCategory(projectId, newCategory);
    } finally {
      setUpdatingProjectId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-[var(--bg-elevated)] border border-[var(--border-neutral)] rounded-3xl">
        <p className="text-sm font-bold text-rose-500">
          Admin access required to moderate platform projects.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[var(--brand-secondary)]/10 text-[var(--brand-secondary)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className={cn(bricolage.className, "text-lg sm:text-xl font-black text-[var(--content-primary)]")}>
              Platform Project Moderation Studio
            </h2>
          </div>
          <p className="text-xs text-[var(--content-secondary)] max-w-2xl">
            Control, re-categorize, and edit any uploaded case study on Layerat. Changes reflect instantly platform-wide.
          </p>
        </div>

        {/* Counts badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--content-tertiary)] block">Total</span>
            <span className="text-sm font-black text-[var(--content-primary)]">{projects.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-center">
            <span className="text-[10px] font-mono uppercase text-[var(--content-tertiary)] block">Filtered</span>
            <span className="text-sm font-black text-[var(--brand-secondary)]">{filteredProjects.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs">
        {/* Live Search */}
        <div className="sm:col-span-5 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, creator, or category..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:border-[var(--brand-secondary)] transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full h-11 px-3 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs font-semibold text-[var(--content-primary)] focus:outline-none focus:border-[var(--brand-secondary)] transition-all cursor-pointer"
          >
            <option value="all">All Categories ({projects.length})</option>
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-2">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as "all" | "published" | "draft")}
            className="w-full h-11 px-3 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs font-semibold text-[var(--content-primary)] focus:outline-none focus:border-[var(--brand-secondary)] transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "views" | "likes")}
            className="w-full h-11 px-3 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs font-semibold text-[var(--content-primary)] focus:outline-none focus:border-[var(--brand-secondary)] transition-all cursor-pointer"
          >
            <option value="date">Sort: Newest</option>
            <option value="views">Sort: Most Viewed</option>
            <option value="likes">Sort: Most Appreciated</option>
          </select>
        </div>
      </div>

      {/* 3. Projects Moderation List */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-elevated)] border border-[var(--border-neutral)] rounded-3xl space-y-3">
          <FolderKanban className="h-8 w-8 text-[var(--content-tertiary)] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[var(--content-primary)]">No matching projects found</h3>
          <p className="text-xs text-[var(--content-secondary)]">
            Try adjusting your search query or clear the active category filters.
          </p>
          {(searchQuery || selectedCategoryFilter !== "all" || selectedStatusFilter !== "all") && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("all");
                setSelectedStatusFilter("all");
              }}
              className="text-xs font-bold mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => {
            const isUpdatingThis = updatingProjectId === project.id;
            return (
              <div
                key={project.id}
                className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--border-hover)] transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail + Title + Creator */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail Cover */}
                  <Link
                    href={`/project/${project.slug}`}
                    prefetch={true}
                    className="relative h-18 w-26 sm:h-20 sm:w-32 rounded-2xl overflow-hidden bg-[var(--bg-neutral)] shrink-0 border border-[var(--border-neutral)] group shadow-2xs block"
                  >
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        sizes="130px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-[var(--content-tertiary)]">
                        No cover
                      </div>
                    )}
                  </Link>

                  {/* Info details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/project/${project.slug}`}
                        prefetch={true}
                        className="font-bold text-xs sm:text-sm text-[var(--content-primary)] hover:text-[var(--brand-secondary)] transition-colors truncate block"
                      >
                        {project.title}
                      </Link>

                      {project.published === false ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          Live
                        </span>
                      )}
                    </div>

                    {/* Creator Row */}
                    <div className="flex items-center gap-2 text-xs text-[var(--content-secondary)]">
                      <Link
                        href={`/u/${project.creator?.username || ""}`}
                        prefetch={true}
                        className="flex items-center gap-1.5 hover:underline truncate"
                      >
                        <div className="relative h-4.5 w-4.5 rounded-full overflow-hidden bg-[var(--bg-neutral)] shrink-0">
                          <Image
                            src={getValidAvatarUrl(project.creator?.avatarUrl)}
                            alt={project.creator?.displayName || "Author"}
                            fill
                            sizes="20px"
                            className="object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[var(--content-primary)] truncate">
                          {project.creator?.displayName || "Unknown Creator"}
                        </span>
                      </Link>

                      {project.creator?.isVerified && (
                        <VerifiedBadge size="sm" />
                      )}

                      <span className="text-[var(--content-tertiary)] text-[10px] font-mono">
                        @{project.creator?.username}
                      </span>
                    </div>

                    {/* Quick Stats: Likes & Views */}
                    <div className="flex items-center gap-3 text-[11px] text-[var(--content-tertiary)] font-medium">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{project.appreciations || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{project.views || 0}</span>
                      </span>
                      <span className="text-[10px] opacity-75">
                        {project.publishedAt
                          ? new Date(project.publishedAt).toLocaleDateString()
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Category Switcher & Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-neutral)]">
                  {/* Quick Category Switcher (The user's direct request) */}
                  <div className="flex flex-col space-y-1 min-w-[200px]">
                    <span className="text-[10px] font-mono font-bold uppercase text-[var(--content-tertiary)]">
                      Category Assignment:
                    </span>
                    <select
                      value={project.category}
                      disabled={isUpdatingThis}
                      onChange={(e) => handleCategorySwitch(project.id, e.target.value)}
                      className={cn(
                        "h-9 px-2.5 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs font-semibold text-[var(--content-primary)] focus:outline-none focus:border-[var(--brand-secondary)] transition-all cursor-pointer",
                        isUpdatingThis && "opacity-50 pointer-events-none"
                      )}
                    >
                      {categoryNames.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Actions: View Live + Full Edit */}
                  <div className="flex items-center gap-2 pt-1 sm:pt-4">
                    <Link
                      href={`/project/${project.slug}`}
                      target="_blank"
                      className="h-9 px-3 rounded-xl bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors flex items-center gap-1.5"
                      title="View Project in New Tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>

                    <Link
                      href={`/me/projects/${project.id}`}
                      className="h-9 px-3.5 rounded-xl bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary-hover)] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      title="Edit Full Project in Project Studio"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Full</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
