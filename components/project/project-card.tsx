"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/lib/types";
import { MotionCardWrapper } from "@/components/ui/motion-wrapper";
import { useSession } from "@/lib/session-context";
import { Heart, Eye, BookmarkPlus } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { toast } from "@/components/ui/toast";
import { cn, formatViews } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  className?: string;
}

export function ProjectCard({ project, priority = false, className }: ProjectCardProps) {
  const { projects, isProjectAppreciated, toggleAppreciation, openAddToBoardModal } = useSession();

  // Pick up live appreciation count and session data if available
  const liveProject = projects.find((p) => p.id === project.id) || project;

  const isLiked = isProjectAppreciated(liveProject.id);

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAppreciation(liveProject.id);
  };

  const handleAddToBoard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openAddToBoardModal(liveProject);
  };

  // Real Views count directly from project model
  const viewsCount = typeof liveProject.views === "number" ? liveProject.views : 0;

  return (
    <MotionCardWrapper className={className}>
      <div className="group relative flex flex-col select-none">
        {/* ================================================================= */}
        {/* 1. DOMINANT 4:3 VISUAL THUMBNAIL CANVAS                           */}
        {/* ================================================================= */}
        <div className="relative aspect-[4/3] w-full rounded-[20px] sm:rounded-[22px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)]/80 hover:border-[var(--content-primary)]/30 transition-all duration-300 shadow-xs hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
          {/* Main navigation link — covers the entire thumbnail */}
          <Link
            href={`/project/${liveProject.slug}`}
            prefetch={true}
            className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--content-primary)] cursor-pointer"
            aria-label={`View project: ${liveProject.title}`}
          >
            {liveProject.coverImage?.trim() || (liveProject.galleryImages && liveProject.galleryImages.length > 0) ? (
              <Image
                src={liveProject.coverImage?.trim() || liveProject.galleryImages[0]}
                alt={liveProject.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                priority={priority}
                fetchPriority={priority ? "high" : undefined}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[var(--bg-neutral)] to-[var(--border-neutral)]/40 text-center select-none">
                <div className="h-12 w-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-secondary)] mb-2 shadow-xs">
                  <span className="font-mono text-sm font-black uppercase">
                    {(liveProject.title || "PR").slice(0, 2)}
                  </span>
                </div>
                <span className="text-xs font-bold text-[var(--content-primary)] truncate max-w-[85%]">
                  {liveProject.title || "Untitled"}
                </span>
                <span className="text-[10px] font-mono text-[var(--content-tertiary)] uppercase mt-0.5">
                  {liveProject.category}
                </span>
              </div>
            )}
          </Link>

          {/* Editorial Badge (Top-Left) - e.g. Staff Pick, Project of the Day */}
          {liveProject.badge && (
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-amber-300 border border-amber-400/30 shadow-md uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {liveProject.badge}
              </span>
            </div>
          )}

          {/* ============================================================= */}
          {/* TOP-RIGHT ACTION BUTTONS: Add to Board + Like                 */}
          {/* ============================================================= */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Add to Board Button */}
            <button
              type="button"
              onClick={handleAddToBoard}
              className={cn(
                "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md sm:shadow-lg active:scale-90 border border-white/20 bg-black/60 text-white hover:bg-black/85 hover:border-white/40 hover:scale-105",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              )}
              title="Add to Board"
              aria-label={`Add ${liveProject.title} to board`}
            >
              <BookmarkPlus className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2]" />
            </button>

            {/* Favorite / Appreciate Button */}
            <button
              type="button"
              onClick={handleFavClick}
              className={cn(
                "group/fav flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md sm:shadow-lg active:scale-90 border",
                "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100",
                isLiked
                  ? "bg-black/80 text-white border-white/40 hover:bg-black/95 hover:scale-105"
                  : "bg-black/60 text-white border-white/20 hover:bg-black/85 hover:border-white/40 hover:scale-105"
              )}
              title={isLiked ? "Unlike project" : "Appreciate project"}
              aria-label={isLiked ? "Unlike project" : "Appreciate project"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 sm:h-4.5 sm:w-4.5 transition-transform duration-200",
                  isLiked
                    ? "fill-white text-white scale-110"
                    : "text-white fill-none group-hover/fav:scale-110"
                )}
              />
            </button>
          </div>

          {/* ============================================================= */}
          {/* BOTTOM TITLE BAR (Always on mobile, hover on desktop)         */}
          {/* ============================================================= */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 sm:p-4 transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none select-none"
          >
            <h3 className="text-white font-bold text-xs sm:text-base truncate drop-shadow-xs">
              {liveProject.title}
            </h3>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. DIRECT FOOTER INFO BAR (Below Thumbnail)                       */}
        {/* ================================================================= */}
        <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
          {/* Creator Attribution */}
          <Link
            href={`/u/${liveProject.creator.username}`}
            prefetch={true}
            className="group/author flex items-center gap-2 min-w-0 hover:opacity-85 transition-opacity"
          >
            <div className="relative shrink-0">
              <div
                className={cn(
                  "relative h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0",
                  liveProject.creator.badge?.trim().toLowerCase() === "founding member" &&
                    "ring-1.5 ring-[var(--brand-secondary)]/70 shadow-[0_0_8px_var(--brand-secondary-glow)]"
                )}
              >
                <Image
                  src={getValidAvatarUrl(liveProject.creator.avatarUrl)}
                  alt={liveProject.creator.displayName}
                  fill
                  sizes="26px"
                  className="object-cover"
                />
              </div>
              {liveProject.creator.badge?.trim().toLowerCase() === "founding member" && (
                <div className="absolute -bottom-0.5 -right-0.5 z-10 pointer-events-none">
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-gradient-to-tr from-[#6810a6] via-[var(--brand-secondary)] to-[#a855f7] text-white ring-1 ring-[var(--bg-screen)] shadow-2xs">
                    <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Creator name always stays black/primary — only the badge is branded */}
              <span className="text-xs sm:text-[13px] font-bold text-[var(--content-primary)] transition-colors truncate">
                {liveProject.creator.displayName}
              </span>
              {liveProject.creator.isVerified && (
                <VerifiedBadge size="sm" className="shrink-0" />
              )}
            </div>
          </Link>

          {/* Metrics: Heart + Views (also links to project details) */}
          <Link
            href={`/project/${liveProject.slug}`}
            prefetch={true}
            className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[11px] sm:text-xs hover:opacity-80 transition-opacity"
            aria-label={`Project metrics: ${liveProject.appreciations} likes, ${viewsCount} views`}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium transition-colors",
                isLiked ? "text-[var(--content-primary)] font-semibold" : "text-[var(--content-tertiary)]"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked ? "fill-[var(--content-primary)] text-[var(--content-primary)]" : "text-current")} />
              <span>{liveProject.appreciations}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-[var(--content-tertiary)]">
              <Eye className="h-3.5 w-3.5" />
              <span>{formatViews(viewsCount)}</span>
            </span>
          </Link>
        </div>
      </div>
    </MotionCardWrapper>
  );
}
