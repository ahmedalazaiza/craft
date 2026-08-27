"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[120px] w-full rounded-[12px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--content-primary)] shadow-none transition-colors",
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

Textarea.displayName = "Textarea";
