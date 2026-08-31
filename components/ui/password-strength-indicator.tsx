"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "8+ characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "Uppercase (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "Lowercase (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "Number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
];

export function getPasswordStrength(password: string) {
  const passedRules = PASSWORD_RULES.filter((rule) => rule.test(password));
  const score = passedRules.length; // 0 to 4

  const isRequiredSatisfied = score === PASSWORD_RULES.length;

  return {
    score,
    passedRules,
    isRequiredSatisfied,
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, isRequiredSatisfied } = getPasswordStrength(password);

  return (
    <div className={cn("space-y-2 pt-1.5", className)}>
      {/* Minimal 2px Segmented Progress Bar using Brand Palette */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <div
              key={step}
              className={cn(
                "h-1 rounded-full transition-all duration-200",
                isActive
                  ? isRequiredSatisfied
                    ? "bg-[var(--interactive-primary)] dark:bg-[var(--accent)]"
                    : "bg-[var(--interactive-secondary)]"
                  : "bg-[var(--border-neutral)]"
              )}
            />
          );
        })}
      </div>

      {/* Clean, Subtle Criteria List (No Heavy Box, Brand Typography) */}
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-[var(--content-tertiary)] pt-0.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <div
              key={rule.id}
              className={cn(
                "inline-flex items-center gap-1 transition-colors",
                passed
                  ? "text-[var(--content-primary)] font-medium"
                  : "text-[var(--content-tertiary)]"
              )}
            >
              {passed ? (
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--border-neutral)]" />
              )}
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
