"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Creator } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { FoundingBadge } from "@/components/ui/founding-badge";
import { ShareModal } from "@/components/ui/share-modal";
import { getValidAvatarUrl } from "@/lib/avatar";
import { getCanonicalShareUrl } from "@/lib/seo";
import { MapPin, ArrowRight, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorListItemProps {
  creator: Creator;
  variant?: "showcase" | "compact";
  className?: string;
}

export function CreatorListItem({
  creator,
  variant = "showcase",
  className,
}: CreatorListItemProps) {
  const { projects } = useSession();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Get real published projects belonging to this creator, sorted by newest published first
  const creatorProjects = useMemo(() => {
    return projects
      .filter(
        (p) =>
          p.creator &&
          (p.creator.id === creator.id ||
            p.creator.username.toLowerCase() === creator.username.toLowerCase()) &&
          p.published
      )
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [projects, creator.id, creator.username]);

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(true);
  };

  const isFoundingMember = creator.badge?.trim().toLowerCase() === "founding member";

  // Compact variant: Clean list row (ideal for search popups / compact directory)
  if (variant === "compact") {
    return (
      <Link
        href={`/u/${creator.username}`}
        prefetch={true}
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)]/40 transition-all",
          className
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className={cn(
                "relative h-10 w-10 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)]",
                isFoundingMember && "ring-2 ring-[var(--brand-secondary)]/60 shadow-[0_0_10px_var(--brand-secondary-glow)]"
              )}
            >
              <Image
                src={getValidAvatarUrl(creator.avatarUrl)}
                alt={creator.displayName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            {isFoundingMember && (
              <div className="absolute -bottom-0.5 -right-0.5 z-20">
                <FoundingBadge variant="avatar" size="sm" position="bottom" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-[var(--content-primary)] truncate">
                {creator.displayName}
              </span>
              {creator.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <div className="text-xs text-[var(--content-tertiary)] truncate font-mono">
              @{creator.username} • {creator.city || creator.location || "Global"}
            </div>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[var(--content-secondary)] px-2.5 py-1 rounded-full bg-[var(--bg-neutral)] shrink-0">
          {creatorProjects.length} {creatorProjects.length === 1 ? "work" : "works"}
        </span>
      </Link>
    );
  }

  // Showcase variant: Pick the latest 2 published works
  const previewProjects = creatorProjects.slice(0, 2);

  return (
    <>
      <div
        className={cn(
          "group rounded-[22px] sm:rounded-[26px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-4 sm:p-5 transition-all duration-200 hover:shadow-md hover:border-[var(--content-primary)]/30 space-y-3.5 sm:space-y-4",
          className
        )}
      >
        {/* ================================================================= */}
        {/* 1. HEADER ROW: Avatar, Name, Verified, Location, Handle, Actions  */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Avatar + Identity + Location + Handle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <Link
                href={`/u/${creator.username}`}
                className={cn(
                  "relative block h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-2 ring-[var(--border-neutral)] hover:opacity-90 transition-opacity",
                  isFoundingMember && "ring-[var(--brand-secondary)]/60 dark:ring-[var(--brand-secondary)]/50 shadow-[0_0_12px_var(--brand-secondary-glow)]"
                )}
              >
                <Image
                  src={getValidAvatarUrl(creator.avatarUrl)}
                  alt={creator.displayName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </Link>
              {isFoundingMember && (
                <div className="absolute -bottom-0.5 -right-0.5 z-20">
                  <FoundingBadge variant="avatar" size="default" position="bottom" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/u/${creator.username}`}
                  className="text-sm sm:text-base font-bold text-[var(--content-primary)] transition-colors truncate"
                  title={creator.displayName}
                >
                  {creator.displayName}
                </Link>

                {creator.isVerified && <VerifiedBadge size="sm" />}
                {creator.badge &&
                  !isFoundingMember &&
                  !["superadmin", "super_admin", "admin", "curator", "moderator", "root"].includes(
                    creator.badge.toLowerCase().replace(/[\s_-]/g, "")
                  ) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--chip-bg)] border border-[var(--border-neutral)] px-2 py-0.5 text-[10px] font-bold text-[var(--chip-fg)] uppercase tracking-wider">
                      {creator.badge}
                    </span>
                  )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[var(--content-secondary)] mt-0.5 truncate">
                <span className="inline-flex items-center gap-1 text-[var(--content-tertiary)] truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{creator.city || creator.location || "Global"}</span>
                </span>
                <span className="text-[var(--border-strong)] shrink-0">•</span>
                <span className="text-[var(--content-tertiary)] font-mono truncate shrink-0">
                  @{creator.username}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions (Share + View Profile CTA) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleShareClick}
              className="h-8.5 w-8.5 min-h-[34px] min-w-[34px] rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title={`Share ${creator.displayName}'s profile`}
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <Link
              href={`/u/${creator.username}`}
              prefetch={true}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 px-3.5 h-8.5 text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <span>View Profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. REAL WORKS PREVIEW (Latest 2 published thumbnails)             */}
        {/* ================================================================= */}
        {previewProjects.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            {previewProjects.map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.slug}`}
                prefetch={true}
                className="group/thumb relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-[var(--bg-neutral)] border border-[var(--border-neutral)] block hover:border-[var(--content-primary)]/40 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover/thumb:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-end">
                  <span className="text-white text-xs font-bold truncate drop-shadow-xs">
                    {p.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="pt-2 pb-1 border-t border-[var(--border-neutral)]/60 flex items-center justify-between text-xs text-[var(--content-secondary)] gap-3">
            <span className="truncate max-w-[80%] italic">
              {creator.bio ? `"${creator.bio}"` : "No public projects published yet."}
            </span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-neutral)] text-[var(--content-tertiary)] shrink-0">
              0 Works
            </span>
          </div>
        )}
      </div>

      {/* Creator Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Creator Profile"
        subtitle={`Share ${creator.displayName}'s profile with your network or copy the public link.`}
        creatorName={creator.displayName}
        url={getCanonicalShareUrl(`/u/${creator.username}`)}
      />
    </>
  );
}
