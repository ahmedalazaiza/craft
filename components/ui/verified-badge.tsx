"use client";

import React from "react";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({
  size = "default",
  className,
  showTooltip = true,
}: VerifiedBadgeProps) {
  // Sizing scale for verified badge across platform
  const sizeClasses = {
    sm: "h-4 w-4",        // 16px (for compact lists & dense comment rows)
    default: "h-5 w-5",   // 20px (for project cards, directory items, and standard headers)
    lg: "h-6 w-6",        // 24px (for studio profile headlines)
    xl: "h-7 w-7",        // 28px (for hero showcases)
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 align-middle select-none",
        className
      )}
      title={showTooltip ? "Verified Studio & Pro Creator" : undefined}
      aria-label="Verified Creator"
    >
      <BadgeCheck
        className={cn(
          sizeClasses[size],
          "text-[#8DFF00] fill-[#090C09] transition-transform duration-200 hover:scale-110 drop-shadow-[0_2px_8px_rgba(141,255,0,0.18)]"
        )}
        strokeWidth={2.2}
      />
    </span>
  );
}
