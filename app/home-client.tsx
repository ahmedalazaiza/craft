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
import { motion } from "framer-motion";
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

  return (
    <div className="flex flex-col gap-12 sm:gap-14 pb-14">
      {/* ========================================================================= */}
      {/* CENTERED MONUMENTAL HERO SECTION                                          */}
      {/* ========================================================================= */}
      <section className="relative border-b border-[var(--border-neutral)] bg-[var(--bg-screen)] min-h-[calc(100vh-64px)] flex items-center justify-center pt-10 pb-12 sm:pt-14 sm:pb-16 lg:py-20 text-center">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 w-full z-10 flex flex-col items-center justify-center text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-4 py-1.5 text-xs font-semibold text-[var(--chip-fg)] mb-6 sm:mb-8 shadow-xs border border-white/10 select-none mx-auto"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
            <span>Layerat Platform</span>
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
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span>Showcase</span>
                <span>your</span>
                <span className="inline-flex items-center rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#8DFF00] dark:text-[#090C09] px-3 sm:px-4 py-0.5 sm:py-1 shadow-sm border border-white/10 dark:border-transparent tracking-tight font-black">
                  work<span className="text-[#8DFF00] dark:text-[#090C09]">.</span>
                </span>
              </motion.span>
            </span>

            <span className="block w-full text-center overflow-hidden mt-1 sm:mt-2">
              <motion.span
                className="inline-flex flex-wrap items-baseline justify-center gap-2.5 sm:gap-4 text-[var(--primary-forest-green)] dark:text-white text-center"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span>Connect</span>
                <span>with</span>
                <span className="inline-flex items-center rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#8DFF00] dark:text-[#090C09] px-3 sm:px-4 py-0.5 sm:py-1 shadow-sm border border-white/10 dark:border-transparent tracking-tight font-black">
                  makers<span className="text-[#8DFF00] dark:text-[#090C09]">.</span>
                </span>
              </motion.span>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-6 sm:mt-8 text-base sm:text-xl text-[var(--content-secondary)] max-w-2xl leading-relaxed font-normal text-center mx-auto"
          >
            A modern portfolio platform to publish your projects, build your studio profile, and discover inspiring work from designers worldwide.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.38,
              ease: [0.16, 1, 0.3, 1],
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
          <div className="mt-12 sm:mt-14 pt-10 sm:pt-12 border-t border-[var(--border-neutral)] grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl text-center">
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
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: FEATURED PROJECTS (4 Projects Grid)                            */}
      {/* ========================================================================= */}
      {featuredProjects.length > 0 && (
        <section className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full">
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
            {featuredProjects.map((project) => (
              <div key={project.id}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* DYNAMIC CATEGORY SHOWCASES (Only non-empty categories)                     */}
      {/* For Authenticated Users: Render all active categories with projects       */}
      {/* For Guests: Render top 3 categories + Sign Up CTA banner                  */}
      {/* ========================================================================= */}
      {(user ? categorySections : categorySections.slice(0, 3)).map((section) => {
        const IconComponent = CATEGORY_ICONS[section.taxonomy.id] || LayoutGrid;

        return (
          <section
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
              {section.projects.map((project) => (
                <div key={project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ========================================================================= */}
      {/* HIGH-CONVERSION CREATOR CTA SECTION (Only for Guests / Not Logged In)     */}
      {/* ========================================================================= */}
      {!user && (
        <section className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full pt-4 pb-8">
          <div className="relative rounded-[28px] bg-neutral-950 dark:bg-[#121511] text-white border border-neutral-800 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-xl">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Headline, Subtitle, Clean Action Buttons */}
              <div className="lg:col-span-7 space-y-6">
                <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400">
                  Join the Community
                </span>

                <h2
                  className={cn(
                    bricolage.className,
                    "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]"
                  )}
                >
                  Ready to showcase your work to the world?
                </h2>

                <p className="text-sm sm:text-base text-neutral-300 max-w-lg leading-relaxed font-normal">
                  Publish detailed design case studies, build your portfolio, and connect with creative peers and top studios worldwide.
                </p>

                {/* Clean High-Contrast Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-bold bg-white text-neutral-950 hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Sign up free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/explore"
                    className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-5 text-sm font-semibold border border-neutral-700 bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    <span>Explore projects</span>
                  </Link>
                </div>

                {/* Subtle Social Proof */}
                <div className="flex items-center gap-3 pt-2 text-xs text-neutral-400">
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

              {/* Right Column: Clean, Minimalist Featured Preview */}
              {(featuredProjects[0] || publishedProjects[0]) && (
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <Link
                    href={`/project/${(featuredProjects[0] || publishedProjects[0]).slug}`}
                    className="group block w-full max-w-sm rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 transition-all duration-300 shadow-lg"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                      <Image
                        src={(featuredProjects[0] || publishedProjects[0]).coverImage}
                        alt={(featuredProjects[0] || publishedProjects[0]).title}
                        fill
                        sizes="380px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-neutral-200">
                          {(featuredProjects[0] || publishedProjects[0]).title}
                        </h3>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          by {(featuredProjects[0] || publishedProjects[0]).creator.displayName}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-neutral-400 group-hover:text-white flex items-center gap-1">
                        View <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
