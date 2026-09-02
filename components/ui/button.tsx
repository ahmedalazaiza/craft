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
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-cta-bg)] focus-visible:ring-offset-2 active:scale-[0.98]";

  // 2 UNIFIED CANONICAL BUTTON STYLES ACROSS THE ENTIRE PLATFORM
  const variantStyles = {
    // 1. PRIMARY BUTTON: Solid Black in Light Mode, Solid White in Dark Mode
    primary:
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs border border-transparent",
    accent:
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs border border-transparent",
    cta:
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs border border-transparent",
    "primary-cta":
      "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] shadow-xs border border-transparent",

    // 2. SECONDARY BUTTON: Bordered Elevated Surface with Content Primary Text
    secondary:
      "bg-[var(--bg-elevated)] text-[var(--content-primary)] font-semibold border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] hover:border-[var(--border-neutral)] active:bg-[var(--bg-neutral-active)] shadow-xs",
    tertiary:
      "bg-[var(--bg-elevated)] text-[var(--content-primary)] font-semibold border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)] shadow-xs",
    ghost:
      "bg-transparent text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] active:bg-[var(--bg-neutral-active)] font-semibold",
    destructive:
      "bg-[var(--negative)] text-white hover:bg-[var(--negative-hover)] active:bg-[var(--negative-active)] shadow-xs font-bold border border-transparent",
  };

  const sizeStyles = {
    default: "h-11 min-h-[44px] px-5 text-sm",
    sm: "h-9 min-h-[36px] px-4 text-xs",
    lg: "h-13 min-h-[52px] px-7 text-base",
    icon: "h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-full shrink-0",
    "icon-sm": "h-9 w-9 min-h-[36px] min-w-[36px] p-0 rounded-full shrink-0",
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
