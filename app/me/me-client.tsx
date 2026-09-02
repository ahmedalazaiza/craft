"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { NewProjectLink } from "@/components/project/new-project-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import {
  Plus,
  Edit3,
  ExternalLink,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  X,
  Sparkles,
  Share2,
  Settings,
  Check,
  FolderKanban,
  Users,
} from "lucide-react";
import { cn, normalizeUrl, formatDisplayUrl } from "@/lib/utils";
import { ShareModal } from "@/components/ui/share-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { CreatorProfileSkeleton } from "@/components/creator/creator-profile-skeleton";
import { EditProfileModal } from "@/components/creator/edit-profile-modal";
import { getCanonicalShareUrl } from "@/lib/seo";

export function MeClient() {
  const router = useRouter();
  const { user, projects, updateProfile, isLoadingDb } = useSession();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(user?.displayName || "");
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editLocation, setEditLocation] = useState(user?.location || "");
  const [editWebsite, setEditWebsite] = useState(user?.website || "");

  // Synchronize edit fields and forward to canonical username route
  React.useEffect(() => {
    if (user) {
      setEditName(user.displayName);
      setEditBio(user.bio || "");
      setEditLocation(user.location || "");
      setEditWebsite(user.website || "");
      router.replace(`/u/${user.username}`);
    }
  }, [user, router]);

  // While session/auth is initializing from Supabase on reload and no cached user, show smooth profile skeleton
  if (isLoadingDb && !user) {
    return <CreatorProfileSkeleton />;
  }

  // If user is truly guest after loading completes, prompt to login
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 shadow-sm">
          <h1 className="type-title-section text-[var(--content-primary)]">
            Member Authentication Required
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            You must be signed in to access your studio workspace and manage your portfolio projects.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/login"
              prefetch={true}
              className={buttonVariants({ variant: "accent" })}
            >
              Log in to continue
            </Link>
            <Link
              href="/signup"
              prefetch={true}
              className={buttonVariants({ variant: "secondary" })}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter projects belonging to current user
  const userProjects = projects.filter(
    (p) => p.creator.username.toLowerCase() === user.username.toLowerCase()
  );
  const publishedProjects = userProjects.filter((p) => p.published);
  const draftProjects = userProjects.filter((p) => !p.published);
  const totalAppreciations = userProjects.reduce(
    (sum, p) => sum + p.appreciations,
    0
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: editName,
      bio: editBio,
      location: editLocation,
      website: normalizeUrl(editWebsite),
    });
    setIsEditingProfile(false);
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && user) {
      navigator.clipboard.writeText(getCanonicalShareUrl(`/u/${user.username}`));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "My Profile", href: "/me" },
            { label: activeTab === "published" ? "Published Projects" : "Drafts", isCurrent: true },
          ]}
        />

        {/* ========================================================================= */}
        {/* 2-COLUMN PROFILE DASHBOARD LAYOUT (Identical to Creator Profile Structure) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: Sticky Profile Card (Sleek 3 cols on desktop)           */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-7 shadow-[0_12px_32px_rgba(9,12,9,0.04)] space-y-6">
              {/* Creator Avatar & Identity */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[var(--border-neutral)] shadow-md bg-[var(--bg-neutral)]">
                    <Image
                      src={getValidAvatarUrl(user.avatarUrl)}
                      alt={user.displayName}
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-center">
                  <h1
                    className={cn(
                      bricolage.className,
                      "text-xl font-bold text-[var(--content-primary)]"
                    )}
                  >
                    {user.displayName}
                  </h1>
                  {user.isVerified !== false && <VerifiedBadge size="default" />}
                </div>

                <p className="type-body-small text-[var(--content-tertiary)] mt-0.5">
                  @{user.username}
                </p>

                {/* Location & Website */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--content-secondary)] mt-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                    <span>{user.city || user.location || "Global"}</span>
                  </span>

                  {user.website && (
                    <>
                      <span className="text-[var(--content-tertiary)]">•</span>
                      <a
                        href={normalizeUrl(user.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--content-link)] hover:underline font-medium"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>{formatDisplayUrl(user.website)}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit Profile + Settings + Share Icon & View Public Profile */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="secondary"
                    size="default"
                    onClick={() => {
                      setEditName(user.displayName);
                      setEditBio(user.bio);
                      setEditLocation(user.location);
                      setEditWebsite(user.website || "");
                      setIsEditingProfile(true);
                    }}
                    className="flex-1 gap-2 font-semibold"
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

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => setIsShareModalOpen(true)}
                    className="transition-transform hover:scale-105 active:scale-95"
                    title="Share Profile"
                    aria-label="Share Profile"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <Link href={`/u/${user.username}`} className="block w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-1.5 text-xs text-[var(--content-link)] hover:text-[var(--content-link-hover)]"
                  >
                    <span>View Public Profile</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <span className="type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block">
                  Bio
                </span>
                <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
                  {user.bio}
                </p>
              </div>

              {/* Metrics Grid with Icons */}
              <div className="pt-2 border-t border-[var(--border-neutral)]">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div
                    title="Projects"
                    className="p-3 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] flex flex-col items-center justify-center gap-1.5"
                  >
                    <FolderKanban className="h-4 w-4 text-[var(--content-secondary)] shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-[var(--content-primary)] font-mono leading-none">
                      {publishedProjects.length}
                    </span>
                  </div>

                  <div
                    title="Appreciations"
                    className="p-3 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] flex flex-col items-center justify-center gap-1.5"
                  >
                    <Heart className="h-4 w-4 text-[var(--content-secondary)] shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-[var(--content-primary)] font-mono leading-none">
                      {totalAppreciations}
                    </span>
                  </div>

                  <div
                    title="Followers"
                    className="p-3 rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] flex flex-col items-center justify-center gap-1.5"
                  >
                    <Users className="h-4 w-4 text-[var(--content-secondary)] shrink-0" />
                    <span className="text-base sm:text-lg font-bold text-[var(--content-primary)] font-mono leading-none">
                      {user.followersCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disciplines & Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-neutral)]">
                  <span className="type-label font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2.5">
                    Disciplines & Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill) => (
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
          {/* RIGHT COLUMN: Studio Projects Management (9 cols on desktop)          */}
          {/* ===================================================================== */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
            {/* Header Toolbar: Tabs on Left + New Project Button on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-neutral)]">
              {/* Tab Switcher: Published vs Drafts */}
              <div className="flex items-center gap-1.5 bg-[var(--bg-neutral)] p-1 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("published")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                    activeTab === "published"
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                      : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                  )}
                >
                  Published ({publishedProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("drafts")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full transition-all cursor-pointer",
                    activeTab === "drafts"
                      ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                      : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                  )}
                >
                  Drafts ({draftProjects.length})
                </button>
              </div>

              {/* + New Project CTA */}
              {((activeTab === "published" && publishedProjects.length > 0) ||
                (activeTab === "drafts" && draftProjects.length > 0)) && (
                <NewProjectLink size="sm" className="text-xs sm:text-sm">
                  New Project
                </NewProjectLink>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === "published" ? (
              publishedProjects.length === 0 ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-primary)] mb-4">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <h3 className="type-title-subsection text-[var(--content-primary)]">
                    No published projects yet
                  </h3>
                  <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
                    Publish your first case study or design monograph to showcase your work to the community.
                  </p>
                  <NewProjectLink size="default" className="mt-6 gap-2">
                    Create First Project
                  </NewProjectLink>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {publishedProjects.map((project, idx) => (
                    <StaggerGridItem key={project.id} index={idx} className="relative group">
                      <ProjectCard project={project} />
                      {/* Floating Quick Edit Button overlay on card */}
                      <div className="absolute top-3 right-3 z-20">
                        <Link href={`/me/projects/${project.id}`}>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--base-dark)]/85 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[var(--base-dark)] transition-all cursor-pointer border border-white/10"
                            title="Edit this project"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                        </Link>
                      </div>
                    </StaggerGridItem>
                  ))}
                </div>
              )
            ) : draftProjects.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-10 text-center">
                <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="type-title-subsection text-[var(--content-primary)]">
                  No draft projects
                </h3>
                <p className="mt-1.5 type-body-default text-[var(--content-secondary)] max-w-sm">
                  Unpublished monographs and works in progress will be saved here safely.
                </p>
                <NewProjectLink variant="secondary" size="default" className="mt-6 gap-2 font-semibold">
                  Start a Draft
                </NewProjectLink>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {draftProjects.map((project, idx) => (
                  <StaggerGridItem key={project.id} index={idx} className="relative group">
                    <ProjectCard project={project} />
                    <div className="absolute top-3 right-3 z-20">
                      <Link href={`/me/projects/${project.id}`}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--base-dark)]/85 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-[var(--base-dark)] transition-all cursor-pointer border border-white/10"
                          title="Edit this draft"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit Draft</span>
                        </button>
                      </Link>
                    </div>
                  </StaggerGridItem>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Edit Profile Modal Dialog */}
        {user && (
          <EditProfileModal
            isOpen={isEditingProfile}
            onClose={() => setIsEditingProfile(false)}
            creator={user}
          />
        )}

        {/* Profile Share Modal */}
        {user && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            title="Share Profile"
            subtitle={`Share ${user.displayName}'s portfolio with your network or copy the public link.`}
            creatorName={user.displayName}
            url={getCanonicalShareUrl(`/u/${user.username}`)}
          />
        )}
      </FadeIn>
    </div>
  );
}
