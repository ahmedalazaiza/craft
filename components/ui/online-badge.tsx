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

  // If explicit boolean provided, use it, otherwise resolve from live presence or creator profile
  const activeOnline =
    propIsOnline !== undefined
      ? propIsOnline
      : (userId || username ? isUserOnline(userId || username) : true);

  if (activeOnline === false) {
    return null;
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 select-none",
          className
        )}
        title="Creator is currently online"
      >
        <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 shrink-0" />
        <span>Online</span>
      </span>
    );
  }

  const sizeMap = {
    sm: { container: "h-3.5 w-3.5", dot: "h-2.5 w-2.5 ring-[2px]" },
    default: { container: "h-4 w-4", dot: "h-3 w-3 ring-2" },
    lg: { container: "h-5 w-5", dot: "h-4 w-4 ring-2" },
  };

  const { container, dot } = sizeMap[size];

  return (
    <span
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center pointer-events-none z-20",
        container,
        className
      )}
      title="Active now / Online"
    >
      <span
        className={cn(
          "inline-flex rounded-full bg-emerald-500 ring-[var(--bg-screen)] shadow-sm",
          dot
        )}
      />
    </span>
  );
}
