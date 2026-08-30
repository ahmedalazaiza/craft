"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { bricolage } from "@/lib/fonts";
import { useSession } from "@/lib/session-context";
import { ProjectCard } from "@/components/project/project-card";
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
  const { projects } = useSession();
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
        className="relative overflow-hidden rounded-[36px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-8 sm:p-12 lg:p-16 text-center shadow-xl transition-all"
      >
        {/* Subtle Ambient Background Spotlight that follows mouse */}
        <div
          className="pointer-events-none absolute -inset-px opacity-25 dark:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x || 300}px ${
              mousePos.y || 200
            }px, rgba(141, 255, 0, 0.22), transparent 80%)`,
          }}
        />

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center space-y-6">
          {/* Interactive Radar Compass Widget with High Contrast Surface */}
          <div className="relative group cursor-crosshair">
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-neutral-900 border-2 border-neutral-800 dark:border-neutral-700 shadow-2xl transition-transform duration-300 group-hover:scale-105">
              {/* Static Outer Ring with Degree Markers */}
              <div className="absolute inset-2 rounded-2xl border border-dashed border-neutral-700" />

              {/* Dynamic Rotating Compass Needle in High-Contrast Neon Green */}
              <motion.div
                className="relative flex items-center justify-center"
                animate={{ rotate: mousePos.angle }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <Compass className="h-12 w-12 sm:h-14 sm:w-14 text-[#8DFF00] drop-shadow-[0_0_12px_rgba(141,255,0,0.5)]" />
              </motion.div>

              {/* Central Pip Dot */}
              <div className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-xs" />
            </div>

            {/* High-Contrast Live Coordinate Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-neutral-900 border border-neutral-700 px-3 py-0.5 text-[10px] font-mono font-bold text-neutral-200 shadow-md">
              LAT 40.404° • LONG 0.000°
            </div>
          </div>

          {/* Error Chip */}
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 border border-neutral-800 dark:border-neutral-700 px-4 py-1.5 text-xs font-semibold shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#8DFF00] animate-pulse" />
            <span>404 Error</span>
            <span className="text-neutral-500">•</span>
            <span>Artifact Lost in the Layers</span>
          </div>

          {/* High-Contrast Title & Description */}
          <div className="space-y-3">
            <h1
              className={cn(
                bricolage.className,
                "text-4xl sm:text-6xl lg:text-7xl font-black text-neutral-950 dark:text-white tracking-tight leading-none"
              )}
            >
              Monograph or Studio Not Found
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto leading-relaxed font-normal">
              The project case study, creator profile, or resource you are looking for has been archived, renamed, or deleted from the registry.
            </p>
          </div>

          {/* Interactive Search Bar Directly in 404 */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-lg relative flex items-center pt-2"
          >
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search portfolios, creators, identities..."
                className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/90 pl-11 pr-28 py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 shadow-xs focus:border-neutral-900 dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 focus:outline-hidden transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-black dark:hover:bg-white px-4 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Discovery Quick Tags with Crisp Contrast */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isSurprising}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 text-xs font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              {isSurprising ? (
                <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-[#8DFF00] animate-spin" />
              ) : (
                <Shuffle className="h-3.5 w-3.5 text-emerald-600 dark:text-[#8DFF00]" />
              )}
              <span>Surprise Me 🎲</span>
            </button>

            <Link
              href="/explore?category=Brand%20Identity"
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-105 transition-all shadow-xs"
            >
              Brand Identity
            </Link>

            <Link
              href="/explore?category=UI%2FUX%20Design"
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-105 transition-all shadow-xs"
            >
              UI/UX Design
            </Link>

            <Link
              href="/creators"
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 hover:scale-105 transition-all shadow-xs"
            >
              Top Creators
            </Link>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <CornerUpLeft className="h-4 w-4" />
              <span>Go Back</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-7 text-sm font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-black dark:hover:bg-white shadow-md active:scale-95 transition-all"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-full h-12 px-6 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-700 shadow-xs active:scale-95 transition-all"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-600 dark:text-[#8DFF00]" />
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight"
                  )}
                >
                  While You&apos;re Here, Explore Curated Works
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                Handcrafted design monographs and case studies from top independent studios.
              </p>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:text-emerald-600 dark:hover:text-[#8DFF00] hover:underline shrink-0 transition-colors"
            >
              <span>View all projects</span>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-[#8DFF00]" />
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
