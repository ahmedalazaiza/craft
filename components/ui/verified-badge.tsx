"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({
  size = "default",
  className,
  showTooltip = true,
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 align-middle select-none",
        className
      )}
      title={showTooltip ? "Verified Studio & Creator" : undefined}
      aria-label="Verified Creator"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(sizeClasses[size], "transition-transform hover:scale-110")}
      >
        {/* Outer 8-point geometric rosette star */}
        <path
          d="M12 1L14.7 3.9L18.6 3.4L19.7 7.2L23.2 9.1L22.4 13L24 16.7L20.4 18.4L19.2 22.1L15.3 21.8L12.7 24.8L9.9 22L6 22.5L4.8 18.7L1.4 16.9L2.1 13L0.6 9.2L4.1 7.6L5.3 3.8L9.2 4.1L12 1Z"
          className="fill-[#090C09] dark:fill-[#8DFF00]"
        />
        {/* Inner crisp checkmark */}
        <path
          d="M7.5 12.2L10.3 15L16.5 8.8"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#8DFF00] dark:text-[#090C09]"
        />
      </svg>
    </span>
  );
}
