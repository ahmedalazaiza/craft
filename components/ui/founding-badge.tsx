"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoundingBadgeProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export function FoundingBadge({
  size = "default",
  className,
  showTooltip = true,
}: FoundingBadgeProps) {
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

  const tooltipText =
    "Founding Member — An early visionary creator who helped shape Layerat from day one.";

  return (
    <span
      role="status"
      tabIndex={0}
      title={showTooltip ? tooltipText : undefined}
      aria-label="Founding Member"
      className={cn(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider font-mono select-none transition-all duration-200",
        "bg-amber-500/10 dark:bg-amber-500/15",
        "text-amber-900 dark:text-amber-200",
        "border border-amber-400/40 dark:border-amber-400/30",
        "shadow-xs hover:border-amber-500/60 dark:hover:border-amber-300/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]",
        "cursor-help",
        sizeClasses[size],
        className
      )}
    >
      <Sparkles
        className={cn(
          iconSizes[size],
          "text-amber-500 dark:text-amber-400 fill-amber-400/30 shrink-0 transition-transform duration-300 group-hover:rotate-12"
        )}
      />
      <span>Founding Member</span>
    </span>
  );
}
