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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-cta-bg)]";

    const variantStyles = {
      // Main CTA button — brand lime fill + dark label in both Light and Dark
      accent:
        "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-semibold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs",
      cta:
        "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-semibold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs",
      "primary-cta":
        "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-semibold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs",

      // Primary button — dark ink in light mode, electric kinetic lime in dark mode
      primary:
        "bg-[#090C09] text-[#FFFFFF] hover:bg-[#000000] active:bg-[#000000] dark:bg-[#8DFF00] dark:text-[#090C09] dark:hover:bg-[#7AE600] dark:active:bg-[#68CC00] shadow-xs font-semibold",

      destructive:
        "bg-[var(--negative)] text-[#FFFFFF] hover:bg-[var(--negative-hover)] active:bg-[var(--negative-active)] shadow-xs",
      secondary:
        "bg-[var(--bg-elevated)] text-[var(--content-primary)] border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral-hover)] active:bg-[var(--bg-neutral-active)] shadow-xs",
      tertiary:
        "bg-transparent text-[var(--content-primary)] hover:text-[var(--content-link)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)]",
      ghost:
        "bg-transparent text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)]",
    };

    const sizeStyles = {
      default: "h-12 px-6 text-sm", // h-48
      sm: "h-8 px-3.5 text-xs",     // sm h-32
      lg: "h-14 px-8 text-base",
      icon: "h-12 w-12 p-0 rounded-full shrink-0",
      "icon-sm": "h-8 w-8 p-0 rounded-full shrink-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
