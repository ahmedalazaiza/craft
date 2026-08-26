"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { mockUsers } from "@/lib/mock";
import { ProjectCard } from "@/components/project/project-card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Distinct studio cards for the dual vertical kinetic streams
const STREAM_COLUMN_A = [
  {
    creator: mockUsers[0], // Elena Vance
    tag: "Brand Systems",
    city: "Berlin, DE",
    artifact: "Incised Grotesque Type",
    stat: "14 Case Studies",
  },
  {
    creator: mockUsers[2], // Maya Lin
    tag: "3D & Architecture",
    city: "London, UK",
    artifact: "Brutalist Concrete Space",
    stat: "9 Case Studies",
  },
  {
    creator: mockUsers[4], // Sophia Chen
    tag: "Industrial Hardware",
    city: "New York, USA",
    artifact: "Tactile Modular Synth",
    stat: "12 Case Studies",
  },
  {
    creator: mockUsers[0], // Loop duplicate for infinite feel
    tag: "Spatial Identity",
    city: "Berlin, DE",
    artifact: "Sanctuary Monograph",
    stat: "14 Case Studies",
  },
];

const STREAM_COLUMN_B = [
  {
    creator: mockUsers[1], // Kai Sato
    tag: "UI Interfaces",
    city: "Tokyo, JP",
    artifact: "Aurora High-Density OS",
    stat: "18 Case Studies",
  },
  {
    creator: mockUsers[3], // Marcus Keller
    tag: "Editorial & Print",
    city: "Zurich, CH",
    artifact: "Risograph Monographs",
    stat: "8 Case Studies",
  },
  {
    creator: mockUsers[5], // David Nordström
    tag: "Timber Craft",
    city: "Stockholm, SE",
    artifact: "Passive Acoustic Pavilion",
    stat: "11 Case Studies",
  },
  {
    creator: mockUsers[1], // Loop duplicate for infinite feel
    tag: "Creative Code",
    city: "Tokyo, JP",
    artifact: "Generative Shaders",
    stat: "18 Case Studies",
  },
];

const FEATURE_POINTS = [
  {
    num: "01",
    title: "Living Case Studies",
    desc: "Multi-image vertical spreads in native intrinsic resolution.",
  },
  {
    num: "02",
    title: "Creator Profiles",
    desc: "Showcase your studio identity, disciplines, and stack.",
  },
  {
    num: "03",
    title: "Zero Algorithmic Noise",
    desc: "Pure focus on singular craft, typography, and peer appreciation.",
  },
];

