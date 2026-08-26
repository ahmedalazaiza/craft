"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "accent" | "forest" | "neutral" | "dark" | "outline";
  size?: "sm" | "default";
}

export function Badge({
  className,
  variant = "accent",
  size = "default",
  children,
  ...props
}: BadgeProps) {
  // Solid fill styles, completely opaque, high contrast on photos, using --chip tokens
  const variantStyles = {
    accent: "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-semibold border-transparent",
    forest: "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-medium border-transparent",
    neutral: "bg-[var(--bg-neutral)] text-[var(--content-primary)] font-medium border-transparent",
    dark: "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-medium border-transparent",
    outline: "bg-[var(--bg-screen)] text-[var(--content-primary)] border border-[var(--border-neutral)] font-medium",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] leading-tight rounded-full",
    default: "px-3 py-1 text-xs leading-normal rounded-full",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FilterChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  onRemove?: () => void;
}

export function FilterChip({
  className,
  active,
  onRemove,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all duration-150 cursor-pointer select-none border-none",
        active
          ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-sm"
          : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral-hover)] hover:text-[var(--content-primary)]",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/20 text-current transition-colors"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
