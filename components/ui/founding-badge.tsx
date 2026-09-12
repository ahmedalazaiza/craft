"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";

interface FoundingBadgeProps {
  variant?: "pill" | "avatar";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
  showTooltip?: boolean;
  position?: "top" | "bottom";
  tooltipClassName?: string;
}

export function FoundingBadge({
  variant = "pill",
  size = "default",
  className,
  showTooltip = true,
  position = "bottom",
  tooltipClassName,
}: FoundingBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close on outside click (especially on touch devices)
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[9px] gap-1",
    sm: "px-2 py-0.5 text-[10px] gap-1",
    default: "px-2.5 py-0.5 text-[11px] gap-1.5",
    lg: "px-3 py-1 text-xs gap-1.5",
  };

  const iconSizes = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  // Strictly proportional sizing calibrated against avatar dimensions
  // xs: ~14px (for ≤32px avatars)
  // sm: ~16px (for 36-44px avatars, e.g. dropdown 44px, compact list 40px)
  // default: ~18-20px (for 48-56px avatars, e.g. creators showcase 48-56px)
  // lg: ~26-28px (for 96-112px hero profile avatars)
  const avatarSizeClasses = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    default: "h-4.5 w-4.5 sm:h-5 sm:w-5",
    lg: "h-6.5 w-6.5 sm:h-7 sm:w-7",
  };

  const avatarIconSizes = {
    xs: "h-2 w-2",
    sm: "h-2.5 w-2.5",
    default: "h-2.5 w-2.5 sm:h-3 sm:w-3",
    lg: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  };

  const avatarRingClasses = {
    xs: "ring-1 ring-[var(--bg-elevated)]",
    sm: "ring-1.5 ring-[var(--bg-elevated)]",
    default: "ring-1.5 sm:ring-2 ring-[var(--bg-elevated)]",
    lg: "ring-2 sm:ring-[2.5px] ring-[var(--bg-elevated)]",
  };

  const avatarShadowClasses = {
    xs: "shadow-2xs hover:shadow-[0_0_8px_var(--brand-secondary-glow)]",
    sm: "shadow-xs hover:shadow-[0_0_12px_var(--brand-secondary-glow)]",
    default: "shadow-[0_1px_6px_rgba(133,16,222,0.35)] hover:shadow-[0_0_14px_var(--brand-secondary-glow)]",
    lg: "shadow-[0_2px_10px_rgba(133,16,222,0.4)] hover:shadow-[0_0_18px_var(--brand-secondary-glow)]",
  };

  return (
    <span
      ref={containerRef}
      role={showTooltip ? "button" : undefined}
      tabIndex={showTooltip ? 0 : undefined}
      aria-label="Founding Member — An early visionary creator who helped shape Layerat from day one."
      onMouseEnter={showTooltip && !isMobile ? () => setIsOpen(true) : undefined}
      onMouseLeave={showTooltip && !isMobile ? () => setIsOpen(false) : undefined}
      onFocus={showTooltip && !isMobile ? () => setIsOpen(true) : undefined}
      onBlur={showTooltip && !isMobile ? () => setIsOpen(false) : undefined}
      onClick={
        showTooltip
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }
          : undefined
      }
      onKeyDown={
        showTooltip
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }
            }
          : undefined
      }
      className={cn(
        "relative inline-flex items-center justify-center select-none transition-all duration-200 focus:outline-hidden",
        showTooltip ? "cursor-pointer" : "cursor-default",
        variant === "avatar"
          ? cn(
              "rounded-full bg-gradient-to-tr from-[#6810a6] via-[var(--brand-secondary)] to-[#a855f7] text-white",
              avatarRingClasses[size],
              avatarShadowClasses[size],
              showTooltip && "hover:scale-110 active:scale-95",
              avatarSizeClasses[size]
            )
          : cn(
              "rounded-full font-bold uppercase tracking-wider",
              "bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary-hover)] text-white border border-transparent",
              "shadow-xs hover:shadow-[0_0_14px_var(--brand-secondary-glow)]",
              showTooltip && "active:scale-95",
              sizeClasses[size]
            ),
        isOpen && "z-50",
        className
      )}
      title={showTooltip ? "Founding Member" : undefined}
    >
      <Sparkles
        className={cn(
          variant === "avatar" ? avatarIconSizes[size] : iconSizes[size],
          "text-white fill-white/40 shrink-0 transition-transform duration-300 group-hover:rotate-12 drop-shadow-xs"
        )}
      />
      {variant === "pill" && <span className="text-white font-bold">Founding Member</span>}

      {/* ================================================================= */}
      {/* CUSTOM BRANDED LAYERAT TOOLTIP                                   */}
      {/* ================================================================= */}
      {/* ================================================================= */}
      {/* DESKTOP BRANDED TOOLTIP (>= 640px, hover-activated, anchored)     */}
      {/* ================================================================= */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && showTooltip && (
            <motion.div
              initial={{
                opacity: 0,
                y: position === "top" ? 6 : -6,
                scale: 0.94,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: position === "top" ? 4 : -4,
                scale: 0.96,
              }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              role="tooltip"
              className={cn(
                inter.className,
                "absolute z-[100] w-72 max-w-[calc(100vw-32px)] p-4 rounded-[20px] select-none text-left pointer-events-none font-normal",
                position === "top"
                  ? "bottom-full mb-2.5"
                  : "top-full mt-2.5",
                "left-1/2 -translate-x-1/2",
                "bg-white dark:bg-[#121214]",
                "border border-[var(--brand-secondary)]/30 dark:border-[var(--brand-secondary)]/25",
                "shadow-[0_20px_45px_rgba(0,0,0,0.14),0_2px_8px_var(--brand-secondary-subtle)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.7),0_0_24px_var(--brand-secondary-glow)]",
                tooltipClassName
              )}
            >
              {/* Ambient subtle glow inside tooltip card */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-[var(--brand-secondary-subtle)] rounded-full blur-xl pointer-events-none" />

              {/* Header: Badge Tag + Brand Seal */}
              <div className="relative flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--brand-secondary)] text-white text-[11px] font-bold shadow-2xs">
                  <Sparkles className="h-3 w-3 fill-white/40 text-white shrink-0" />
                  <span>Founding Member</span>
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Layerat
                </span>
              </div>

              {/* Body Description */}
              <p className="relative text-[13px] text-neutral-900 dark:text-neutral-100 font-normal leading-relaxed mt-2.5 normal-case tracking-normal">
                An early visionary creator who helped shape Layerat from day one.
              </p>

              {/* Footer Distinction */}
              <div className="relative flex items-center justify-between gap-2 pt-2.5 mt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)] animate-pulse" />
                  <span>Honorary Distinction</span>
                </span>
                <span className="text-[var(--brand-secondary)] font-bold">
                  Lifetime
                </span>
              </div>

              {/* Arrow Caret */}
              <div
                className={cn(
                  "absolute h-2.5 w-2.5 rotate-45 bg-white dark:bg-[#121214] left-1/2 -translate-x-1/2",
                  position === "top"
                    ? "top-full -mt-[6px] border-b border-r border-[var(--brand-secondary)]/30 dark:border-[var(--brand-secondary)]/25"
                    : "bottom-full -mb-[6px] border-t border-l border-[var(--brand-secondary)]/30 dark:border-[var(--brand-secondary)]/25"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ================================================================= */}
      {/* MOBILE CENTERED MODAL POPUP (< 640px, always centered on screen) */}
      {/* ================================================================= */}
      {mounted &&
        isMobile &&
        createPortal(
          <AnimatePresence>
            {isOpen && showTooltip && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                role="presentation"
              >
                {/* Backdrop Overlay with blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />

                {/* Centered Modal Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 6 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Founding Member Distinction"
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    inter.className,
                    "relative z-10 w-full max-w-[320px] p-5 rounded-[24px] select-none text-left font-normal",
                    "bg-white dark:bg-[#121214]",
                    "border border-[var(--brand-secondary)]/35 dark:border-[var(--brand-secondary)]/30",
                    "shadow-[0_24px_60px_rgba(0,0,0,0.35),0_0_35px_var(--brand-secondary-glow)]",
                    tooltipClassName
                  )}
                >
                  {/* Ambient subtle glow inside card */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[var(--brand-secondary-subtle)] rounded-full blur-2xl pointer-events-none" />

                  {/* Header: Badge Tag + Close Button */}
                  <div className="relative flex items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-2xs">
                      <Sparkles className="h-3.5 w-3.5 fill-white/40 text-white shrink-0" />
                      <span>Founding Member</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors cursor-pointer"
                      aria-label="Close dialog"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body Description */}
                  <p className="relative text-sm text-neutral-900 dark:text-neutral-100 font-normal leading-relaxed mt-3.5 normal-case tracking-normal">
                    An early visionary creator who helped shape Layerat from day one.
                  </p>

                  {/* Footer Distinction */}
                  <div className="relative flex items-center justify-between gap-2 pt-3 mt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)] animate-pulse" />
                      <span>Honorary Distinction</span>
                    </span>
                    <span className="text-[var(--brand-secondary)] font-bold">
                      Lifetime
                    </span>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </span>
  );
}
