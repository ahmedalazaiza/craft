"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";

interface OnlineBadgeProps {
  isOnline?: boolean;
  userId?: string;
  username?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  variant?: "dot" | "pill";
}

export function OnlineBadge({
  isOnline: propIsOnline,
  userId,
  username,
  size = "default",
  className,
  variant = "dot",
}: OnlineBadgeProps) {
  const { isUserOnline } = useSession();

  // If explicit boolean provided, use it, otherwise resolve from live presence via userId or username
  const activeOnline =
    propIsOnline !== undefined
      ? propIsOnline
      : isUserOnline(userId || username);

  // If the user is NOT online, show absolutely nothing (per requirement: "اذا مش متصل ما حنظهر اشي")
  if (!activeOnline) {
    return null;
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--accent)]/15 text-[var(--sentiment-positive)] dark:text-[var(--accent)] border border-[var(--accent)]/30 select-none",
          className
        )}
        title="Creator is currently online"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
        </span>
        <span>Online</span>
      </span>
    );
  }

  const dotSizes = {
    sm: "h-2 w-2 ring-[1.5px]",
    default: "h-3 w-3 ring-2",
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
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-70" />
      <span
        className={cn(
          "relative inline-flex rounded-full bg-[var(--accent)] ring-[var(--bg-screen)]",
          dotSizes[size]
        )}
      />
    </span>
  );
}
