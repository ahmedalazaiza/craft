"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Creator } from "@/lib/mock";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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
  Plus,
  Share2,
  FolderKanban,
  X,
  FileText,
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
    updateProfile,
  } = useSession();

  const isCurrentUser =
    user && user.username.toLowerCase() === initialCreator.username.toLowerCase();

  // If viewing own profile, use live user data from session context if updated
  const creator = isCurrentUser && user ? user : initialCreator;

  if (!creator) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "appreciated">("newest");

  // Profile Edit Form State
  const [editName, setEditName] = useState(creator.displayName);
  const [editBio, setEditBio] = useState(creator.bio || "");
  const [editLocation, setEditLocation] = useState(creator.location || creator.city || "");
  const [editWebsite, setEditWebsite] = useState(creator.website || "");

  useEffect(() => {
    if (creator) {
      setEditName(creator.displayName);
      setEditBio(creator.bio || "");
      setEditLocation(creator.location || creator.city || "");
      setEditWebsite(creator.website || "");
    }
  }, [creator]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: editName,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
    });
    setIsEditingProfile(false);
  };

  const isFollowing = isFollowingCreator(creator.id);

  // All projects for this creator (published and drafts)
  const allCreatorProjects = useMemo(() => {
    return projects.filter(
      (p) => p.creator.username.toLowerCase() === creator.username.toLowerCase()
    );
  }, [projects, creator.username]);

  const publishedProjects = useMemo(() => {
    return allCreatorProjects
      .filter((p) => p.published)
      .sort((a, b) => {
        if (sortBy === "appreciated") {
          return b.appreciations - a.appreciations;
        }
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      });
  }, [allCreatorProjects, sortBy]);

  const draftProjects = useMemo(() => {
    return allCreatorProjects.filter((p) => !p.published);
  }, [allCreatorProjects]);

  const displayedProjects = activeTab === "published" ? publishedProjects : draftProjects;

  // Aggregate stats
  const totalAppreciations = publishedProjects.reduce(
    (sum, p) => sum + p.appreciations,
    0
  );

  const followersCount = (creator.followersCount || 120) + (isFollowing && !isCurrentUser ? 1 : 0);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: Sticky Creator Studio Profile Card (Sleek 3 cols)        */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
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

              {/* Action Buttons: Edit Profile (for owner) or Follow (for public) + Share */}
              <div className="pt-2 flex items-center gap-2.5">
                {isCurrentUser ? (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    variant="secondary"
                    size="default"
                    className="flex-1 gap-2 font-bold"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => toggleFollowCreator(creator.id)}
                    variant={isFollowing ? "secondary" : "accent"}
                    size="default"
                    className="flex-1 gap-2 font-bold transition-all"
                  >
                    {isFollowing ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsShareModalOpen(true)}
                  className="transition-transform hover:scale-105 active:scale-95"
                  title={`Share ${creator.displayName}'s profile`}
                  aria-label="Share Profile"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Bio Statement */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <span className="type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2">
                  About
                </span>
                <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
                  {creator.bio}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-[16px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]">
                    <span className="block text-lg font-bold text-[var(--content-primary)]">
                      {publishedProjects.length}
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
            </div>
          </aside>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: Works & Studio Dashboard (9 cols on desktop)            */}
          {/* ===================================================================== */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
            {/* Header & Tab Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-neutral)]">
              {isCurrentUser ? (
                /* Studio Owner Tabs (Published vs Drafts) */
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("published")}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "published"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                        : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                    )}
                  >
                    Published Works ({publishedProjects.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("drafts")}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
                      activeTab === "drafts"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                        : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                    )}
                  >
                    Drafts ({draftProjects.length})
                  </button>
                </div>
              ) : (
                /* Public Visitor Header */
                <div>
                  <h2
                    className={cn(
                      bricolage.className,
                      "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                    )}
                  >
                    Published Works ({publishedProjects.length})
                  </h2>
                  <p className="type-body-default text-[var(--content-tertiary)] mt-1">
                    Public case studies and visual monographs published by {creator.displayName}.
                  </p>
                </div>
              )}

              {/* Action Toolbar on Right (Sort Switcher or New Project CTA) */}
              <div className="flex items-center gap-3">
                {isCurrentUser ? (
                  /* Only show + New Project button if current active tab has > 0 projects to avoid duplicates */
                  displayedProjects.length > 0 && (
                    <Link href="/me/projects/new">
                      <Button variant="accent" size="sm" className="gap-1.5 font-bold shadow-xs">
                        <Plus className="h-4 w-4" />
                        <span>New Project</span>
                      </Button>
                    </Link>
                  )
                ) : (
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
                )}
              </div>
            </div>

            {/* Projects Grid / Empty State */}
            {displayedProjects.length === 0 ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 text-center my-6">
                <div className="h-14 w-14 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
                  <FolderKanban className="h-7 w-7" />
                </div>

                <h3 className="type-title-subsection text-[var(--content-primary)]">
                  {isCurrentUser
                    ? activeTab === "published"
                      ? "No published projects yet"
                      : "No draft projects"
                    : "No public projects yet"}
                </h3>

                <p className="mt-2 type-body-default text-[var(--content-secondary)] max-w-md">
                  {isCurrentUser
                    ? activeTab === "published"
                      ? "Publish your first monograph or design case study to showcase your visual craft to the community."
                      : "You don't have any saved drafts. Start a new project to save your progress."
                    : `${creator.displayName} has not published any public case studies yet.`}
                </p>

                {isCurrentUser && (
                  <Link href="/me/projects/new" className="mt-6">
                    <Button variant="accent" size="default" className="gap-2 font-bold shadow-xs">
                      <Plus className="h-4 w-4" />
                      <span>{activeTab === "published" ? "Create First Project" : "Start New Draft"}</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayedProjects.map((project, idx) => (
                  <StaggerGridItem key={project.id} index={idx}>
                    <ProjectCard project={project} />
                  </StaggerGridItem>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-neutral)] mb-6">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-[var(--primary-forest-green)]" />
                  <h2 className="type-title-section text-[var(--content-primary)]">
                    Edit Studio Profile
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-full p-1.5 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                    Display Name
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                    About / Bio
                  </label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    placeholder="Tell the community about your design philosophy and disciplines..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                      Location / City
                    </label>
                    <Input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="e.g. Berlin, Germany"
                    />
                  </div>

                  <div>
                    <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                      Website URL
                    </label>
                    <Input
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="https://studio.design"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-neutral)] mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" className="font-bold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="Share Profile"
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
