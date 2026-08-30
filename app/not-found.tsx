"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { bricolage } from "@/lib/fonts";
import { useSession } from "@/lib/session-context";
import { ProjectCard } from "@/components/project/project-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Compass,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shuffle,
  Flame,
  Home,
  CornerUpLeft,
  Layers,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();
  const { projects, creators } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSurprising, setIsSurprising] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, angle: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Top 3 featured or published works to discover
  const recommendedProjects = React.useMemo(() => {
    return projects.slice(0, 3);
  }, [projects]);

  // Calculate mouse angle relative to the central compass for interactive needle tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const rad = Math.atan2(deltaY, deltaX);
    const deg = (rad * 180) / Math.PI + 90; // Offset so 0 deg is UP

    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
      angle: deg,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/explore");
    }
  };

  const handleSurpriseMe = () => {
    if (projects.length === 0) {
      router.push("/explore");
      return;
    }
    setIsSurprising(true);
    const randomIndex = Math.floor(Math.random() * projects.length);
    const randomProject = projects[randomIndex];
    setTimeout(() => {
      router.push(`/project/${randomProject.slug}`);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Interactive Hero Container */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-[36px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-12 lg:p-16 text-center shadow-2xl transition-all"
      >
        {/* Subtle Ambient Background Spotlight that follows mouse */}
        <div
          className="pointer-events-none absolute -inset-px opacity-30 dark:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x || 300}px ${
              mousePos.y || 200
            }px, rgba(141, 255, 0, 0.18), transparent 80%)`,
          }}
        />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-neutral)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-neutral)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-6">
          {/* Interactive Radar Compass Widget */}
          <div className="relative group cursor-crosshair">
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-[var(--bg-neutral)] border-2 border-[var(--border-neutral)] shadow-lg transition-transform duration-300 group-hover:scale-105">
              {/* Static Outer Ring with Degree Markers */}
              <div className="absolute inset-2 rounded-2xl border border-dashed border-[var(--border-neutral)]" />

              {/* Dynamic Rotating Compass Needle */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={{ rotate: mousePos.angle }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <Compass className="h-12 w-12 sm:h-14 sm:w-14 text-[var(--accent)] drop-shadow-[0_0_12px_rgba(141,255,0,0.4)]" />
              </motion.div>

              {/* Central Ping Dot */}
              <div className="absolute h-2 w-2 rounded-full bg-[var(--content-primary)] shadow-xs" />
            </div>

            {/* Live Coordinate Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[var(--content-secondary)] shadow-sm">
              LAT 40.404° • LONG 0.000°
            </div>
          </div>

          {/* Error Chip */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-4 py-1.5 text-xs font-semibold text-[var(--chip-fg)] shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span>404 Error</span>
            <span className="text-[var(--content-tertiary)]">•</span>
            <span>Artifact Lost in the Layers</span>
          </div>

          {/* Big Stylized Heading */}
          <div className="space-y-2">
            <h1
              className={cn(
                bricolage.className,
                "text-4xl sm:text-6xl lg:text-7xl font-black text-[var(--content-primary)] tracking-tight leading-none"
              )}
            >
              Monograph or Studio Not Found
            </h1>
            <p className="text-sm sm:text-base text-[var(--content-secondary)] max-w-xl mx-auto leading-relaxed">
              The project case study, creator profile, or resource you are looking for has been archived, renamed, or deleted from the registry.
            </p>
          </div>

          {/* Interactive Search Bar Directly in 404 */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-lg relative flex items-center pt-2"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portfolios, creators, identities..."
                className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-screen)]/90 backdrop-blur-md pl-11 pr-28 py-3 text-xs sm:text-sm text-[var(--content-primary)] placeholder-[var(--content-tertiary)] shadow-inner focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-[var(--accent)] px-3.5 py-1.5 text-xs font-bold text-[#090C09] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Discovery Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isSurprising}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#8DFF00]/40 bg-[#8DFF00]/10 px-3 py-1.5 text-xs font-bold text-[var(--content-primary)] hover:bg-[#8DFF00]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              {isSurprising ? (
                <RefreshCw className="h-3.5 w-3.5 text-[var(--accent)] animate-spin" />
              ) : (
                <Shuffle className="h-3.5 w-3.5 text-[var(--accent)]" />
              )}
              <span>Surprise Me 🎲</span>
            </button>

            <Link
              href="/explore?category=Brand%20Identity"
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-secondary)] hover:scale-105 transition-all"
            >
              Brand Identity
            </Link>

            <Link
              href="/explore?category=UI%2FUX%20Design"
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-secondary)] hover:scale-105 transition-all"
            >
              UI/UX Design
            </Link>

            <Link
              href="/creators"
              className="rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)]/80 px-3 py-1.5 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-secondary)] hover:scale-105 transition-all"
            >
              Top Creators
            </Link>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold gap-2 cursor-pointer shadow-xs",
              })}
            >
              <CornerUpLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className={buttonVariants({
                variant: "accent",
                className: "font-bold gap-2 shadow-xs",
              })}
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/explore"
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold gap-2 shadow-xs",
              })}
            >
              <span>Explore Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* "While You're Here" Recommended Works */}
      {recommendedProjects.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-neutral)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[var(--accent)]" />
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-black text-[var(--content-primary)] tracking-tight"
                  )}
                >
                  While You&apos;re Here, Explore Curated Works
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--content-secondary)] mt-1">
                Handcrafted design monographs and case studies from top independent studios.
              </p>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline shrink-0"
            >
              <span>View all projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
