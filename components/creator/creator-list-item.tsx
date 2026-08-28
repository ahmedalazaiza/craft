"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Creator } from "@/lib/types";

import { useSession } from "@/lib/session-context";

import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, FolderKanban, ArrowRight, Share2 } from "lucide-react";
import { ShareModal } from "@/components/ui/share-modal";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface CreatorListItemProps {
  creator: Creator;
  className?: string;
  variant?: "card" | "row" | "compact";
}

export function CreatorListItem({
  creator,
  className,
  variant = "card",
}: CreatorListItemProps) {
  const { projects } = useSession();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const creatorProjects = projects.filter(
    (p) =>
      p.creator.username.toLowerCase() === creator.username.toLowerCase() &&
      p.published
  );

  const publishedCount = creatorProjects.length;
  const totalAppreciations = creatorProjects.reduce(
    (sum, p) => sum + p.appreciations,
    0
  );

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(true);
  };

  if (variant === "compact") {
    return (
      <>
        <Link
          href={`/u/${creator.username}`}
          className={cn(
            "flex items-center justify-between p-3 rounded-[14px] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] transition-all",
            className
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0">
              <Image
                src={getValidAvatarUrl(creator.avatarUrl)}
                alt={creator.displayName}
                fill
                sizes="36px"
                className="object-cover"
              />
              <OnlineBadge userId={creator.id} username={creator.username} size="sm" className="absolute bottom-0 right-0 z-10" />
            </div>
            <div>
              <div className="type-title-group text-[var(--content-primary)] flex items-center gap-1">
                <span>{creator.displayName}</span>
                {creator.isVerified !== false && <VerifiedBadge size="sm" />}
              </div>
              <div className="type-label text-[var(--content-tertiary)]">
                @{creator.username} • {creator.city || creator.location}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[var(--content-secondary)] px-2.5 py-0.5 rounded-full bg-[var(--bg-neutral)]">
            {publishedCount} works
          </span>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/u/${creator.username}`}
        className={cn(
          "group flex flex-col justify-between rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-4 sm:p-6 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(14,15,12,0.06)] hover:border-[var(--primary-forest-green)]/30",
          className
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-2 ring-[var(--border-neutral)] group-hover:ring-[var(--primary-forest-green)] transition-all shrink-0">
                <Image
                  src={getValidAvatarUrl(creator.avatarUrl)}
                  alt={creator.displayName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <OnlineBadge userId={creator.id} username={creator.username} size="sm" className="absolute bottom-0.5 right-0.5 z-10" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="type-title-body text-[var(--content-primary)] group-hover:text-[var(--primary-forest-green)] transition-colors">
                    {creator.displayName}
                  </h3>
                  {creator.isVerified !== false && <VerifiedBadge size="sm" />}
                </div>
                <div className="type-label text-[var(--content-tertiary)] flex items-center gap-1.5 mt-0.5">
                  <span>@{creator.username}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {creator.city || creator.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareClick}
                className="rounded-full p-2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer"
                title={`Share ${creator.displayName}'s profile`}
              >
                <Share2 className="h-4 w-4" />
              </button>

              <span className="rounded-full p-2 text-[var(--content-tertiary)] group-hover:text-[var(--primary-forest-green)] group-hover:bg-[var(--bg-neutral)] transition-all">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <p className="mt-4 type-body-default text-[var(--content-secondary)] line-clamp-2 leading-relaxed">
            {creator.bio}
          </p>

          {creator.skills && creator.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {creator.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="mt-6 pt-4 border-t border-[var(--border-neutral)] flex items-center justify-between text-xs text-[var(--content-tertiary)]">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-[var(--primary-forest-green)]" />
            <strong className="text-[var(--content-primary)] font-semibold">
              {publishedCount}
            </strong>{" "}
            published
          </span>

          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-[var(--primary-forest-green)] text-[var(--primary-forest-green)]" />
            <strong className="text-[var(--content-primary)] font-semibold">
              {totalAppreciations}
            </strong>{" "}
            appreciations
          </span>
        </div>
      </Link>

      {/* Creator Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Creator Profile"
        subtitle={`Share ${creator.displayName}'s profile with your network or copy the public link.`}
        creatorName={creator.displayName}
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/u/${creator.username}`
            : `https://craft.studio/u/${creator.username}`
        }
      />
    </>
  );
}
