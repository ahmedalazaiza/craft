"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "@/components/project/comment-section";
import { ProjectLightbox } from "@/components/project/project-lightbox";
import { ShareModal } from "@/components/ui/share-modal";
import { useSession } from "@/lib/session-context";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { OnlineBadge } from "@/components/ui/online-badge";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getValidAvatarUrl } from "@/lib/avatar";
import {
  Heart,
  MessageSquare,
  Share2,
  Maximize2,
  Tag,
  Wrench,
  Edit3,
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
  } = useSession();

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Grab live project data from session context if updated
  const project =
    projects.find((p) => p.id === initialProject.id) || initialProject;

  const isAppreciated = isProjectAppreciated(project.id);

  const isAuthor =
    user &&
    project.creator &&
    (user.id === project.creator.id ||
      user.username.toLowerCase() === project.creator.username.toLowerCase());

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
    <article className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 pb-28 sm:pb-32">
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

        {/* =================================================================== */}
        {/* 1. PROJECT HEADER BAR: Info, Tags & Tools Chip Matrix, Metas        */}
        {/* =================================================================== */}
        <div className="space-y-6 mb-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)]">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="default">
                  {project.category}
                </Badge>
                {project.featured && (
                  <Badge variant="forest" size="default">
                    Featured Work
                  </Badge>
                )}
                {project.medium && (
                  <Badge variant="neutral" size="default">
                    {project.medium}
                  </Badge>
                )}
              </div>

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
                <span className="text-[var(--content-tertiary)]">•</span>
                <span>{new Date(project.publishedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="flex flex-col md:items-end gap-3 shrink-0">
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-[var(--content-secondary)]">
                  <strong className="text-[var(--content-primary)] font-bold">{project.appreciations}</strong> appreciations
                </span>
                <span className="text-[var(--content-tertiary)]">•</span>
                <span className="text-[var(--content-secondary)]">
                  <strong className="text-[var(--content-primary)] font-bold">{project.comments?.length || 0}</strong> comments
                </span>
              </div>

              {isAuthor && (
                <Link
                  href={`/me/projects/${project.id}`}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "default",
                    className: "shrink-0 gap-2 font-bold shadow-xs",
                  })}
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Case Study</span>
                </Link>
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
            <aside className="hidden md:flex flex-col items-center sticky top-28 shrink-0 z-30 select-none">
              <div className="flex flex-col items-center gap-3 p-2 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                {/* 1. Like / Appreciation with Live Count */}
                <button
                  type="button"
                  onClick={handleToggleAppreciation}
                  className={cn(
                    "h-12 w-12 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer select-none group",
                    isAppreciated
                      ? "bg-[#8DFF00] text-[#090C09] shadow-xs"
                      : "bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                  )}
                  title={isAppreciated ? "Unlike project" : "Like project"}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                      isAppreciated && "fill-current"
                    )}
                  />
                  <span className="text-[10px] font-mono font-bold mt-0.5 leading-none">
                    {project.appreciations}
                  </span>
                </button>

                {/* 2. Comment Button */}
                <button
                  type="button"
                  onClick={handleScrollToComments}
                  className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] flex flex-col items-center justify-center transition-all cursor-pointer select-none group"
                  title="Jump to discussion"
                >
                  <MessageSquare className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-[10px] font-mono font-bold mt-0.5 leading-none">
                    {project.comments?.length || 0}
                  </span>
                </button>

                {/* 3. Share Button */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] flex items-center justify-center transition-all cursor-pointer select-none group"
                  title="Share project"
                >
                  <Share2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                </button>

                {/* 4. Owner Edit Button (When viewer is the author) */}
                {isAuthor && (
                  <Link
                    href={`/me/projects/${project.id}`}
                    className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all cursor-pointer select-none group"
                    title="Edit Case Study"
                  >
                    <Edit3 className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                  </Link>
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
                  <OnlineBadge userId={project.creator.id} username={project.creator.username} size="sm" className="absolute -bottom-0.5 -right-0.5 z-10" />
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

                {/* Tags and Tools Matrix */}
                {(project.tags?.length > 0 || project.tools?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 shadow-xs">
                    {/* Tags */}
                    {project.tags?.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[var(--content-tertiary)]" />
                          <h3 className="type-label uppercase text-[var(--content-primary)] font-bold">
                            Disciplines & Tags
                          </h3>
                        </div>
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
                          <h3 className="type-label uppercase text-[var(--content-primary)] font-bold">
                            Software & Tools
                          </h3>
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

                {/* Discussion / Comments Section */}
                <div id="comments-section" className="pt-4">
                  <CommentSection
                    projectId={project.id}
                    comments={project.comments || []}
                  />
                </div>
              </div>
            </main>
          </div>
        </div>
      </FadeIn>

      {/* ===================================================================== */}
      {/* MOBILE BOTTOM FLOATING ACTION BAR                                     */}
      {/* ===================================================================== */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-1.5 rounded-full bg-[var(--bg-screen)]/95 backdrop-blur-md border border-[var(--border-neutral)] shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={handleToggleAppreciation}
          className={cn(
            "h-12 min-h-[48px] px-4 rounded-full flex items-center gap-2 text-xs font-bold transition-all",
            isAppreciated
              ? "bg-[var(--accent)] text-[var(--primary-forest-green)]"
              : "bg-[var(--bg-neutral)] text-[var(--content-primary)]"
          )}
        >
          <Heart className={cn("h-4 w-4", isAppreciated && "fill-current")} />
          <span>{project.appreciations}</span>
        </button>

        <button
          type="button"
          onClick={handleScrollToComments}
          className="h-12 min-h-[48px] px-4 rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center gap-2 text-xs font-bold"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{project.comments?.length || 0}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center justify-center"
          title="Share Project"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {isAuthor && (
          <Link
            href={`/me/projects/${project.id}`}
            className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--btn-cta-bg)] hover:text-[var(--btn-cta-fg)] flex items-center justify-center transition-all shrink-0"
            title="Edit Case Study"
          >
            <Edit3 className="h-4 w-4" />
          </Link>
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
          <OnlineBadge userId={project.creator.id} username={project.creator.username} size="sm" className="absolute -bottom-0.5 -right-0.5 z-10" />
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
        url={
          typeof window !== "undefined"
            ? `${window.location.origin}/project/${project.slug}`
            : `https://layerat.com/project/${project.slug}`
        }
      />
    </article>
  );
}
