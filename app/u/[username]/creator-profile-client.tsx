"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Creator } from "@/lib/types";
import { bricolage } from "@/lib/fonts";

import { ProjectCard } from "@/components/project/project-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import {
  MapPin,
  Globe,
  Edit3,
  ExternalLink,
  Check,
  Plus,
  Share2,
  Settings,
  FolderKanban,
  X,
  Camera,
  Loader2,
} from "lucide-react";
import { cn, normalizeUrl, formatDisplayUrl } from "@/lib/utils";
import { ShareModal } from "@/components/ui/share-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { uploadMediaFile } from "@/lib/supabase/storage";
import { DEFAULT_AVATAR_URL, getValidAvatarUrl } from "@/lib/avatar";
import { LocationInput } from "@/components/ui/location-input";
import { SkillsPicker } from "@/components/onboarding/skills-picker";

export function CreatorProfileClient({ initialCreator }: { initialCreator: Creator }) {
  const {
    projects,
    creators,
    user,
    isFollowingCreator,
    toggleFollowCreator,
    updateProfile,
    isLoadingDb,
  } = useSession();

  const isCurrentUser =
    user && user.username.toLowerCase() === initialCreator.username.toLowerCase();

  // Grab the live creator data from session context (tracks live followersCount & profile updates)
  const liveCreator = creators.find(
    (c) => c.username.toLowerCase() === initialCreator.username.toLowerCase()
  );

  const creator =
    liveCreator || (isCurrentUser && user ? user : initialCreator);

  const isDeleted =
    !isLoadingDb && creators.length > 0 && !liveCreator && !isCurrentUser;

  if (isDeleted || !creator) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "appreciated">("newest");

  // Profile Edit Form State
  const [editName, setEditName] = useState(creator.displayName);
  const [editBio, setEditBio] = useState(creator.bio || "");
  const [editLocation, setEditLocation] = useState(creator.location || creator.city || "");
  const [editWebsite, setEditWebsite] = useState(creator.website || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(creator.avatarUrl);
  const [editSkills, setEditSkills] = useState<string[]>(creator.skills || []);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creator) {
      setEditName(creator.displayName);
      setEditBio(creator.bio || "");
      setEditLocation(creator.location || creator.city || "");
      setEditWebsite(creator.website || "");
      setEditAvatarUrl(creator.avatarUrl);
      setEditSkills(creator.skills || []);
    }
  }, [creator]);

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const cdnUrl = await uploadMediaFile(file, "project-media", "avatars");
      setEditAvatarUrl(cdnUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: editName,
        bio: editBio,
        location: editLocation,
        city: editLocation,
        website: normalizeUrl(editWebsite),
        avatarUrl: editAvatarUrl,
        skills: editSkills,
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSaving(false);
    }
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

  const totalAppreciations = publishedProjects.reduce(
    (sum, p) => sum + p.appreciations,
    0
  );

  const followersCount = creator.followersCount ?? 0;

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
                  <div
                    onClick={() => {
                      if (isCurrentUser) setIsEditingProfile(true);
                    }}
                    className={cn(
                      "group relative h-28 w-28 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] shadow-sm",
                      isCurrentUser && "cursor-pointer hover:ring-[var(--primary-forest-green)] transition-all"
                    )}
                    title={isCurrentUser ? "Click to edit studio profile & avatar" : undefined}
                  >
                    <Image
                      src={getValidAvatarUrl(creator.avatarUrl)}
                      alt={creator.displayName}
                      fill
                      sizes="112px"
                      priority
                      className="object-cover"
                    />
                    {isCurrentUser && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                        <Camera className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Edit</span>
                      </div>
                    )}
                  </div>
                  <OnlineBadge userId={creator.id} username={creator.username} size="lg" className="absolute bottom-1.5 right-1.5 z-20" />
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
                    <span>{creator.location || creator.city || "Earth"}</span>
                  </span>

                  {creator.website && (
                    <>
                      <span className="text-[var(--content-tertiary)]">•</span>
                      <a
                        href={normalizeUrl(creator.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--content-link)] hover:underline font-medium truncate max-w-[200px]"
                      >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{formatDisplayUrl(creator.website)}</span>
                        <ExternalLink className="h-3 w-3 opacity-60 shrink-0" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit Profile (for owner) or Follow (for public) + Settings + Share */}
              <div className="pt-2 flex items-center gap-2.5">
                {isCurrentUser ? (
                  <>
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      variant="secondary"
                      size="default"
                      className="flex-1 gap-2 font-bold"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Button>

                    <Link
                      href="/settings"
                      className={buttonVariants({
                        variant: "secondary",
                        size: "icon",
                        className: "transition-transform hover:scale-105 active:scale-95",
                      })}
                      title="Account Settings"
                      aria-label="Account Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </>
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
                  {creator.bio || "Layerat community designer and visual creator."}
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
                  displayedProjects.length > 0 && (
                    <Link
                      href="/me/projects/new"
                      className={buttonVariants({
                        variant: "accent",
                        size: "sm",
                        className: "hidden sm:inline-flex gap-1.5 font-bold shadow-xs",
                      })}
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Project</span>
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
                  <Link
                    href="/me/projects/new"
                    className={buttonVariants({
                      variant: "accent",
                      size: "default",
                      className: "mt-6 gap-2 font-bold shadow-xs",
                    })}
                  >
                    <Plus className="h-4 w-4" />
                    <span>{activeTab === "published" ? "Create First Project" : "Start New Draft"}</span>
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
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-5 sm:p-8 shadow-2xl">
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
                  className="rounded-full p-1.5 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* 1. Avatar Uploader */}
                <div className="flex flex-col items-center justify-center pb-2">
                  <div
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="group relative h-24 w-24 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] hover:ring-[var(--primary-forest-green)] transition-all cursor-pointer shadow-md"
                    title="Click to change profile picture"
                  >
                    <Image
                      src={getValidAvatarUrl(editAvatarUrl)}
                      alt={editName}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                      {isUploadingAvatar ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      ) : (
                        <>
                          <Camera className="h-5 w-5" />
                          <span className="text-[10px] font-bold">Change</span>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    ref={avatarFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="mt-2 text-xs font-semibold text-[var(--primary-forest-green)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>{isUploadingAvatar ? "Uploading photo..." : "Change Profile Photo"}</span>
                  </button>
                </div>

                {/* 2. Display Name */}
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

                {/* 3. About / Bio with 280 Max Char Limit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="type-body-default-bold text-[var(--content-primary)]">
                      About / Bio
                    </label>
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold",
                        editBio.length >= 280
                          ? "text-[var(--negative)]"
                          : editBio.length >= 240
                          ? "text-amber-500"
                          : "text-[var(--content-tertiary)]"
                      )}
                    >
                      {editBio.length}/280 max
                    </span>
                  </div>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value.slice(0, 280))}
                    maxLength={280}
                    rows={3}
                    placeholder="Tell the community about your design philosophy and disciplines (max 280 chars)..."
                  />
                </div>

                {/* 4. Location with Autocomplete & Website */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location Autosuggest Field with IP Auto-Detect */}
                  <LocationInput
                    value={editLocation}
                    onChange={setEditLocation}
                    label="Location / City"
                    placeholder="e.g. Berlin, Germany"
                    showPresets={false}
                    enableAutoDetect={true}
                  />

                  <div>
                    <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                      Website URL
                    </label>
                    <Input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="www.yourdomain.com or https://..."
                    />
                  </div>
                </div>

                {/* 5. Disciplines & Specializations */}
                <div className="pt-2 border-t border-[var(--border-neutral)]">
                  <SkillsPicker
                    selectedSkills={editSkills}
                    onChange={setEditSkills}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-neutral)] mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    className="font-bold"
                    disabled={isSaving || isUploadingAvatar}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
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
              : `https://layerat.com/u/${creator.username}`
          }
        />
      </FadeIn>
    </div>
  );
}
