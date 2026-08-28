"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/session-context";
import { Project, Creator } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { DEFAULT_AVATAR_URL, getValidAvatarUrl } from "@/lib/avatar";
import { MASTER_TAXONOMY, normalizeCategory } from "@/lib/taxonomy";
import {
  ScrollRevealSection,
  StaggerGridItem,
  MOTION_EASE,
} from "@/components/ui/motion-wrapper";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Sparkles,
  LayoutGrid,
  Layers,
  Building2,
  BookOpen,
  CheckCircle2,
  Users,
  Box,
  Palette,
  Film,
  Type,
  Gamepad2,
  Compass,
  BarChart3,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURE_POINTS = [
  {
    num: "01",
    title: "Detailed Case Studies",
    desc: "Showcase high-resolution images, design rationale, and your creative process without compression.",
  },
  {
    num: "02",
    title: "Creator Profiles",
    desc: "Build your online portfolio with your bio, location, disciplines, and tools.",
  },
  {
    num: "03",
    title: "Clean & Ad-Free",
    desc: "No ads, feeds, or distractions. Just great design and authentic peer feedback.",
  },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  ui: LayoutGrid,
  ux: Sparkles,
  "graphic-design": BookOpen,
  "brand-identity": Building2,
  "motion-design": Film,
  "3d-design": Box,
  illustration: Palette,
  "game-design": Gamepad2,
  "spatial-design": Compass,
  "industrial-design": Cpu,
  animation: Film,
  "type-design": Type,
  "presentation-design": BarChart3,
};

interface HomeClientProps {
  initialProjects?: Project[];
  initialCreators?: Creator[];
}

