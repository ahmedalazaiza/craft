"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/session-context";
import { Project, Creator } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { buttonVariants } from "@/components/ui/button";
import { HeroSearch } from "@/components/search/hero-search";
import { getValidAvatarUrl } from "@/lib/avatar";
import {
  ArrowRight,
  Users,
  Loader2,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const ROTATING_WORDS = [
  "Case Study",
  "Mobile Apps",
  "Website",
  "Brand Identity",
  "Design System",
  "Logo Design",
  "Illustrations",
];

function getCategoryTagLabel(cat: { id: string; name: string; shortName: string }) {
  if (cat.id === "ui") return "UI Design";
  if (cat.id === "ux") return "UX Design";
  return cat.name.replace(/\s*\(.*?\)\s*/g, "").trim();
}

interface HomeClientProps {
  initialProjects?: Project[];
  initialCreators?: Creator[];
}

export function HomeClient({
  initialProjects = [],
  initialCreators = [],
}: HomeClientProps) {
  const { projects: contextProjects, creators: contextCreators, taxonomy, user } = useSession();

  // Top main categories from real Supabase taxonomy for quick exploration tags
  const mainCategories = useMemo(() => {
    return taxonomy.slice(0, 7);
  }, [taxonomy]);

  // Dynamic Typewriter animation for hero headline
  const [wordIndex, setWordIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("Case Study");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = ROTATING_WORDS[wordIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward
      if (typewriterText.length < currentWord.length) {
        timer = setTimeout(() => {
          setTypewriterText(currentWord.slice(0, typewriterText.length + 1));
        }, 90);
      } else {
        // Finished typing word, hold before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting backwards
      if (typewriterText.length > 0) {
        timer = setTimeout(() => {
          setTypewriterText(currentWord.slice(0, typewriterText.length - 1));
        }, 45);
      } else {
        // Paused on empty, switch to next word
        timer = setTimeout(() => {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 300);
      }
    }

    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, wordIndex]);

  // Instant SSR hydration: prioritize context if updated by user action, otherwise use SSR initial data
  const projects = contextProjects.length > 0 ? contextProjects : initialProjects;
  const creators = contextCreators.length > 0 ? contextCreators : initialCreators;

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Curated Featured (max 10 items) - sorted by featuredOrder if present, then publishedAt
  const allFeatured = useMemo(() => {
    return publishedProjects
      .filter((p) => p.featured)
      .sort((a, b) => {
        const hasA = typeof a.featuredOrder === "number";
        const hasB = typeof b.featuredOrder === "number";
        if (hasA && hasB) return (a.featuredOrder as number) - (b.featuredOrder as number);
        if (hasA) return -1;
        if (hasB) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [publishedProjects]);

  const featuredProjects = useMemo(() => {
    return allFeatured.slice(0, 10);
  }, [allFeatured]);

  const hasMoreFeatured = allFeatured.length > 10;

  // Infinite scroll pagination state for all disciplines feed
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // All published projects sorted chronologically (newest first)
  const sortedProjects = useMemo(() => {
    return [...publishedProjects].sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [publishedProjects]);

  const displayedProjects = useMemo(() => {
    return sortedProjects.slice(0, visibleCount);
  }, [sortedProjects, visibleCount]);

  const hasMore = visibleCount < sortedProjects.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedProjects.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, sortedProjects.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div className="flex flex-col gap-12 sm:gap-14 pb-4 sm:pb-8">
      {/* ========================================================================= */}
      {/* CENTERED MONUMENTAL HERO SECTION WITH AMBIENT AURA & PATTERN              */}
      {/* ========================================================================= */}
      <section className="relative overflow-visible border-b border-[var(--border-neutral)] bg-[var(--bg-screen)] pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-18 lg:pt-14 lg:pb-20 text-center z-20">
        {/* Ambient Animated Mesh Glows & Geometric Micro-Pattern */}
        <div className="absolute inset-0 pointer-events-none -z-10 select-none overflow-hidden">
          {/* Top Center Brand Ambient Aura with Violet Glow */}
          <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[450px] sm:h-[600px] rounded-full bg-gradient-to-b from-[var(--brand-secondary-subtle)] via-[var(--brand-secondary-glow)]/15 to-transparent blur-[120px] animate-ambient-pulse" />

          {/* Left Subtle Ambient Neutral Aura */}
          <div className="absolute top-[20%] left-[8%] w-[380px] h-[380px] rounded-full bg-[var(--brand-secondary-subtle)]/40 blur-[100px] animate-ambient-float-slow" />

          {/* Right Subtle Ambient Neutral Aura */}
          <div className="absolute top-[25%] right-[8%] w-[380px] h-[380px] rounded-full bg-[var(--border-neutral)]/20 blur-[100px] animate-ambient-float" />

          {/* Modern Geometric Dot Pattern with Smooth Radial Vignette Mask */}
          <div
            className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
            style={{
              backgroundImage: `radial-gradient(circle, var(--content-tertiary) 1.2px, transparent 1.2px)`,
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 80%)",
            }}
          />
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-[140px] relative z-20 flex flex-col items-center justify-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-elevated)]/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--content-primary)] mb-4 sm:mb-5 shadow-xs border border-[var(--border-neutral)] select-none mx-auto backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-secondary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-secondary)]"></span>
            </span>
            <span className="font-bold">Layerat Platform</span>
            <span className="text-[var(--content-tertiary)]">•</span>
            <span className="text-[var(--content-secondary)] font-normal">Independent Creators</span>
          </div>

          {/* Monumental Centered Headline */}
          <h1
            className={cn(
              bricolage.className,
              "text-[36px] xs:text-[44px] sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-black tracking-[-0.035em] sm:tracking-[-0.04em] leading-[1.12] sm:leading-[1.04] text-[var(--content-primary)] text-center w-full flex flex-col items-center justify-center max-w-4xl"
            )}
          >
            <span className="block w-full text-center">
              Showcase your
            </span>

            <span className="block w-full text-center mt-1 sm:mt-2">
              <span className="inline-block text-[var(--brand-secondary)] drop-shadow-[0_2px_24px_var(--brand-secondary-glow)] tracking-tight font-black select-none">
                <span className="min-w-[1ch] inline-block">{typewriterText || "\u00A0"}</span>
                <span
                  aria-hidden="true"
                  className="inline-block w-[3px] sm:w-[4px] md:w-[5px] h-[0.85em] bg-[var(--brand-secondary)] ml-1.5 sm:ml-2 align-baseline animate-cursor-blink rounded-full"
                />
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg lg:text-xl text-[var(--content-secondary)] max-w-2xl leading-relaxed font-normal text-center mx-auto">
            A modern portfolio platform to publish your projects, build your studio profile, and discover inspiring work from designers worldwide.
          </p>

          {/* Universal Hero Search Bar & Main Category Tags for all users */}
          <div className="w-full flex flex-col items-center justify-center mt-6 sm:mt-7">
            <div className="w-full max-w-2xl mx-auto relative z-50 flex flex-col items-center">
              <HeroSearch />

              {/* Main Category Tags from real Supabase taxonomy */}
              {mainCategories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-4 max-w-xl mx-auto px-2">
                  {mainCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/explore/${cat.id}`}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-elevated)]/80 hover:bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] transition-all shadow-2xs hover:shadow-xs select-none"
                    >
                      <span>{getCategoryTagLabel(cat)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: FEATURED PROJECTS (4 Projects Grid)                            */}
      {/* ========================================================================= */}
      {featuredProjects.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-[140px] relative z-0">
          <div className="mb-4 sm:mb-5 pb-3 sm:pb-2.5 border-b border-[var(--border-neutral)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="hidden sm:flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[var(--content-primary)]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                    Hand-Curated
                  </span>
                </div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--content-primary)]"
                  )}
                >
                  Featured Work
                </h2>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] shrink-0 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] transition-all shadow-2xs"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="hidden sm:block type-body-default text-[var(--content-secondary)] mt-2">
              Standout case studies and design projects hand-picked by our curators.
            </p>
          </div>

          <div className="flex sm:grid gap-4 sm:gap-6 overflow-x-auto sm:overflow-x-visible pb-3 sm:pb-0 snap-x snap-mandatory scrollbar-none sm:grid-cols-2 lg:grid-cols-4 after:content-[''] after:w-1 after:shrink-0 sm:after:hidden">
            {featuredProjects.map((project, idx) => (
              <div
                key={project.id}
                className="w-[82vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none"
              >
                <ProjectCard project={project} priority={idx === 0} />
              </div>
            ))}

            {hasMoreFeatured && (
              <div className="w-[82vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none flex flex-col">
                <Link
                  href="/explore"
                  className="group relative aspect-[4/3] rounded-[24px] overflow-hidden border-2 border-dashed border-[var(--border-neutral)] hover:border-[var(--content-primary)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] transition-all flex flex-col items-center justify-center p-6 text-center shadow-2xs hover:shadow-xs"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] mb-3 group-hover:scale-110 group-hover:bg-[var(--brand-secondary)] group-hover:text-white transition-all shadow-xs">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm text-[var(--content-primary)]">
                    Explore More
                  </span>
                  <span className="text-xs text-[var(--content-secondary)] mt-1">
                    Discover all {allFeatured.length} featured works →
                  </span>
                </Link>
                <div className="mt-2.5 h-6 sm:h-6.5" aria-hidden="true" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* UNIFIED FEED: ALL DISCIPLINES (Infinite Scroll with 10 projects per batch) */}
      {/* ========================================================================= */}
      <section className="w-full px-4 sm:px-6 lg:px-[140px]">
        <div className="mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-[var(--border-neutral)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="hidden sm:flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-secondary)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                  All Disciplines
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Explore Works
              </h2>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] shrink-0 px-3.5 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] transition-all shadow-2xs"
            >
              <span>View with Filters</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="hidden sm:block type-body-default text-[var(--content-secondary)] mt-2">
            Discover case studies, products, and designs across all disciplines on Layerat.
          </p>
        </div>

        {sortedProjects.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)]/30">
            <FolderKanban className="h-10 w-10 mx-auto text-[var(--content-tertiary)] mb-3 opacity-60" />
            <p className="text-base font-semibold text-[var(--content-primary)]">No published projects yet</p>
            <p className="text-xs text-[var(--content-secondary)] mt-1">Be the first to publish a project to the platform.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 min-h-[300px]">
              {displayedProjects.map((project, idx) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  priority={idx < 4}
                />
              ))}
            </div>

            {/* Infinite Scroll Sentinel & Loading Indicator */}
            <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center min-h-[60px]">
              {isLoadingMore ? (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-2xs animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-secondary)]" />
                  <span className="text-xs font-medium text-[var(--content-secondary)]">Loading more projects...</span>
                </div>
              ) : hasMore ? (
                <div className="h-4" />
              ) : sortedProjects.length > 0 ? (
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--content-tertiary)] py-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-tertiary)] opacity-40" />
                  <span>You&apos;ve viewed all {sortedProjects.length} projects</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--content-tertiary)] opacity-40" />
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>

      {/* ========================================================================= */}
      {/* HIGH-CONVERSION CREATOR CTA SECTION (Only for Guests / Not Logged In)     */}
      {/* ========================================================================= */}
      {!user && (
        <section className="w-full px-4 sm:px-6 lg:px-[140px] pt-6 pb-4 sm:pb-8">
          <div className="relative rounded-[32px] bg-neutral-950 dark:bg-[#121511] text-white border border-neutral-800 px-6 py-12 sm:px-12 sm:py-16 lg:py-20 overflow-hidden shadow-xl text-center">
            {/* Ambient Brand Violet Glows */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-[var(--brand-secondary-glow)]/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-[var(--brand-secondary-subtle)]/40 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-6">
              {/* Eyebrow */}
              <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400">
                Join the Community
              </span>

              {/* Centered Headline */}
              <h2
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]"
                )}
              >
                Ready to showcase your work to the world?
              </h2>

              {/* Centered Subtitle */}
              <p className="text-sm sm:text-base text-neutral-300 max-w-lg mx-auto leading-relaxed font-normal">
                Publish detailed design case studies, build your portfolio, and connect with creative peers and top studios worldwide.
              </p>

              {/* Centered Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className={buttonVariants({
                    variant: "accent",
                    className: "gap-2 font-bold px-7 h-11 shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer",
                  })}
                >
                  <span>Sign up free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-semibold border border-neutral-700 bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <span>Explore projects</span>
                </Link>
              </div>

              {/* Centered Social Proof */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-neutral-400">
                <div className="flex items-center -space-x-2">
                  {creators.slice(0, 4).map((u) => (
                    <div
                      key={u.id}
                      className="relative h-6 w-6 rounded-full overflow-hidden ring-2 ring-neutral-950 shrink-0"
                    >
                      <Image
                        src={getValidAvatarUrl(u.avatarUrl)}
                        alt={u.displayName}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span>Joined by independent creators & studios worldwide</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
