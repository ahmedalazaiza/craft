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
          "group flex flex-col justify-between rounded-2xl bg-white dark:bg-[#141713] border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 transition-all duration-200 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700",
          className
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-2 border border-neutral-200 dark:border-neutral-700 shrink-0">
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
                  <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white transition-colors">
                    {creator.displayName}
                  </h3>
                  {creator.isVerified !== false && <VerifiedBadge size="sm" />}
                </div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-0.5">
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
                className="rounded-full p-2 text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                title={`Share ${creator.displayName}'s profile`}
              >
                <Share2 className="h-4 w-4" />
              </button>

              <span className="rounded-full p-2 text-neutral-400 group-hover:text-neutral-950 dark:group-hover:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-all">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-normal">
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
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
            <strong className="text-neutral-900 dark:text-white font-semibold">
              {publishedCount}
            </strong>{" "}
            published
          </span>

          <span className="flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100" />
            <strong className="text-neutral-900 dark:text-white font-semibold">
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
            : `https://layerat.com/u/${creator.username}`
        }
      />
    </>
  );
}
