"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface OnlineBadgeProps {
  isOnline?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "dot" | "pill";
}

export function OnlineBadge({
  isOnline,
  size = "default",
  className,
  variant = "dot",
}: OnlineBadgeProps) {
  // If the user is NOT online, show absolutely nothing (per requirement: "اذا مش متصل ما حنظهر اشي")
  if (!isOnline) {
    return null;
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8DFF00]/15 text-[#2C6E00] dark:text-[#8DFF00] border border-[#8DFF00]/30 select-none",
          className
        )}
        title="Creator is currently online"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DFF00] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8DFF00]" />
        </span>
        <span>Online</span>
      </span>
    );
  }

  const dotSizes = {
    sm: "h-2.5 w-2.5 ring-[1.5px]",
    default: "h-3.5 w-3.5 ring-2",
    lg: "h-4 w-4 ring-2",
  };

  return (
    <span
      className={cn(
        "relative flex shrink-0 select-none",
        className
      )}
      title="Active now / Online"
    >
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8DFF00] opacity-70" />
      <span
        className={cn(
          "relative inline-flex rounded-full bg-[#8DFF00] ring-[var(--bg-screen)]",
          dotSizes[size]
        )}
      />
    </span>
  );
}