export function HomeClient({
  initialProjects = [],
  initialCreators = [],
}: HomeClientProps) {
  const { projects: contextProjects, creators: contextCreators, user } = useSession();
  const shouldReduceMotion = useReducedMotion();

  // Instant SSR hydration: prioritize context if updated by user action, otherwise use SSR initial data
  const projects = contextProjects.length > 0 ? contextProjects : initialProjects;
  const creators = contextCreators.length > 0 ? contextCreators : initialCreators;

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Curated Featured (4 items)
  const featuredProjects = useMemo(() => {
    return publishedProjects.filter((p) => p.featured).slice(0, 4);
  }, [publishedProjects]);

  // Active Category Showcases from MASTER_TAXONOMY with at least 1 published project
  const categorySections = useMemo(() => {
    return MASTER_TAXONOMY.map((cat) => {
      const matchingProjects = publishedProjects.filter((p) => {
        const norm = normalizeCategory(p.category);
        return (
          norm.toLowerCase() === cat.name.toLowerCase() ||
          p.category.toLowerCase() === cat.shortName.toLowerCase() ||
          (p.subCategory &&
            cat.subCategories.some(
              (sub) => sub.toLowerCase() === p.subCategory?.toLowerCase()
            )) ||
          p.tags.some(
            (t) =>
              t.toLowerCase() === cat.shortName.toLowerCase() ||
              t.toLowerCase() === cat.name.toLowerCase()
          )
        );
      }).slice(0, 4);

      return {
        taxonomy: cat,
        projects: matchingProjects,
      };
    }).filter((section) => section.projects.length > 0);
  }, [publishedProjects]);

  const headlineLines = ["Showcase your work.", "Connect with makers."];

  return (
    <div className="flex flex-col gap-12 sm:gap-14 pb-14">
      {/* ========================================================================= */}
      {/* CENTERED MONUMENTAL HERO SECTION                                          */}
      {/* ========================================================================= */}
      <section className="relative border-b border-[var(--border-neutral)] bg-gradient-to-b from-[var(--bg-neutral)]/20 via-[var(--bg-screen)] to-[var(--bg-screen)] min-h-[calc(100vh-64px)] flex items-center justify-center pt-10 pb-12 sm:pt-14 sm:pb-16 lg:py-20 overflow-hidden text-center">
        {/* Ambient Radial Lime Glow */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center -z-10"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-[600px] h-[400px] sm:w-[900px] sm:h-[550px] rounded-full bg-[#8DFF00]/10 blur-[140px] top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          {/* Architectural Dot Grid Matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-neutral)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 w-full z-10 flex flex-col items-center justify-center text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: MOTION_EASE }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-4 py-1.5 text-xs font-semibold text-[var(--chip-fg)] mb-6 sm:mb-8 shadow-xs border border-white/10 select-none mx-auto"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
            <span>Craft Platform</span>
            <span className="text-[var(--content-tertiary)]">•</span>
            <span className="text-[var(--chip-fg)] font-normal">Independent Creators</span>
          </motion.div>

          {/* Monumental Centered Headline */}
          <h1
            className={cn(
              bricolage.className,
              "text-[44px] sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-black tracking-[-0.04em] leading-[1.02] sm:leading-[0.96] text-[var(--primary-forest-green)] dark:text-white text-center w-full flex flex-col items-center justify-center max-w-4xl"
            )}
          >
            <span className="block w-full text-center overflow-hidden">
              <motion.span
                className="inline-flex flex-wrap items-baseline justify-center gap-2.5 sm:gap-4 text-[var(--primary-forest-green)] dark:text-white text-center"
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: shouldReduceMotion ? 0 : 0.08,
                  ease: MOTION_EASE,
                }}
              >
                <span>Showcase</span>
                <span>your</span>
                <span className="inline-flex items-center rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 sm:px-4 py-0.5 sm:py-1 shadow-sm border border-white/10 tracking-tight">
                  work<span className="text-[#8DFF00]">.</span>
                </span>
              </motion.span>
            </span>

            <span className="block w-full text-center overflow-hidden mt-1 sm:mt-2">
              <motion.span
                className="inline-flex flex-wrap items-baseline justify-center gap-2.5 sm:gap-4 text-[var(--primary-forest-green)] dark:text-white text-center"
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: shouldReduceMotion ? 0 : 0.18,
                  ease: MOTION_EASE,
                }}
              >
                <span>Connect</span>
                <span>with</span>
                <span className="inline-flex items-center rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 sm:px-4 py-0.5 sm:py-1 shadow-sm border border-white/10 tracking-tight">
                  makers<span className="text-[#8DFF00]">.</span>
                </span>
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduceMotion ? 0 : 0.28,
              ease: MOTION_EASE,
            }}
            className="mt-6 sm:mt-8 text-base sm:text-xl text-[var(--content-secondary)] max-w-2xl leading-relaxed font-normal text-center mx-auto"
          >
            A modern portfolio platform to publish your projects, build your studio profile, and discover inspiring work from designers worldwide.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: shouldReduceMotion ? 0 : 0.38,
              ease: MOTION_EASE,
            }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mx-auto max-w-md sm:max-w-none"
          >
            <Link
              href="/explore"
              className={buttonVariants({
                variant: "accent",
                size: "lg",
                className: "w-full sm:w-auto gap-2 shadow-sm font-bold justify-center px-8",
              })}
            >
              <span>Explore Projects</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {user ? (
              <Link
                href="/creators"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto gap-2 font-semibold justify-center px-8",
                })}
              >
                <Users className="h-4 w-4 text-[var(--primary-forest-green)]" />
                <span>Explore Creators</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto font-semibold justify-center px-8",
                })}
              >
                Join as a Creator
              </Link>
            )}
          </motion.div>

          {/* Minimalist 3-Point Value Manifesto (Centered Balanced Grid) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.48 }}
            className="mt-12 sm:mt-14 pt-10 sm:pt-12 border-t border-[var(--border-neutral)] grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl text-center"
          >
            {FEATURE_POINTS.map((pt) => (
              <div key={pt.num} className="space-y-2.5 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 py-1 text-xs font-mono font-bold tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{pt.num}</span>
                </div>
                <div className="text-sm font-bold text-[var(--content-primary)]">
                  {pt.title}
                </div>
                <p className="text-xs text-[var(--content-tertiary)] leading-relaxed max-w-xs">
                  {pt.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: FEATURED PROJECTS (4 Projects Grid)                            */}
      {/* ========================================================================= */}
      {featuredProjects.length > 0 && (
        <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full">
          <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#8DFF00]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                  Hand-Curated
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Featured Work
              </h2>
              <p className="type-body-default text-[var(--content-secondary)] mt-1">
                Standout case studies and design projects hand-picked by our curators.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)] shrink-0 text-xs sm:text-sm"
            >
              <span>View all</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        </ScrollRevealSection>
      )}

      {/* ========================================================================= */}
      {/* DYNAMIC CATEGORY SHOWCASES (Only non-empty categories)                     */}
      {/* For Authenticated Users: Render all active categories with projects       */}
      {/* For Guests: Render top 3 categories + Sign Up CTA banner                  */}
      {/* ========================================================================= */}
      {(user ? categorySections : categorySections.slice(0, 3)).map((section) => {
        const IconComponent = CATEGORY_ICONS[section.taxonomy.id] || LayoutGrid;

        return (
          <ScrollRevealSection
            key={section.taxonomy.id}
            className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full"
          >
            <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                    {section.taxonomy.shortName}
                  </span>
                </div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                  )}
                >
                  {section.taxonomy.name}
                </h2>
                <p className="type-body-default text-[var(--content-secondary)] mt-1">
                  {section.taxonomy.description}
                </p>
              </div>
              <Link
                href={`/explore?category=${encodeURIComponent(section.taxonomy.name)}`}
                className="inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)] shrink-0 text-xs sm:text-sm"
              >
                <span>Explore {section.taxonomy.shortName}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.projects.map((project, idx) => (
                <StaggerGridItem key={project.id} index={idx}>
                  <ProjectCard project={project} />
                </StaggerGridItem>
              ))}
            </div>
          </ScrollRevealSection>
        );
      })}

      {/* ========================================================================= */}
      {/* HIGH-CONVERSION CREATOR CTA SECTION (Only for Guests / Not Logged In)     */}
      {/* ========================================================================= */}
      {!user && (
        <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full pt-4">
          <div className="relative rounded-[32px] bg-[var(--base-dark)] text-white border border-white/10 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-[0_24px_64px_rgba(9,12,9,0.18)] dark:shadow-none">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#8DFF00]/15 blur-[120px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-[var(--primary-forest-green)]/40 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: 2-Line Headline, Subtitle, Value Points, CTAs (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white mb-5 border border-white/15 w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DFF00]" />
                  <span>Global Designer Community</span>
                </div>

                {/* Monumental 2-Line Headline */}
                <h2
                  className={cn(
                    bricolage.className,
                    "text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-black tracking-tight text-white leading-[1.04]"
                  )}
                >
                  <span className="block">Ready to showcase your work?</span>
                  <span className="block text-[#8DFF00]">
                    Join creators worldwide.
                  </span>
                </h2>

                <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl font-normal">
                  Publish detailed case studies, build your portfolio, and connect with designers, art directors, and creative studios.
                </p>

                {/* Value Checkmarks */}
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                    <span>100% Creator Ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                    <span>High-resolution images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                    <span>Direct peer feedback</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/signup"
                    className={buttonVariants({
                      variant: "accent",
                      size: "lg",
                      className: "gap-2 font-bold shadow-lg",
                    })}
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/explore"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "bg-white/10 hover:bg-white/20 text-white border-white/20 font-semibold",
                    })}
                  >
                    Explore All Projects
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Case Study Showcase Card & Creator Pile (5 cols) */}
              <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center">
                {/* Main Floating Monograph Showcase Card */}
                {(featuredProjects[0] || publishedProjects[0]) && (
                  <div className="w-full max-w-md rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] duration-300">
                    {/* Creator Header */}
                    <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                          <Image
                            src={getValidAvatarUrl((featuredProjects[0] || publishedProjects[0]).creator.avatarUrl)}
                            alt={(featuredProjects[0] || publishedProjects[0]).creator.displayName}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            <span>{(featuredProjects[0] || publishedProjects[0]).creator.displayName}</span>
                            <CheckCircle2 className="h-3 w-3 text-[#8DFF00]" />
                          </div>
                          <div className="text-[10px] text-white/70">
                            {(featuredProjects[0] || publishedProjects[0]).creator.location || (featuredProjects[0] || publishedProjects[0]).creator.city || "Earth"}
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8DFF00]/20 text-[#8DFF00] px-2.5 py-0.5 text-[10px] font-mono font-bold border border-[#8DFF00]/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8DFF00]" />
                        Featured Monograph
                      </span>
                    </div>

                    {/* Case Study Image Preview */}
                    <Link href={`/project/${(featuredProjects[0] || publishedProjects[0]).slug}`} className="block relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-black/40 mb-3 group">
                      <Image
                        src={(featuredProjects[0] || publishedProjects[0]).coverImage}
                        alt={(featuredProjects[0] || publishedProjects[0]).title}
                        fill
                        sizes="400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="font-bold truncate">
                          {(featuredProjects[0] || publishedProjects[0]).title}
                        </span>
                        <span className="text-[11px] text-[#8DFF00] font-mono shrink-0">
                          ♥ {(featuredProjects[0] || publishedProjects[0]).appreciations}
                        </span>
                      </div>
                    </Link>

                    {/* Card Footer Stack & Community Stats */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center -space-x-2">
                        {creators.slice(0, 4).map((u) => (
                          <div
                            key={u.id}
                            className="relative h-6 w-6 rounded-full overflow-hidden ring-2 ring-[var(--base-dark)]"
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
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8DFF00] text-[9px] font-black text-[#090C09] ring-2 ring-[var(--base-dark)]">
                          +{creators.length > 0 ? creators.length : 1}
                        </div>
                      </div>

                      <span className="text-[11px] text-white/80 font-medium">
                        Verified Makers Worldwide
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </ScrollRevealSection>
      )}
    </div>
  );
}
