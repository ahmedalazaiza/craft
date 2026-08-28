"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

export type EmptyStateType =
  | "projects"
  | "creators"
  | "search"
  | "drafts"
  | "notifications";

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 3D Isometric Projects Monograph Illustration
 */
function Isometric3DProjects() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      {/* Ambient Radial Floor Glow */}
      <div className="absolute inset-0 rounded-full bg-[#8DFF00]/15 blur-2xl dark:bg-[#8DFF00]/20 pointer-events-none" />

      {/* Isometric 3D Layer Stack */}
      <motion.svg
        viewBox="0 0 160 160"
        className="w-28 h-28 drop-shadow-xl"
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          <linearGradient id="isoTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-elevated)" />
            <stop offset="100%" stopColor="var(--bg-neutral)" />
          </linearGradient>
          <linearGradient id="isoAccentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8DFF00" />
            <stop offset="100%" stopColor="#68CC00" />
          </linearGradient>
          <linearGradient id="isoLeftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--border-neutral)" />
            <stop offset="100%" stopColor="var(--bg-dimmer)" />
          </linearGradient>
        </defs>

        {/* Base Shadow Disk */}
        <ellipse
          cx="80"
          cy="135"
          rx="52"
          ry="14"
          className="fill-black/15 dark:fill-black/40 blur-xs"
        />

        {/* Bottom 3D Isometric Plate (Base Layer) */}
        <g transform="translate(0, 24)">
          <path
            d="M80 50 L125 76 L80 102 L35 76 Z"
            fill="url(#isoTopGrad)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M35 76 L80 102 L80 110 L35 84 Z"
            fill="var(--bg-screen)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M125 76 L80 102 L80 110 L125 84 Z"
            fill="var(--border-neutral)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
        </g>

        {/* Floating Middle Isometric Plate with Neon Accent */}
        <g transform="translate(0, 10)">
          <path
            d="M80 40 L125 66 L80 92 L35 66 Z"
            fill="url(#isoTopGrad)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M35 66 L80 92 L80 98 L35 72 Z"
            fill="var(--bg-screen)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M125 66 L80 92 L80 98 L125 72 Z"
            fill="url(#isoAccentGrad)"
            stroke="#8DFF00"
            strokeWidth="1.5"
          />
        </g>

        {/* Top Hero Floating 3D Plate with Grid lines */}
        <g transform="translate(0, -4)">
          <path
            d="M80 30 L125 56 L80 82 L35 56 Z"
            fill="url(#isoTopGrad)"
            stroke="var(--border-neutral)"
            strokeWidth="2"
          />
          {/* Inner Grid Wireframe Lines */}
          <path
            d="M65 39 L110 65 M50 48 L95 74 M95 39 L50 65 M110 48 L65 74"
            stroke="var(--border-neutral)"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <path
            d="M35 56 L80 82 L80 88 L35 62 Z"
            fill="var(--bg-screen)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M125 56 L80 82 L80 88 L125 62 Z"
            fill="var(--primary-forest-green)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />

          {/* Glowing Isometric Focal Diamond */}
          <path
            d="M80 48 L92 55 L80 62 L68 55 Z"
            fill="url(#isoAccentGrad)"
            className="drop-shadow-[0_0_8px_rgba(141,255,0,0.8)]"
          />
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * 3D Isometric Creators & Studio Network Illustration
 */
function Isometric3DCreators() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      <div className="absolute inset-0 rounded-full bg-[#8DFF00]/15 blur-2xl dark:bg-[#8DFF00]/20 pointer-events-none" />

      <motion.svg
        viewBox="0 0 160 160"
        className="w-28 h-28 drop-shadow-xl"
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          <linearGradient id="creatorBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-elevated)" />
            <stop offset="100%" stopColor="var(--bg-neutral)" />
          </linearGradient>
          <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8DFF00" />
            <stop offset="100%" stopColor="#52A300" />
          </linearGradient>
        </defs>

        <ellipse
          cx="80"
          cy="135"
          rx="50"
          ry="14"
          className="fill-black/15 dark:fill-black/40 blur-xs"
        />

        {/* 3D Isometric Interconnected Grid Base */}
        <path
          d="M80 60 L130 88 L80 116 L30 88 Z"
          fill="url(#creatorBaseGrad)"
          stroke="var(--border-neutral)"
          strokeWidth="1.5"
        />
        <path
          d="M30 88 L80 116 L80 124 L30 96 Z"
          fill="var(--bg-screen)"
          stroke="var(--border-neutral)"
          strokeWidth="1.5"
        />
        <path
          d="M130 88 L80 116 L80 124 L130 96 Z"
          fill="var(--border-neutral)"
          stroke="var(--border-neutral)"
          strokeWidth="1.5"
        />

        {/* Interconnected Connecting Lines */}
        <line x1="55" y1="74" x2="80" y2="88" stroke="#8DFF00" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="105" y1="74" x2="80" y2="88" stroke="#8DFF00" strokeWidth="2" strokeDasharray="3 2" />

        {/* Left Creator Node (3D Isometric Cylinder / Sphere) */}
        <g transform="translate(55, 66)">
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="var(--bg-elevated)" stroke="var(--border-neutral)" strokeWidth="1.5" />
          <circle cx="0" cy="-6" r="6" fill="var(--content-secondary)" />
        </g>

        {/* Right Creator Node */}
        <g transform="translate(105, 66)">
          <ellipse cx="0" cy="0" rx="10" ry="6" fill="var(--bg-elevated)" stroke="var(--border-neutral)" strokeWidth="1.5" />
          <circle cx="0" cy="-6" r="6" fill="var(--content-secondary)" />
        </g>

        {/* Center Main Glowing Creator 3D Monolith */}
        <g transform="translate(80, 52)">
          <path
            d="M0 -22 L14 -14 L0 -6 L-14 -14 Z"
            fill="url(#neonGlow)"
            className="drop-shadow-[0_0_10px_rgba(141,255,0,0.9)]"
          />
          <path d="M-14 -14 L0 -6 L0 10 L-14 2 Z" fill="#68CC00" />
          <path d="M14 -14 L0 -6 L0 10 L14 2 Z" fill="#4B9400" />
          <circle cx="0" cy="-30" r="8" fill="url(#neonGlow)" className="drop-shadow-[0_0_8px_#8DFF00]" />
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * 3D Isometric Search Compass & Lens Illustration
 */
