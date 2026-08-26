"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Creator } from "@/lib/mock";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import {
  MapPin,
  Globe,
  Edit3,
  ExternalLink,
  Heart,
  Layers,
  Users,
  Check,
  Share2,
  Bell,
  BellRing,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareModal } from "@/components/ui/share-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";

export function CreatorProfileClient({ initialCreator }: { initialCreator: Creator }) {
  const {
    projects,
    user,
    isFollowingCreator,
    toggleFollowCreator,
  } = useSession();

  const creator = initialCreator;
  if (!creator) {
    notFound();
  }

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "appreciated">("newest");

  const isCurrentUser =
    user && user.username.toLowerCase() === creator.username.toLowerCase();

  const isFollowing = isFollowingCreator(creator.id);

  // Published projects for this creator
  const creatorProjects = useMemo(() => {
    return projects
      .filter(
        (p) =>
          p.creator.username.toLowerCase() === creator.username.toLowerCase() &&
          p.published
      )
      .sort((a, b) => {
        if (sortBy === "appreciated") {
          return b.appreciations - a.appreciations;
        }
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });
  }, [projects, creator.username, sortBy]);

  // Aggregate stats
  const totalAppreciations = creatorProjects.reduce(
    (sum, p) => sum + p.appreciations,
    0
  );

  const followersCount = (creator.followersCount || 120) + (isFollowing ? 1 : 0);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Creators", href: "/creators" },
            { label: creator.displayName, isCurrent: true },
          ]}
        />

        {/* ========================================================================= */}
        {/* 2-COLUMN PROFILE LAYOUT: Sidebar Studio Card (Left) + Works Grid (Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: Sticky Creator Studio Profile Card (4 cols)              */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-7 shadow-[0_12px_32px_rgba(9,12,9,0.04)] space-y-6">
              {/* Creator Avatar & Identity */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="relative h-28 w-28 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] shadow-sm">
                    <Image
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      fill
                      sizes="112px"
                      priority
                      className="object-cover"
                    />
                  </div>
                  <OnlineBadge isOnline={creator.isOnline} size="lg" className="absolute bottom-1 right-1 z-10" />
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <h1
                    className={cn(
                      bricolage.className,
                      "text-2xl font-bold text-[var(--content-primary)]"
                    )}
                  >
                    {creator.displayName}
                  </h1>
                  {creator.isVerified !== false && <VerifiedBadge size="lg" />}
                </div>

                <p className="text-xs font-semibold text-[var(--content-tertiary)] mt-0.5">
                  @{creator.username}
                </p>

                {/* Location & Website */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--content-secondary)] mt-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                    <span>{creator.location || creator.city}</span>
                  </span>

                  {creator.website && (
                    <>
                      <span className="text-[var(--content-tertiary)]">•</span>
                      <a
                        href={creator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--content-link)] hover:underline font-medium"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>Website</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Follow Studio or Manage Profile Action */}
              <div className="pt-2">
                {isCurrentUser ? (
                  <Link href="/me" className="block w-full">
                    <Button variant="secondary" size="default" className="w-full gap-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Manage Studio in /me</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => toggleFollowCreator(creator.id)}
                    variant={isFollowing ? "secondary" : "accent"}
                    size="default"
                    className={cn(
                      "w-full gap-2 font-bold shadow-xs transition-all",
                      isFollowing && "bg-[var(--bg-neutral)] text-[var(--content-primary)] border-[var(--border-neutral)]"
                    )}
                  >
                    {isFollowing ? (
                      <>
                        <BellRing className="h-4 w-4 text-[var(--accent)]" />
                        <span>Following Studio</span>
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Follow Studio</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Bio Statement */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <span className="type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2">
                  Studio Statement
                </span>
                <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
                  {creator.bio}
                </p>
              </div>

              {/* Studio Metrics Grid */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
                    <span className="block text-lg font-bold text-[var(--content-primary)]">
                      {creatorProjects.length}
                    </span>
                    <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                      Works
                    </span>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
                    <span className="block text-lg font-bold text-[var(--content-primary)]">
                      {totalAppreciations}
                    </span>
                    <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                      Hearts
                    </span>
                  </div>

                  <div className="p-3 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
                    <span className="block text-lg font-bold text-[var(--content-primary)]">
                      {followersCount}
                    </span>
                    <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                      Followers
                    </span>
                  </div>
                </div>
              </div>

              {/* Disciplines & Skills */}
              {creator.skills && creator.skills.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-neutral)]">
                  <span className="type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2.5">
                    Disciplines & Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.skills.map((skill) => (
                      <Badge key={skill} variant="neutral" size="sm">
                        #{skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Profile Button */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[var(--bg-neutral)]/50 hover:bg-[var(--bg-neutral)] text-xs font-semibold text-[var(--content-primary)] transition-all cursor-pointer shadow-xs border border-transparent hover:border-[var(--border-neutral)]"
                >
                  <Share2 className="h-3.5 w-3.5 text-[#090C09] dark:text-[#8DFF00]" />
                  <span>Share Studio Profile</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: Creator's Published Works (8 cols)                      */}
          {/* ===================================================================== */}
          <main className="lg:col-span-8 space-y-6">
            {/* Header & Sort Controls */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-[var(--border-neutral)]">
              <div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                  )}
                >
                  Published Works ({creatorProjects.length})
                </h2>
                <p className="type-body-default text-[var(--content-tertiary)] mt-1">
                  Public case studies and visual monographs published by {creator.displayName}.
                </p>
              </div>

              {/* Sort Switcher */}
              <div className="flex items-center gap-1.5 bg-[var(--bg-neutral)] p-1 rounded-full text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-all cursor-pointer",
                    sortBy === "newest"
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                      : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                  )}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("appreciated")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-all cursor-pointer",
                    sortBy === "appreciated"
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                      : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                  )}
                >
                  Most Appreciated
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {creatorProjects.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-10 text-center my-6">
                <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <h3 className="type-title-subsection text-[var(--content-primary)]">
                  No public projects yet
                </h3>
                <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
                  {creator.displayName} has not published any public case studies yet. Follow this studio to get notified when they publish work.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {creatorProjects.map((project, idx) => (
                  <StaggerGridItem key={project.id} index={idx}>
                    <ProjectCard project={project} />
                  </StaggerGridItem>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Studio Profile"
          subtitle={`Share ${creator.displayName}'s portfolio with your network or copy the public link.`}
          creatorName={creator.displayName}
          url={
            typeof window !== "undefined"
              ? `${window.location.origin}/u/${creator.username}`
              : `https://craft.studio/u/${creator.username}`
          }
        />
      </FadeIn>
    </div>
  );
}
