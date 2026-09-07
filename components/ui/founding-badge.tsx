"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts";

interface FoundingBadgeProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  showTooltip?: boolean;
  position?: "top" | "bottom";
  tooltipClassName?: string;
}

export function FoundingBadge({
  size = "default",
  className,
  showTooltip = true,
  position = "bottom",
  tooltipClassName,
}: FoundingBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

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
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    default: "px-2.5 py-0.5 text-[11px] gap-1.5",
    lg: "px-3 py-1 text-xs gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label="Founding Member — An early visionary creator who helped shape Layerat from day one."
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={(e) => {
        // Toggle on click/tap for touchscreen responsiveness
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
      className={cn(
        "relative inline-flex items-center rounded-full font-bold uppercase tracking-wider select-none transition-all duration-200 cursor-pointer focus:outline-hidden",
        "bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary-hover)] text-white border border-transparent",
        "shadow-xs hover:shadow-[0_0_14px_var(--brand-secondary-glow)]",
        "active:scale-95",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles
        className={cn(
          iconSizes[size],
          "text-white fill-white/40 shrink-0 transition-transform duration-300 group-hover:rotate-12"
        )}
      />
      <span className="text-white font-bold">Founding Member</span>

      {/* ================================================================= */}
      {/* CUSTOM BRANDED LAYERAT TOOLTIP                                   */}
      {/* ================================================================= */}
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
              "absolute z-50 w-72 max-w-[calc(100vw-32px)] p-4 rounded-[20px] select-none text-left pointer-events-none font-normal",
              position === "top"
                ? "bottom-full left-1/2 -translate-x-1/2 mb-2.5"
                : "top-full left-1/2 -translate-x-1/2 mt-2.5",
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

            {/* Body Description - Crisp, high contrast, standard body font (Inter) */}
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
                "absolute left-1/2 -translate-x-1/2 h-2.5 w-2.5 rotate-45 bg-white dark:bg-[#121214]",
                position === "top"
                  ? "top-full -mt-[6px] border-b border-r border-[var(--brand-secondary)]/30 dark:border-[var(--brand-secondary)]/25"
                  : "bottom-full -mb-[6px] border-t border-l border-[var(--brand-secondary)]/30 dark:border-[var(--brand-secondary)]/25"
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
