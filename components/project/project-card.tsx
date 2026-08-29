"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import { MotionCardWrapper } from "@/components/ui/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { AppreciationButton } from "@/components/project/appreciation-button";
import { useSession } from "@/lib/session-context";
import { Share2, Edit3 } from "lucide-react";
import { ShareModal } from "@/components/ui/share-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
  className?: string;
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

  const handleCardClick = () => {
    router.push(`/project/${liveProject.slug}`);
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/u/${liveProject.creator.username}`);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  return (
    <>
      <MotionCardWrapper className={className}>
        <div
          onClick={handleCardClick}
          className="group flex flex-col h-full rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_rgba(14,15,12,0.06)] dark:hover:shadow-none dark:hover:border-[var(--content-primary)]/40 cursor-pointer select-none"
        >
          {/* Dominant 4:3 Cover Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--bg-neutral)] block">
            <Image
              src={liveProject.coverImage}
              alt={liveProject.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={priority || liveProject.featured}
            />

            {/* Solid Category Badge Top-Left (Readable on photos) */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <Badge variant="accent" size="default">
                {liveProject.category}
              </Badge>
            </div>

            {/* Action Buttons Top-Right: Owner Edit + Quick Share + Appreciation */}
            <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/me/projects/${liveProject.id}`);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 backdrop-blur-xs text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] transition-all shadow-xs cursor-pointer border border-[var(--border-neutral)]"
                  title="Edit case study"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleShareClick}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 backdrop-blur-xs text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-elevated)] transition-all shadow-xs cursor-pointer border border-[var(--border-neutral)]"
                title="Share project"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>

              <AppreciationButton
                projectId={liveProject.id}
                count={liveProject.appreciations}
                variant="card"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
            <div>
              <h3 className="type-title-body line-clamp-1 text-[var(--content-primary)] group-hover:text-[var(--primary-forest-green)] transition-colors">
                {liveProject.title}
              </h3>
              <p className="mt-1.5 type-body-default line-clamp-2 text-[var(--content-secondary)]">
                {liveProject.summary}
              </p>
            </div>

            {/* Divider & Creator Row */}
            <div className="mt-4 pt-3.5 border-t border-[var(--border-neutral)] flex items-center justify-between">
              <div
                onClick={handleCreatorClick}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group/creator cursor-pointer"
              >
                <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
                  <Image
                    src={getValidAvatarUrl(liveProject.creator.avatarUrl)}
                    alt={liveProject.creator.displayName}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                  <OnlineBadge userId={liveProject.creator.id} username={liveProject.creator.username} size="sm" className="absolute -bottom-0.5 -right-0.5 z-10" />

                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="type-title-group text-[var(--content-primary)] group-hover/creator:text-[var(--primary-forest-green)] transition-colors truncate max-w-[130px] sm:max-w-[150px]">
                    {liveProject.creator.displayName}
                  </span>
                  {liveProject.creator.isVerified !== false && <VerifiedBadge size="sm" />}
                </div>
              </div>

              <span className="type-label text-[var(--content-tertiary)] shrink-0">
                {liveProject.creator.city || liveProject.creator.location}
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
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/project/${liveProject.slug}`
            : `https://layerat.com/project/${liveProject.slug}`
        }
      />
    </>
  );
}
