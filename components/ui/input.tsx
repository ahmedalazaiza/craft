"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-4 py-2 text-base md:text-sm text-[var(--content-primary)] shadow-none transition-colors",
          "placeholder:text-[var(--content-tertiary)]",
          "focus:outline-none focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-[var(--negative)] focus:border-[var(--negative)] focus:ring-[var(--negative)]/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
