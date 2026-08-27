"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Project } from "@/lib/mock";
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
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageSquare,
  Share2,
  Maximize2,
  Tag,
  Wrench,
  ArrowLeft,
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

  // Combine cover image + gallery images into { url, alt } objects
  const rawImages = [project.coverImage, ...(project.galleryImages || [])];
  const allImages = rawImages.map((url, idx) => ({
    url,
    alt: `${project.title} - Shot ${idx + 1}`,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleToggleAppreciation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    toggleAppreciation(project.id);
  };

  const handleScrollToComments = () => {
    const commentsEl = document.getElementById("comments-section");
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <article className="pb-16 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-8">
        <FadeIn>
          {/* Breadcrumbs Navigation */}
          <Breadcrumbs
            items={[
              { label: "Explore", href: "/explore" },
              { label: project.category, href: `/explore?category=${encodeURIComponent(project.category)}` },
              { label: project.title, isCurrent: true },
            ]}
          />

          {/* ================================================================= */}
          {/* 1. TOP HEADER: Project Title, Description & Author Edit Button   */}
          {/* ================================================================= */}
          <header className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <h1
                  className={cn(
                    bricolage.className,
                    "text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--primary-forest-green)] leading-[1.1]"
                  )}
                >
                  {project.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[var(--content-secondary)] leading-relaxed max-w-4xl">
                  {project.summary}
                </p>
              </div>

              {isAuthor && (
                <Link href={`/me/projects/${project.id}`} className="shrink-0 pt-1">
                  <Button variant="secondary" size="default" className="gap-2 font-bold shadow-xs">
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Case Study</span>
                  </Button>
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
              {/* First 3 Actions Pill: Like, Comment, Share */}
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

                {/* 2. Comment Button (Smooth scroll to comments section) */}
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
                    className="h-12 w-12 rounded-full bg-[var(--bg-neutral)]/70 text-[var(--content-primary)] hover:bg-[var(--primary-forest-green)] hover:text-white flex items-center justify-center transition-all cursor-pointer select-none group"
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
                      src={project.creator.avatarUrl}
                      alt={project.creator.displayName}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <OnlineBadge isOnline={project.creator.isOnline} size="sm" className="absolute -bottom-0.5 -right-0.5 z-10" />
                </Link>
              </div>
            </aside>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT/CENTER: Continuous Image List (2px Gap, Radius 0)        */}
            {/* ------------------------------------------------------------- */}
            <main className="flex-1 min-w-0">
              <div className="flex flex-col gap-[2px] w-full rounded-none overflow-hidden bg-[var(--border-neutral)] border-0 shadow-sm">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(idx)}
                    className="relative w-full rounded-none bg-[var(--bg-neutral)] overflow-hidden cursor-pointer select-none group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-auto block rounded-none transition-transform duration-300 group-hover:scale-[1.003]"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />

                    {/* Expand Cue Overlay on Hover */}
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/70 text-white p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tools & Disciplines Meta Block (Side-by-Side) */}
              {((project.tools && project.tools.length > 0) ||
                (project.tags && project.tags.length > 0)) && (
                <div className="mt-10 rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-7 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--border-neutral)]">
                    {project.tools && project.tools.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-[var(--primary-forest-green)]" />
                          <span>Tools & Technologies</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tools.map((tool) => (
                            <Badge key={tool} variant="neutral" size="sm" className="px-3 py-1 font-medium">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.tags && project.tags.length > 0 && (
                      <div className={cn("space-y-3", project.tools && project.tools.length > 0 && "pt-6 md:pt-0 md:pl-8")}>
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[var(--primary-forest-green)]" />
                          <span>Categories & Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="neutral" size="sm" className="px-3 py-1 font-medium">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* 3. DISCUSSION & CRITIQUE SECTION (Intact as is)               */}
              {/* ============================================================= */}
              <div id="comments-section" className="mt-14 scroll-mt-28">
                <CommentSection
                  projectId={project.id}
                  comments={project.comments}
                />
              </div>
            </main>
          </div>
        </FadeIn>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MOBILE FLOATING ACTION BAR (BOTTOM PILL)                          */}
      {/* ----------------------------------------------------------------- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-2 p-1.5 rounded-full bg-[var(--bg-screen)]/95 backdrop-blur-md border border-[var(--border-neutral)] shadow-2xl">
        <button
          type="button"
          onClick={handleToggleAppreciation}
          className={cn(
            "h-10 px-3 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all",
            isAppreciated
              ? "bg-[#8DFF00] text-[#090C09]"
              : "bg-[var(--bg-neutral)] text-[var(--content-primary)]"
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", isAppreciated && "fill-current")} />
          <span>{project.appreciations}</span>
        </button>

        <button
          type="button"
          onClick={handleScrollToComments}
          className="h-10 px-3 rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center gap-1.5 text-xs font-bold"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{project.comments?.length || 0}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="h-10 w-10 rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] flex items-center justify-center"
          title="Share Project"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>

        {isAuthor && (
          <Link
            href={`/me/projects/${project.id}`}
            className="h-10 w-10 rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--primary-forest-green)] hover:text-white flex items-center justify-center transition-all shrink-0"
            title="Edit Case Study"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>
        )}

        <div className="h-5 w-[1px] bg-[var(--border-neutral)] mx-0.5" />

        <Link
          href={`/u/${project.creator.username}`}
          className="relative h-10 w-10 rounded-full ring-1 ring-[var(--border-neutral)] shrink-0"
        >
          <div className="relative h-full w-full rounded-full overflow-hidden">
            <Image
              src={project.creator.avatarUrl}
              alt={project.creator.displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <OnlineBadge isOnline={project.creator.isOnline} size="sm" className="absolute -bottom-0.5 -right-0.5 z-10" />
        </Link>
      </div>

      {/* Full-screen Lightbox Modal */}
      <ProjectLightbox
        isOpen={isLightboxOpen}
        images={allImages}
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
            : `https://craft.studio/project/${project.slug}`
        }
      />
    </article>
  );
}
