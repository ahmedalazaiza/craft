"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "accent"
    | "cta"
    | "primary-cta"
    | "destructive"
    | "secondary"
    | "tertiary"
    | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  asChild?: boolean;
}

export function buttonVariants({
  variant = "primary",
  size = "default",
  className,
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-cta-bg)]";

  const variantStyles = {
    // Main Accent button — energetic neon lime with dark contrast label
    accent:
      "bg-[var(--accent)] text-[#090C09] font-bold hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-xs",
    cta:
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-semibold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs",
    "primary-cta":
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-semibold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs",

    // Primary button — uses dynamic semantic CTA pair (Dark Forest Green in Light, Neon Lime in Dark)
    primary:
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs font-semibold",

    destructive:
      "bg-[var(--negative)] text-[var(--interactive-primary-foreground)] hover:bg-[var(--negative-hover)] active:bg-[var(--negative-active)] shadow-xs",
    secondary:
      "bg-[var(--bg-elevated)] text-[var(--content-primary)] border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral-hover)] active:bg-[var(--bg-neutral-active)] shadow-xs",
    tertiary:
      "bg-transparent text-[var(--content-primary)] hover:text-[var(--content-link)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)]",
    ghost:
      "bg-transparent text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)]",
  };

  const sizeStyles = {
    default: "h-12 min-h-[48px] px-6 text-sm", // 48px touch target
    sm: "h-8 px-4 text-xs",                    // 32px standard
    lg: "h-14 min-h-[56px] px-8 text-base",   // 56px large
    icon: "h-12 w-12 min-h-[48px] min-w-[48px] p-0 rounded-full shrink-0",
    "icon-sm": "h-8 w-8 p-0 rounded-full shrink-0",
  };

  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
