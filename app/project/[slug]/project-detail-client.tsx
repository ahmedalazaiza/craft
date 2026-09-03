"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import { Project } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "@/components/project/comment-section";
import { ProjectLightbox } from "@/components/project/project-lightbox";
import { ShareModal } from "@/components/ui/share-modal";
import { useSession } from "@/lib/session-context";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { ReportModal } from "@/components/ui/report-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { getValidAvatarUrl } from "@/lib/avatar";
import { getCanonicalShareUrl } from "@/lib/seo";
import { DeleteProjectModal } from "@/components/project/delete-project-modal";
import { incrementProjectViewsInDb } from "@/lib/supabase/queries";
import {
  Heart,
  MessageSquare,
  Share2,
  Maximize2,
  Tag,
  Wrench,
  Edit3,
  Trash2,
  Send,
  Loader2,
  CheckCircle2,
  X,
  FolderKanban,
  Lock,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectDetailClientProps {
  initialProject: Project;
}

export function ProjectDetailClient({ initialProject }: ProjectDetailClientProps) {
  const router = useRouter();
  const {
    projects,
    user,
    isProjectAppreciated,
    toggleAppreciation,
    saveProject,
    isLoadingDb,
    isAuthReady,
  } = useSession();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishToast, setPublishToast] = useState<string | null>(null);

  // Grab live project data from session context if updated
  const liveProject = projects.find((p) => p.id === initialProject.id || p.slug === initialProject.slug);
  const project = liveProject || initialProject;

  const isDeleted = !isLoadingDb && projects.length > 0 && !liveProject;

  if (isDeleted) {
    notFound();
  }

  const isAppreciated = isProjectAppreciated(project.id);

  const isAuthor = Boolean(
    user &&
    project.creator &&
    (
      (user.id && project.creator.id && user.id === project.creator.id) ||
      (user.username && project.creator.username && user.username.toLowerCase() === project.creator.username.toLowerCase())
    )
  );

  const isDraft = project.published === false;

  // Track project view in database on mount (deduplicated & excluding drafts/author)
  const hasTrackedView = React.useRef(false);

  React.useEffect(() => {
    if (!project?.id || hasTrackedView.current) return;
    if (isDraft || isAuthor) return;

    // Deduplicate views per browser session to prevent artificial inflation on reload
    const sessionKey = `viewed_project_${project.id}`;
    if (typeof window !== "undefined") {
      try {
        if (sessionStorage.getItem(sessionKey)) {
          return;
        }
        sessionStorage.setItem(sessionKey, "1");
      } catch {
        // Ignore sessionStorage errors in restricted environments
      }
    }

    hasTrackedView.current = true;
    incrementProjectViewsInDb(project.id);
  }, [project?.id, isDraft, isAuthor]);

  // Strict draft security gate: block incognito / non-author visitors
  if (isDraft) {
    if (!isAuthReady) {
      return (
        <div className="w-full px-4 sm:px-6 lg:px-[140px] py-24 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--content-primary)]" />
        </div>
      );
    }
    if (!isAuthor) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mb-4 shadow-xs">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight">Project Not Found</h1>
          <p className="mt-2 text-sm text-[var(--content-secondary)] leading-relaxed">This project is private, in draft status, or does not exist.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/explore" className={buttonVariants({ variant: "accent", size: "default" })}>
              Explore Showcase
            </Link>
          </div>
        </div>
      );
    }
  }

  const displayDate = React.useMemo(() => {
    if (isDraft) return "Draft • Unpublished";
    if (!project.publishedAt) return "Recently Published";
    const parsed = new Date(project.publishedAt);
    if (isNaN(parsed.getTime())) return "Recently Published";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [isDraft, project.publishedAt]);

  const handleToggleAppreciation = () => {
    toggleAppreciation(project.id);
  };

  const handleScrollToComments = () => {
    const el = document.getElementById("comments-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handlePublishProject = async () => {
    if (isPublishing || !project.id) return;
    setIsPublishing(true);
    try {
      await saveProject({
        id: project.id,
        title: project.title,
        published: true,
        publishedAt: new Date().toISOString(),
      });
      setPublishToast("🎉 Project published live! It is now visible on Explore.");
      setTimeout(() => setPublishToast(null), 6000);
    } catch (err) {
      console.error("Failed to publish project:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const allImages = React.useMemo(() => {
    const gallery = (project.galleryImages || []).filter(Boolean);
    if (gallery.length > 0) {
      if (project.coverImage && !gallery.includes(project.coverImage)) {
        return [project.coverImage, ...gallery];
      }
      return gallery;
    }
    return project.coverImage ? [project.coverImage] : [];
  }, [project.coverImage, project.galleryImages]);

  return (
    <article className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 pb-28 sm:pb-32">
      <FadeIn>
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            {
              label: project.category,
              href: `/explore?category=${encodeURIComponent(project.category)}`,
            },
            { label: project.title, isCurrent: true },
          ]}
        />

        {/* Publish Toast Notification */}
        {publishToast && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 mb-6 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold animate-scale-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{publishToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setPublishToast(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:opacity-80 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Private Draft Notice Banner for Author */}
        {isDraft && isAuthor && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">
                Private Draft Monograph • Visible only to you until published.
              </p>
            </div>
            <Button
              type="button"
              variant="accent"
              size="sm"
              disabled={isPublishing}
              onClick={handlePublishProject}
              className="text-xs font-bold gap-1.5 shrink-0"
            >
              {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Publish Live</span>
            </Button>
          </div>
        )}

        {/* =================================================================== */}
        {/* 1. PROJECT HEADER BAR: Info, Tags & Tools Chip Matrix, Metas        */}
        {/* =================================================================== */}
        <div className="space-y-6 mb-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)]">
            <div className="space-y-3 flex-1 min-w-0">
              {(isDraft || project.featured) && (
                <div className="flex flex-wrap items-center gap-2">
                  {isDraft && (
                    <Badge variant="neutral" size="default" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-mono font-bold">
                      Draft • Unpublished
                    </Badge>
                  )}
                  {project.featured && (
                    <Badge variant="forest" size="default">
                      Featured Work
                    </Badge>
                  )}
                </div>
              )}

              <h1
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl lg:text-[42px] font-black text-[var(--content-primary)] leading-[1.1] tracking-tight"
                )}
              >
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--content-secondary)]">
                <Link
                  href={`/u/${project.creator.username}`}
                  prefetch={true}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity font-bold text-[var(--content-primary)]"
                >
                  <div className="relative h-6 w-6 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)]">
                    <Image
                      src={getValidAvatarUrl(project.creator.avatarUrl)}
                      alt={project.creator.displayName}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </div>
                  <span>{project.creator.displayName}</span>
                  {project.creator.isVerified !== false && <VerifiedBadge size="sm" />}
                </Link>

                <span className="text-[var(--content-tertiary)]">•</span>
                <span>{project.creator.city || project.creator.location || "Global"}</span>
                {!isDraft && (
                  <>
                    <span className="text-[var(--content-tertiary)]">•</span>
                    <span>{displayDate}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Meta Column & Author Actions */}
            <div className="flex flex-col md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
                <span className="text-[var(--content-secondary)]">
                  <strong className="text-[var(--content-primary)] font-bold">{project.appreciations}</strong> appreciations
                </span>
                <span className="text-[var(--content-tertiary)]">•</span>
                <span className="text-[var(--content-secondary)]">
                  <strong className="text-[var(--content-primary)] font-bold">{project.views ?? 0}</strong> views
                </span>
                <span className="text-[var(--content-tertiary)]">•</span>
                <span className="text-[var(--content-secondary)]">
                  <strong className="text-[var(--content-primary)] font-bold">{project.comments?.length || 0}</strong> comments
                </span>
              </div>

              {isAuthor && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* If Draft, Show Direct Publish Button */}
                  {isDraft ? (
                    <Button
                      type="button"
                      variant="accent"
                      size="default"
                      disabled={isPublishing}
                      onClick={handlePublishProject}
                      className="shrink-0 gap-2 font-bold shadow-md"
                    >
                      {isPublishing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>{isPublishing ? "Publishing..." : "Publish Project"}</span>
                    </Button>
                  ) : null}

                  {/* Edit Case Study Link */}
                  <Link
                    href={`/me/projects/${project.id}`}
                    prefetch={true}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "default",
                      className: "shrink-0 gap-2 font-bold shadow-xs",
                    })}
                    title="Edit Case Study"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isDraft ? "Edit Details" : "Edit Case Study"}</span>
                  </Link>

                  {/* Delete Project Button */}
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="h-10 w-10 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                    title="Delete Project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* ================================================================= */}
          {/* 2. MAIN LAYOUT: Left Floating Rail + Continuous Image Stack       */}
          {/* ================================================================= */}
          <div className="relative flex items-start gap-6 lg:gap-10">
            {/* ------------------------------------------------------------- */}
            {/* LEFT FLOATING STICKY ACTION RAIL (DESKTOP)                     */}
            {/* ------------------------------------------------------------- */}
            <aside className="hidden md:flex flex-col items-center sticky top-28 h-fit shrink-0 z-20">
              <div className="flex flex-col items-center gap-3 p-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/90 backdrop-blur-md shadow-sm">
                {!isDraft && (
                  <>
                    {/* 1. Appreciation Button (Hidden for author - cannot like own project) */}
                    {!isAuthor && (
                      <button
                        type="button"
                        onClick={handleToggleAppreciation}
                        className={cn(
                          "h-12 w-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none group border-0 shadow-xs",
                          isAppreciated
                            ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-md scale-105"
                            : "bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                        )}
                        title={isAppreciated ? "Unlike project" : "Appreciate project"}
                        aria-label={isAppreciated ? `Remove appreciation (${project.appreciations})` : `Appreciate project (${project.appreciations})`}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                            isAppreciated ? "fill-current scale-110" : "text-[var(--content-primary)]"
                          )}
                        />
                        <span className="text-[10px] font-bold font-mono tracking-tight mt-0.5">
                          {project.appreciations}
                        </span>
                      </button>
                    )}

                    {/* 2. Discussion / Comments Scroll Trigger */}
                    <button
                      type="button"
                      onClick={handleScrollToComments}
                      className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all cursor-pointer select-none group relative"
                      title="Jump to critique & discussion"
                      aria-label="Jump to critique & discussion"
                    >
                      <MessageSquare className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      {project.comments && project.comments.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-1 text-[9px] font-mono font-bold">
                          {project.comments.length}
                        </span>
                      )}
                    </button>

                    {/* 3. Social Share Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all cursor-pointer select-none group"
                      title="Share Project"
                      aria-label="Share Project"
                    >
                      <Share2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </button>

                    {/* 4. Report Project (Non-author) */}
                    {!isAuthor && (
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="h-10 w-10 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-tertiary)] hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer select-none group"
                        title="Report Project"
                        aria-label="Report Project"
                      >
                        <Flag className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                      </button>
                    )}
                  </>
                )}

                {/* 4. Author Action Icons */}
                {isAuthor && (
                  <>
                    {isDraft && (
                      <button
                        type="button"
                        onClick={handlePublishProject}
                        disabled={isPublishing}
                        className="h-12 w-12 rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] hover:opacity-90 flex items-center justify-center transition-all cursor-pointer select-none group shadow-xs"
                        title="Publish Project Live"
                        aria-label="Publish Project Live"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        )}
                      </button>
                    )}

                    <Link
                      href={`/me/projects/${project.id}`}
                      className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all cursor-pointer select-none group"
                      title="Edit Case Study"
                      aria-label="Edit Case Study"
                    >
                      <Edit3 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="h-12 w-12 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 flex items-center justify-center transition-all cursor-pointer select-none group"
                      title="Delete Project"
                      aria-label="Delete Project"
                    >
                      <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                  </>
                )}
              </div>

              {/* Separated 4th Action: Publisher Profile Avatar */}
              <div className="mt-4 pt-2">
                <Link
                  href={`/u/${project.creator.username}`}
                  className="group relative block h-12 w-12 rounded-full ring-2 ring-[var(--border-neutral)] hover:ring-[var(--primary-forest-green)] transition-all shadow-md"
                  title={`View ${project.creator.displayName}'s studio profile`}
                >
                  <div className="relative h-full w-full rounded-full overflow-hidden">
                    <Image
                      src={getValidAvatarUrl(project.creator.avatarUrl)}
                      alt={project.creator.displayName}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </Link>
              </div>
            </aside>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT/CENTER: Continuous Image List (0px Gap, Seamless Stack) */}
            {/* ------------------------------------------------------------- */}
            <main className="flex-1 min-w-0">
              <div className="flex flex-col gap-0 w-full rounded-none overflow-hidden border-0 shadow-sm">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className="relative w-full rounded-none bg-[var(--bg-neutral)] overflow-hidden cursor-pointer select-none group"
                  >
                    <Image
                      src={img}
                      alt={`${project.title} gallery image ${idx + 1}`}
                      width={1200}
                      height={900}
                      className="w-full h-auto object-cover transition-opacity duration-300 group-hover:opacity-95"
                      priority={idx === 0}
                    />

                    {/* Subtle Zoom/Expand Overlay */}
                    <div className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 backdrop-blur-xs text-[var(--content-primary)] opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* ----------------------------------------------------------- */}
              {/* EDITORIAL NARRATIVE & METADATA SECTION                     */}
              {/* ----------------------------------------------------------- */}
              <div className="mt-12 space-y-10">
                {/* Body Case Study Narrative */}
                <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-10 shadow-xs">
                  <h2 className="type-title-section text-[var(--content-primary)] mb-4">
                    About this Project
                  </h2>
                  <div className="type-body-large text-[var(--content-secondary)] leading-relaxed whitespace-pre-line font-normal">
                    {project.body || project.summary}
                  </div>
                </div>

                {/* Project Details: Categories, Disciplines, Tags & Tools Matrix */}
                <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-10 shadow-xs space-y-8">
                  {/* Creative Fields & Categories */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[var(--content-tertiary)]" />
                      <h3 className="type-label uppercase text-[var(--content-primary)] font-bold text-xs tracking-wider font-mono">
                        Creative Fields & Categories
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(project.categories && project.categories.length > 0
                        ? project.categories
                        : [project.category]
                      ).map((cat) => (
                        <Link
                          key={cat}
                          href={`/explore?category=${encodeURIComponent(cat)}`}
                          className="rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] px-3.5 py-1.5 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                        >
                          {cat}
                        </Link>
                      ))}
                      {project.medium && (
                        <span className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-1.5 text-xs font-semibold text-[var(--content-secondary)]">
                          {project.medium}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags and Tools Sub-grid */}
                  {(project.tags?.length > 0 || project.tools?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[var(--border-neutral)]">
                      {/* Tags */}
                      {project.tags?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="type-label uppercase text-[var(--content-secondary)] font-bold text-xs tracking-wider font-mono">
                            Tags & Keywords
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag) => (
                              <Link
                                key={tag}
                                href={`/search?q=${encodeURIComponent(tag)}`}
                                className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-all"
                              >
                                #{tag}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {project.tools?.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-[var(--content-tertiary)]" />
                            <h4 className="type-label uppercase text-[var(--content-secondary)] font-bold text-xs tracking-wider font-mono">
                              Software & Tools
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {project.tools.map((tool) => (
                              <span
                                key={tool}
                                className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-semibold text-[var(--content-secondary)]"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Discussion / Comments Section (Hidden for drafts) */}
                {!isDraft && (
                  <div id="comments-section" className="pt-4">
                    <CommentSection
                      projectId={project.id}
                      comments={project.comments || []}
                    />
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </FadeIn>

      {/* ===================================================================== */}
      {/* MOBILE BOTTOM FLOATING ACTION BAR                                     */}
      {/* ===================================================================== */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-full bg-[var(--bg-screen)]/95 backdrop-blur-md border border-[var(--border-neutral)] shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
        {!isDraft && (
          <>
            {!isAuthor && (
              <button
                type="button"
                onClick={handleToggleAppreciation}
                className={cn(
                  "h-12 min-h-[48px] px-4 rounded-full flex items-center gap-2 text-xs font-bold transition-all cursor-pointer select-none border-0",
                  isAppreciated
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-md"
                    : "bg-[var(--bg-neutral)] text-[var(--content-primary)]"
                )}
                title={isAppreciated ? "Unlike project" : "Appreciate project"}
                aria-label={isAppreciated ? `Remove appreciation (${project.appreciations})` : `Appreciate project (${project.appreciations})`}
              >
                <Heart className={cn("h-4 w-4", isAppreciated ? "fill-current" : "text-[var(--content-primary)]")} />
                <span>{project.appreciations}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleScrollToComments}
              className="h-12 min-h-[48px] px-4 rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center gap-2 text-xs font-bold"
              title="Jump to discussion"
              aria-label="Jump to discussion"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{project.comments?.length || 0}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center justify-center"
              title="Share Project"
              aria-label="Share Project"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </>
        )}

        {isAuthor && (
          <>
            {isDraft && (
              <button
                type="button"
                onClick={handlePublishProject}
                disabled={isPublishing}
                className="h-12 min-h-[48px] px-4 rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] hover:opacity-90 flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 shadow-xs"
                title="Publish Project Live"
                aria-label="Publish Project Live"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>Publish</span>
              </button>
            )}

            <Link
              href={`/me/projects/${project.id}`}
              className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all shrink-0"
              title="Edit Case Study"
              aria-label="Edit Case Study"
            >
              <Edit3 className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-red-500/10 text-red-600 flex items-center justify-center"
              title="Delete Project"
              aria-label="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}

        <div className="h-6 w-[1px] bg-[var(--border-neutral)] mx-0.5" />

        <Link
          href={`/u/${project.creator.username}`}
          className="relative h-12 w-12 min-h-[48px] min-w-[48px] rounded-full ring-1 ring-[var(--border-neutral)] shrink-0"
        >
          <div className="relative h-full w-full rounded-full overflow-hidden">
            <Image
              src={getValidAvatarUrl(project.creator.avatarUrl)}
              alt={project.creator.displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        </Link>
      </div>

      {/* Full-screen Lightbox Modal */}
      <ProjectLightbox
        isOpen={isLightboxOpen}
        images={allImages.map((url) => ({ url, alt: project.title }))}
        currentIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      {/* Share Project Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Project"
        subtitle={`Share "${project.title}" by ${project.creator.displayName} with your network or copy the link.`}
        creatorName={project.creator.displayName}
        url={getCanonicalShareUrl(`/project/${project.slug}`)}
      />

      {/* Delete Project Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={() => {
          router.push("/me");
        }}
      />

      {/* Report Project Moderation Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="project"
        targetId={project.id}
        targetName={project.title}
      />
    </article>
  );
}
