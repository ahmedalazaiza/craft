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
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  className?: string;
}

function formatViews(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toString();
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
          {/* Main navigation link — wraps only the image */}
          <Link
            href={`/project/${liveProject.slug}`}
            prefetch={true}
            className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--content-primary)]"
            aria-label={`View project: ${liveProject.title}`}
          >
            <Image
              src={liveProject.coverImage}
              alt={liveProject.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              priority={priority || liveProject.featured}
            />
          </Link>

          {/* Subtle Hover Dark Dimmer Scrim */}
          <div className="absolute inset-0 z-10 bg-black/25 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Editorial Badge (Top-Left) - e.g. Staff Pick, Project of the Day */}
          {liveProject.badge ? (
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-amber-300 border border-amber-400/30 shadow-md uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                {liveProject.badge}
              </span>
            </div>
          ) : (
            /* Category Tag on Hover (Top-Left) */
            <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs border border-white/10">
                {liveProject.category}
              </span>
            </div>
          )}

          {/* ============================================================= */}
          {/* TOP-RIGHT ACTION BUTTONS CLUSTER (Fav + Add to Board + View)  */}
          {/* ============================================================= */}
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 flex items-center gap-2 pointer-events-auto">
            {/* View / Eye Button: Always visible on mobile, center hover on desktop */}
            <Link
              href={`/project/${liveProject.slug}`}
              prefetch={true}
              onClick={(e) => e.stopPropagation()}
              className="flex sm:hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 transition-transform cursor-pointer"
              title="View Project"
              aria-label={`View project ${liveProject.title}`}
            >
              <Eye className="h-4.5 w-4.5 stroke-[2]" />
            </Link>

            {/* Add to Board Button: Always visible on mobile, center hover on desktop */}
            <button
              type="button"
              onClick={handleAddToBoard}
              className="flex sm:hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-md active:scale-90 transition-transform cursor-pointer"
              title="Add to Board"
              aria-label={`Add ${liveProject.title} to board`}
            >
              <BookmarkPlus className="h-4.5 w-4.5 stroke-[2]" />
            </button>

            {/* Favorite / Appreciate Button: Always visible on mobile & desktop */}
            <button
              type="button"
              onClick={handleFavClick}
              className={cn(
                "group/fav flex h-10 w-10 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 sm:h-11 sm:w-11 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md sm:shadow-lg active:scale-90 border",
                isLiked
                  ? "bg-black/80 text-rose-500 border-rose-500/40 shadow-rose-500/20 hover:bg-black/95 hover:scale-105"
                  : "bg-black/60 text-white border-white/20 hover:bg-black/85 hover:border-white/40 hover:scale-105"
              )}
              title={isLiked ? "Unlike project" : "Appreciate project"}
              aria-label={isLiked ? "Unlike project" : "Appreciate project"}
            >
              <Heart
                className={cn(
                  "h-4.5 w-4.5 sm:h-4.5 sm:w-4.5 transition-transform duration-200",
                  isLiked
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-white group-hover/fav:scale-110"
                )}
              />
            </button>
          </div>

          {/* ============================================================= */}
          {/* CENTER FLOATING ACTION BUTTONS (Desktop Hover: Eye + Add)     */}
          {/* ============================================================= */}
          <div className="absolute inset-0 z-20 hidden sm:flex items-center justify-center gap-3.5 pointer-events-none group-hover:pointer-events-auto">
            {/* Eye Button: Direct quick view / navigation */}
            <Link
              href={`/project/${liveProject.slug}`}
              prefetch={true}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto"
              title="View Project"
              aria-label={`View project ${liveProject.title}`}
            >
              <Eye className="h-5 w-5 stroke-[2]" />
            </Link>

            {/* Add to Board Button */}
            <button
              type="button"
              onClick={handleAddToBoard}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto"
              title="Add to Board"
              aria-label={`Add ${liveProject.title} to board`}
            >
              <BookmarkPlus className="h-5 w-5 stroke-[2]" />
            </button>
          </div>

          {/* ============================================================= */}
          {/* BOTTOM TITLE BAR (Always on mobile, hover on desktop)         */}
          {/* ============================================================= */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 sm:p-4 transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          >
            {/* Project Title */}
            <Link
              href={`/project/${liveProject.slug}`}
              prefetch={true}
              className="pointer-events-auto min-w-0 block hover:underline"
            >
              <h3 className="text-white font-bold text-xs sm:text-base truncate drop-shadow-xs">
                {liveProject.title}
              </h3>
            </Link>
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
            <div className="relative h-6 w-6 sm:h-6.5 sm:w-6.5 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
              <Image
                src={getValidAvatarUrl(liveProject.creator.avatarUrl)}
                alt={liveProject.creator.displayName}
                fill
                sizes="26px"
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Creator name always stays black/primary — only the badge is branded */}
              <span className="text-xs sm:text-[13px] font-bold text-[var(--content-primary)] transition-colors truncate">
                {liveProject.creator.displayName}
              </span>
              {liveProject.creator.isVerified && (
                <VerifiedBadge size="sm" />
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
                isLiked ? "text-rose-500 font-semibold" : "text-[var(--content-tertiary)]"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-rose-500 text-rose-500")} />
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