export function HomeClient() {
  const { projects } = useSession();
  const shouldReduceMotion = useReducedMotion();

  const publishedProjects = useMemo(() => {
    return projects.filter((p) => p.published);
  }, [projects]);

  // Curated Featured (4 items)
  const featuredProjects = useMemo(() => {
    return publishedProjects.filter((p) => p.featured).slice(0, 4);
  }, [publishedProjects]);

  // Latest in UI & Interaction Systems (4 items)
  const uiProjects = useMemo(() => {
    return publishedProjects
      .filter((p) => p.category === "UI" || p.tags.includes("UI"))
      .slice(0, 4);
  }, [publishedProjects]);

  // Latest in Brand & Editorial Systems (4 items)
  const brandProjects = useMemo(() => {
    return publishedProjects
      .filter(
        (p) =>
          p.category === "Brand" ||
          p.category === "Editorial" ||
          p.category === "Type"
      )
      .slice(0, 4);
  }, [publishedProjects]);

  // Latest in Architecture & Spatial Craft (4 items)
  const architectureProjects = useMemo(() => {
    return publishedProjects
      .filter(
        (p) =>
          p.category === "Architecture" ||
          p.category === "Photo" ||
          p.category === "Product"
      )
      .slice(0, 4);
  }, [publishedProjects]);

  const headlineLines = ["Showcase your work.", "Connect with makers."];

  return (
    <div className="flex flex-col gap-12 sm:gap-14 pb-14">
      {/* ========================================================================= */}
      {/* 2-COLUMN KINETIC STUDIO STREAM HERO                                       */}
      {/* ========================================================================= */}
      <section className="relative border-b border-[var(--border-neutral)] bg-gradient-to-b from-[var(--bg-neutral)]/20 via-[var(--bg-screen)] to-[var(--bg-screen)] min-h-[calc(100vh-64px)] flex items-center pt-5 pb-6 sm:pt-6 sm:pb-8 lg:py-8 overflow-hidden">
        {/* Ambient Radial Lime Glow */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-center -z-10"
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-[700px] h-[450px] sm:w-[950px] sm:h-[600px] rounded-full bg-[#8DFF00]/10 blur-[150px] top-1/4 right-0 sm:right-1/4"
          />
          {/* Architectural Dot Grid Matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-neutral)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-20" />
        </div>

        <div className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* =================================================================== */}
            {/* LEFT COLUMN: Editorial Typography & Manifesto (7 cols)               */}
            {/* =================================================================== */}
            <div className="lg:col-span-7 flex flex-col justify-center max-w-2xl">
              {/* Eyebrow Pill */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: MOTION_EASE }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3.5 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-6 sm:mb-8 w-fit shadow-xs border border-white/10"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
                <span>Craft Platform</span>
                <span className="text-[var(--content-tertiary)]">•</span>
                <span className="text-[var(--chip-fg)] font-normal">Independent Creators</span>
              </motion.div>

              {/* Monumental Editorial Headline with Typographic Interplay */}
              <h1
                className={cn(
                  bricolage.className,
                  "text-5xl sm:text-6xl md:text-7xl lg:text-[74px] xl:text-[84px] font-black tracking-[-0.04em] leading-[0.98] text-[var(--primary-forest-green)]"
                )}
              >
                <span className="block overflow-hidden">
                  <motion.span
                    className="block text-[var(--primary-forest-green)]"
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: shouldReduceMotion ? 0 : 0.08,
                      ease: MOTION_EASE,
                    }}
                  >
                    Showcase your work<span className="text-[#8DFF00] font-black">.</span>
                  </motion.span>
                </span>

                <span className="block overflow-hidden mt-1.5 sm:mt-2.5">
                  <motion.span
                    className="inline-flex flex-wrap items-baseline gap-2.5 sm:gap-3.5 text-[var(--content-primary)]"
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: shouldReduceMotion ? 0 : 0.18,
                      ease: MOTION_EASE,
                    }}
                  >
                    <span>Connect with</span>
                    <span className="relative inline-flex items-center px-3.5 sm:px-4 py-0.5 sm:py-1 rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] font-black text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[78px] shadow-sm border border-white/10 align-middle">
                      <span>makers</span>
                      <span className="text-[#8DFF00] ml-0.5">.</span>
                    </span>
                  </motion.span>
                </span>
              </h1>

              {/* Punchy Subline */}
              <motion.p
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: shouldReduceMotion ? 0 : 0.28,
                  ease: MOTION_EASE,
                }}
                className="mt-6 sm:mt-8 text-lg sm:text-xl text-[var(--content-secondary)] max-w-xl leading-relaxed font-normal"
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
                className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4"
              >
                <Link href="/explore">
                  <Button variant="accent" size="lg" className="gap-2 shadow-sm">
                    <span>Explore Projects</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="secondary" size="lg">
                    Join as a Creator
                  </Button>
                </Link>
              </motion.div>

              {/* Minimalist 3-Point Value Manifesto (High-Contrast Clean Numbers) */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.48 }}
                className="mt-10 pt-8 border-t border-[var(--border-neutral)] grid grid-cols-1 sm:grid-cols-3 gap-5"
              >
                {FEATURE_POINTS.map((pt) => (
                  <div key={pt.num} className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8DFF00]" />
                      <span>{pt.num}</span>
                    </div>
                    <div className="text-xs font-bold text-[var(--content-primary)]">
                      {pt.title}
                    </div>
                    <p className="text-[11px] text-[var(--content-tertiary)] leading-normal">
                      {pt.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: Kinetic Dual-Column Creator Stream (5 cols)             */}
            {/* =================================================================== */}
            <div className="lg:col-span-5 relative flex justify-center h-[460px] sm:h-[520px] overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/60 backdrop-blur-md p-4 shadow-[0_20px_50px_rgba(9,12,9,0.06)]">
              {/* Vertical Gradient Fade Masks (Top and Bottom) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--bg-elevated)] to-transparent z-20" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--bg-elevated)] to-transparent z-20" />

              {/* Dual Sliding Streams */}
              <div className="grid grid-cols-2 gap-3.5 w-full h-full">
                {/* Stream Column 1: Gliding Upward */}
                <div className="flex flex-col gap-3.5 overflow-hidden">
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: ["0%", "-50%"],
                          }
                    }
                    transition={{
                      duration: 18,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-3.5"
                  >
                    {[...STREAM_COLUMN_A, ...STREAM_COLUMN_A].map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/u/${item.creator.username}`}
                        className="group p-3.5 rounded-[18px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] hover:shadow-lg dark:hover:border-white/30 transition-all cursor-pointer block"
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] shrink-0">
                            <Image
                              src={item.creator.avatarUrl}
                              alt={item.creator.displayName}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-[var(--content-primary)] truncate transition-colors">
                              {item.creator.displayName}
                            </div>
                            <div className="text-[10px] text-[var(--content-tertiary)] flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{item.city}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 rounded-[10px] bg-[var(--bg-neutral)] text-left mb-2">
                          <span className="block text-[10px] font-mono uppercase text-[var(--content-tertiary)]">
                            Focus:
                          </span>
                          <span className="text-xs font-semibold text-[var(--content-primary)] truncate block">
                            {item.artifact}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--content-secondary)]">
                          <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2 py-0.5 text-[10px]">
                            {item.tag}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-[var(--content-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                </div>

                {/* Stream Column 2: Gliding Downward */}
                <div className="flex flex-col gap-3.5 overflow-hidden">
                  <motion.div
                    animate={
                      shouldReduceMotion
                        ? {}
                        : {
                            y: ["-50%", "0%"],
                          }
                    }
                    transition={{
                      duration: 22,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex flex-col gap-3.5"
                  >
                    {[...STREAM_COLUMN_B, ...STREAM_COLUMN_B].map((item, idx) => (
                      <Link
                        key={idx}
                        href={`/u/${item.creator.username}`}
                        className="group p-3.5 rounded-[18px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] hover:shadow-lg dark:hover:border-white/30 transition-all cursor-pointer block"
                      >
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] shrink-0">
                            <Image
                              src={item.creator.avatarUrl}
                              alt={item.creator.displayName}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-[var(--content-primary)] truncate transition-colors">
                              {item.creator.displayName}
                            </div>
                            <div className="text-[10px] text-[var(--content-tertiary)] flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{item.city}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 rounded-[10px] bg-[var(--bg-neutral)] text-left mb-2">
                          <span className="block text-[10px] font-mono uppercase text-[var(--content-tertiary)]">
                            Focus:
                          </span>
                          <span className="text-xs font-semibold text-[var(--content-primary)] truncate block">
                            {item.artifact}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--content-secondary)]">
                          <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2 py-0.5 text-[10px]">
                            {item.tag}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-[var(--content-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Floating Studio Badge on Center Bottom of Marquee */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--base-dark)]/90 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-white shadow-md border border-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DFF00]" />
                  <span>Live Studio Directory</span>
                </span>
              </div>
            </div>
          </div>
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
                  Hand-Curated Selection
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Featured Works
              </h2>
              <p className="type-body-default text-[var(--content-secondary)] mt-1">
                Exemplary monographs, brand systems, and hardware interfaces hand-picked by our curators.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)]"
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
      {/* SECTION 2: LATEST IN UI & INTERFACE SYSTEMS (4 Projects Grid)             */}
      {/* ========================================================================= */}
      {uiProjects.length > 0 && (
        <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full">
          <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                  Interaction & Systems
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Latest in UI & Interaction Design
              </h2>
              <p className="type-body-default text-[var(--content-secondary)] mt-1">
                High-density operating interfaces, creative shader tools, and production design systems.
              </p>
            </div>
            <Link
              href="/explore?category=UI"
              className="hidden sm:inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)]"
            >
              <span>Explore UI</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {uiProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        </ScrollRevealSection>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: LATEST IN BRAND & EDITORIAL SYSTEMS (4 Projects Grid)          */}
      {/* ========================================================================= */}
      {brandProjects.length > 0 && (
        <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full">
          <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                  Identity & Typography
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Latest in Brand & Editorial Craft
              </h2>
              <p className="type-body-default text-[var(--content-secondary)] mt-1">
                Risograph monographs, variable typographic specimens, and minimal identity systems.
              </p>
            </div>
            <Link
              href="/explore?category=Brand"
              className="hidden sm:inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)]"
            >
              <span>Explore Branding</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        </ScrollRevealSection>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: LATEST IN ARCHITECTURE & SPATIAL (4 Projects Grid)             */}
      {/* ========================================================================= */}
      {architectureProjects.length > 0 && (
        <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full">
          <div className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-[var(--border-neutral)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                  Physical & Spatial
                </span>
              </div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]"
                )}
              >
                Latest in Architecture & Spatial Design
              </h2>
              <p className="type-body-default text-[var(--content-secondary)] mt-1">
                Timber joinery observatories, monolithic brutalist photography, and tactile hardware.
              </p>
            </div>
            <Link
              href="/explore?category=Architecture"
              className="hidden sm:inline-flex items-center gap-1.5 type-body-default font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)]"
            >
              <span>Explore Architecture</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {architectureProjects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <ProjectCard project={project} />
              </StaggerGridItem>
            ))}
          </div>
        </ScrollRevealSection>
      )}

      {/* ========================================================================= */}
      {/* HIGH-CONVERSION CREATOR CTA SECTION (2 Columns with Visual Card)          */}
      {/* ========================================================================= */}
      <ScrollRevealSection className="mx-auto max-w-[1580px] px-4 sm:px-6 w-full pt-4">
        <div className="relative rounded-[32px] bg-[var(--base-dark)] text-white border border-white/10 p-8 sm:p-12 lg:p-14 overflow-hidden shadow-[0_24px_64px_rgba(9,12,9,0.18)]">
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
                <span>Independent Creator Collective</span>
              </div>

              {/* Monumental 2-Line Headline */}
              <h2
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-black tracking-tight text-white leading-[1.04]"
                )}
              >
                <span className="block">Ready to showcase your craft?</span>
                <span className="block text-[#8DFF00]">
                  Join the creator collective.
                </span>
              </h2>

              <p className="mt-4 text-base sm:text-lg text-white/80 leading-relaxed max-w-xl font-normal">
                Publish living monographs, build your studio presence, and connect with fellow designers, art directors, and creative engineers.
              </p>

              {/* Value Checkmarks */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                  <span>Zero algorithmic noise</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                  <span>Intrinsic resolution spreads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DFF00]" />
                  <span>Direct peer appreciation</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/signup">
                  <Button
                    variant="accent"
                    size="lg"
                    className="gap-2 font-bold shadow-lg"
                  >
                    <span>Join as a Creator</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    Explore All Projects
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Case Study Showcase Card & Creator Pile (5 cols) */}
            <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end justify-center">
              {/* Main Floating Monograph Showcase Card */}
              <div className="w-full max-w-md rounded-[24px] bg-white/10 backdrop-blur-xl border border-white/20 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02] duration-300">
                {/* Creator Header */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-white/30 shrink-0">
                      <Image
                        src={mockUsers[0].avatarUrl}
                        alt={mockUsers[0].displayName}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>{mockUsers[0].displayName}</span>
                        <CheckCircle2 className="h-3 w-3 text-[#8DFF00]" />
                      </div>
                      <div className="text-[10px] text-white/70">
                        {mockUsers[0].location}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8DFF00]/20 text-[#8DFF00] px-2.5 py-0.5 text-[10px] font-mono font-bold border border-[#8DFF00]/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8DFF00]" />
                    Featured Monograph
                  </span>
                </div>

                {/* Case Study Image Preview */}
                <div className="relative w-full aspect-[16/10] rounded-[16px] overflow-hidden bg-black/40 mb-3 group">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
                    alt="Sanctuary Monograph"
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold truncate">
                      Sanctuary: Spatial Identity
                    </span>
                    <span className="text-[11px] text-[#8DFF00] font-mono shrink-0">
                      ♥ 248
                    </span>
                  </div>
                </div>

                {/* Card Footer Stack & Community Stats */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center -space-x-2">
                    {mockUsers.slice(0, 4).map((u) => (
                      <div
                        key={u.id}
                        className="relative h-6 w-6 rounded-full overflow-hidden ring-2 ring-[var(--base-dark)]"
                      >
                        <Image
                          src={u.avatarUrl}
                          alt={u.displayName}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8DFF00] text-[9px] font-black text-[#090C09] ring-2 ring-[var(--base-dark)]">
                      +1.2k
                    </div>
                  </div>

                  <span className="text-[11px] text-white/80 font-medium">
                    Verified Makers Worldwide
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollRevealSection>
    </div>
  );
}
