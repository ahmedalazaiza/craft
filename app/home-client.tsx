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
      {/* CENTERED MONUMENTAL HERO SECTION WITH AMBIENT AURA & PATTERN              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden border-b border-[var(--border-neutral)] bg-[var(--bg-screen)] min-h-[calc(100vh-64px)] flex items-center justify-center pt-12 pb-14 sm:pt-16 sm:pb-20 lg:py-24 text-center">
        {/* Ambient Animated Mesh Glows & Geometric Micro-Pattern */}
        <div className="absolute inset-0 pointer-events-none -z-10 select-none overflow-hidden">
          {/* Top Center Purple Luminous Aura */}
          {/* Center Brand Ambient Aura with Violet Glow */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.4, 0.65, 0.4],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[450px] sm:h-[600px] rounded-full bg-gradient-to-b from-[var(--brand-secondary-subtle)] via-[var(--brand-secondary-glow)]/15 to-transparent blur-[140px]"
          />

          {/* Left Subtle Ambient Neutral Aura */}
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [-15, 15, -15],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[20%] left-[8%] w-[380px] h-[380px] rounded-full bg-[var(--brand-secondary-subtle)]/40 blur-[120px]"
          />

          {/* Right Subtle Ambient Neutral Aura */}
          <motion.div
            animate={{
              x: [20, -20, 20],
              y: [15, -15, 15],
            }}
            transition={{
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-[25%] right-[8%] w-[380px] h-[380px] rounded-full bg-[var(--border-neutral)]/20 blur-[110px]"
          />

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

        <div className="w-full px-4 sm:px-6 lg:px-[140px] z-10 flex flex-col items-center justify-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bg-elevated)]/90 px-4 py-1.5 text-xs font-semibold text-[var(--content-primary)] mb-6 sm:mb-8 shadow-xs border border-[var(--border-neutral)] select-none mx-auto backdrop-blur-sm">
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
              "text-[44px] sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[92px] font-black tracking-[-0.04em] leading-[1.02] sm:leading-[0.96] text-[var(--content-primary)] text-center w-full flex flex-col items-center justify-center max-w-4xl"
            )}
          >
            <span className="block w-full text-center overflow-hidden">
              <span className="inline-flex flex-wrap items-baseline justify-center gap-2.5 sm:gap-4 text-[var(--content-primary)] text-center">
                <span>Showcase</span>
                <span>your</span>
                <span className="inline-flex items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black px-3.5 sm:px-4 py-0.5 sm:py-1 shadow-md tracking-tight font-black transition-transform hover:scale-105 duration-200">
                  work.
                </span>
              </span>
            </span>

            <span className="block w-full text-center overflow-hidden mt-1 sm:mt-2">
              <span className="inline-flex flex-wrap items-baseline justify-center gap-2.5 sm:gap-4 text-[var(--content-primary)] text-center">
                <span>Connect</span>
                <span>with</span>
                <span className="inline-flex items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black px-3.5 sm:px-4 py-0.5 sm:py-1 shadow-md tracking-tight font-black transition-transform hover:scale-105 duration-200">
                  makers.
                </span>
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 sm:mt-8 text-base sm:text-xl text-[var(--content-secondary)] max-w-2xl leading-relaxed font-normal text-center mx-auto">
            A modern portfolio platform to publish your projects, build your studio profile, and discover inspiring work from designers worldwide.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mx-auto max-w-md sm:max-w-none">
            <Link
              href="/explore"
              className={buttonVariants({
                variant: "accent",
                size: "lg",
                className: "w-full sm:w-auto gap-2 font-bold justify-center px-8 shadow-md transition-all hover:scale-102",
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
                  className: "w-full sm:w-auto gap-2 font-semibold justify-center px-8 hover:bg-[var(--bg-elevated)] transition-all hover:scale-102",
                })}
              >
                <Users className="h-4 w-4 text-[var(--content-primary)]" />
                <span>Explore Creators</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "w-full sm:w-auto font-semibold justify-center px-8 hover:bg-[var(--bg-elevated)] transition-all hover:scale-102",
                })}
              >
                Join as a Creator
              </Link>
            )}
          </div>

          {/* Minimalist 3-Point Value Manifesto (Refined Glass Cards) */}
          <div className="mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border-neutral)] grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl text-center">
            {FEATURE_POINTS.map((pt) => (
              <div
                key={pt.num}
                className="group relative rounded-2xl p-5 bg-[var(--bg-elevated)]/40 border border-[var(--border-neutral)]/70 hover:border-[var(--border-neutral)] hover:bg-[var(--bg-elevated)] transition-all duration-300 shadow-2xs hover:shadow-xs flex flex-col items-center text-center space-y-2.5 backdrop-blur-xs"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 py-1 text-xs font-mono font-bold tracking-wider shadow-2xs transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--chip-fg)] transition-colors" />
                  <span>{pt.num}</span>
                </div>
                <div className="text-sm font-bold text-[var(--content-primary)]">
                  {pt.title}
                </div>
                <p className="text-xs text-[var(--content-secondary)] leading-relaxed max-w-xs">
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
        <section className="w-full px-4 sm:px-6 lg:px-[140px]">
          <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[var(--content-primary)]" />
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
            className="w-full px-4 sm:px-6 lg:px-[140px]"
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
        <section className="w-full px-4 sm:px-6 lg:px-[140px] pt-6 pb-10">
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