function Isometric3DSearch() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      <div className="absolute inset-0 rounded-full bg-[#8DFF00]/15 blur-2xl dark:bg-[#8DFF00]/20 pointer-events-none" />

      <motion.svg
        viewBox="0 0 160 160"
        className="w-28 h-28 drop-shadow-xl"
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ellipse
          cx="80"
          cy="135"
          rx="48"
          ry="14"
          className="fill-black/15 dark:fill-black/40 blur-xs"
        />

        {/* Base Grid Plane */}
        <path
          d="M80 60 L125 86 L80 112 L35 86 Z"
          fill="var(--bg-elevated)"
          stroke="var(--border-neutral)"
          strokeWidth="1.5"
        />

        {/* 3D Isometric Magnifying Lens Ring */}
        <g transform="translate(80, 58) rotate(-25)">
          {/* Lens Glass */}
          <ellipse
            cx="0"
            cy="0"
            rx="28"
            ry="18"
            fill="var(--bg-screen)"
            stroke="#8DFF00"
            strokeWidth="3"
            className="drop-shadow-[0_0_12px_rgba(141,255,0,0.5)]"
          />
          {/* Glass Refraction Streak */}
          <path
            d="M-14 -6 Q 0 0 14 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* 3D Handle */}
          <path
            d="M24 10 L44 26 L38 32 L18 16 Z"
            fill="var(--primary-forest-green)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * 3D Isometric Drafts Box Illustration
 */
function Isometric3DDrafts() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-32 h-32 flex items-center justify-center select-none">
      <div className="absolute inset-0 rounded-full bg-[#8DFF00]/15 blur-2xl dark:bg-[#8DFF00]/20 pointer-events-none" />

      <motion.svg
        viewBox="0 0 160 160"
        className="w-28 h-28 drop-shadow-xl"
        animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ellipse
          cx="80"
          cy="135"
          rx="48"
          ry="14"
          className="fill-black/15 dark:fill-black/40 blur-xs"
        />

        {/* 3D Isometric Open Studio Box */}
        <g transform="translate(0, 16)">
          <path
            d="M80 50 L120 73 L80 96 L40 73 Z"
            fill="var(--bg-elevated)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M40 73 L80 96 L80 114 L40 91 Z"
            fill="var(--bg-screen)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
          <path
            d="M120 73 L80 96 L80 114 L120 91 Z"
            fill="var(--border-neutral)"
            stroke="var(--border-neutral)"
            strokeWidth="1.5"
          />
        </g>

        {/* Floating Drafting Blueprint Sheet */}
        <g transform="translate(0, -6)">
          <path
            d="M80 32 L115 52 L80 72 L45 52 Z"
            fill="var(--bg-neutral)"
            stroke="#8DFF00"
            strokeWidth="2"
            className="drop-shadow-[0_0_10px_rgba(141,255,0,0.4)]"
          />
          <line x1="60" y1="46" x2="100" y2="46" stroke="#8DFF00" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="55" y1="54" x2="95" y2="54" stroke="#8DFF00" strokeWidth="1" strokeDasharray="3 2" />
        </g>
      </motion.svg>
    </div>
  );
}

/**
 * Main Universal EmptyState3D Component
 */
export function EmptyState3D({
  type = "projects",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    switch (type) {
      case "creators":
        return <Isometric3DCreators />;
      case "search":
        return <Isometric3DSearch />;
      case "drafts":
        return <Isometric3DDrafts />;
      case "projects":
      case "notifications":
      default:
        return <Isometric3DProjects />;
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30 p-10 sm:p-14 text-center my-6 transition-colors select-none",
        className
      )}
    >
      {/* 3D Animated Illustration */}
      <div className="mb-4">{renderIcon()}</div>

      {/* Title */}
      <h3
        className={cn(
          bricolage.className,
          "type-title-subsection text-[var(--content-primary)] font-bold text-lg sm:text-xl tracking-tight"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 type-body-default text-[var(--content-secondary)] max-w-md text-xs sm:text-sm leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
