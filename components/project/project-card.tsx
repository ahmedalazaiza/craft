"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import { MotionCardWrapper } from "@/components/ui/motion-wrapper";
import { AppreciationButton } from "@/components/project/appreciation-button";
import { useSession } from "@/lib/session-context";
import { Share2, Edit3, Heart, Eye } from "lucide-react";
import { ShareModal } from "@/components/ui/share-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { getCanonicalShareUrl } from "@/lib/seo";
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
  const router = useRouter();
  const { projects, user } = useSession();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Pick up live appreciation count and session data if available
  const liveProject = projects.find((p) => p.id === project.id) || project;

  const isOwner =
    user &&
    liveProject.creator &&
    (user.id === liveProject.creator.id ||
      user.username.toLowerCase() === liveProject.creator.username.toLowerCase());

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(true);
  };

  // Real Views count directly from project model
  const viewsCount = typeof liveProject.views === "number" ? liveProject.views : 0;

  return (
    <>
      <MotionCardWrapper className={className}>
        <div className="group relative flex flex-col select-none">
          {/* ================================================================= */}
          {/* 1. DOMINANT 4:3 VISUAL THUMBNAIL CANVAS                           */}
          {/* ================================================================= */}
          <div className="relative aspect-[4/3] w-full rounded-[20px] sm:rounded-[22px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)]/80 hover:border-[var(--content-primary)]/30 transition-all duration-300 shadow-xs hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                priority={priority || liveProject.featured}
              />
            </Link>

            {/* Category Tag on Hover (Top-Left) */}
            <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
                {liveProject.category}
              </span>
            </div>

            {/* Hover Scrim Overlay with Title & Floating Action Buttons */}
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-between gap-3 pointer-events-none">
              {/* Project Title */}
              <Link
                href={`/project/${liveProject.slug}`}
                prefetch={true}
                className="pointer-events-auto min-w-0 flex-1 hover:underline"
              >
                <h3 className="text-white font-bold text-sm sm:text-base truncate drop-shadow-xs">
                  {liveProject.title}
                </h3>
              </Link>

              {/* Floating Action Buttons */}
              <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
                {isOwner && (
                  <Link
                    href={`/me/projects/${liveProject.id}`}
                    prefetch={true}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white hover:bg-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow-md"
                    title="Edit project"
                    aria-label="Edit project"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleShareClick}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white hover:bg-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95 shadow-md cursor-pointer"
                  title="Share project"
                  aria-label="Share project"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>

                <AppreciationButton
                  projectId={liveProject.id}
                  count={liveProject.appreciations}
                  variant="icon"
                />
              </div>
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
                <span className="text-xs sm:text-[13px] font-bold text-[var(--content-primary)] group-hover/author:text-[var(--brand-secondary)] transition-colors truncate">
                  {liveProject.creator.displayName}
                </span>
                {liveProject.creator.isVerified && (
                  <VerifiedBadge size="sm" />
                )}
              </div>
            </Link>

            {/* Metrics: Heart + Views */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-[var(--content-secondary)]">
                <Heart className="h-3.5 w-3.5 fill-[var(--brand-secondary)] text-[var(--brand-secondary)]" />
                <span>{liveProject.appreciations}</span>
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-[var(--content-tertiary)]">
                <Eye className="h-3.5 w-3.5" />
                <span>{formatViews(viewsCount)}</span>
              </span>
            </div>
          </div>
        </div>
      </MotionCardWrapper>

      {/* Project Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Project"
        subtitle={`Share "${liveProject.title}" by ${liveProject.creator.displayName} with your network or copy the link.`}
        creatorName={liveProject.creator.displayName}
        url={getCanonicalShareUrl(`/project/${liveProject.slug}`)}
      />
    </>
  );
}
