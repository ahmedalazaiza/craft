"use client";

import React from "react";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "At least one number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "At least one special character (!@#$%^&*)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function getPasswordStrength(password: string) {
  const passedRules = PASSWORD_RULES.filter((rule) => rule.test(password));
  const score = passedRules.length; // 0 to 5

  // Required: 8+ chars, upper, lower, number
  const isRequiredSatisfied =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

  let label = "Too weak";
  let color = "bg-red-500";
  let textColor = "text-red-500";

  if (score >= 5) {
    label = "Very strong";
    color = "bg-[#8DFF00]";
    textColor = "text-emerald-500 dark:text-[#8DFF00]";
  } else if (score >= 4) {
    label = "Strong";
    color = "bg-emerald-500";
    textColor = "text-emerald-500";
  } else if (score >= 3) {
    label = "Medium";
    color = "bg-amber-500";
    textColor = "text-amber-500";
  } else if (score >= 2) {
    label = "Fair";
    color = "bg-amber-600";
    textColor = "text-amber-600";
  }

  return {
    score,
    passedRules,
    isRequiredSatisfied,
    label,
    color,
    textColor,
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRules?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  showRules = true,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { score, isRequiredSatisfied, label, color, textColor } =
    getPasswordStrength(password);

  return (
    <div className={cn("space-y-2.5 pt-1", className)}>
      {/* Strength Header & Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[var(--content-tertiary)] flex items-center gap-1">
            {isRequiredSatisfied ? (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-[#8DFF00]" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span>Password strength:</span>
          </span>
          <span className={cn("font-semibold", textColor)}>{label}</span>
        </div>

        {/* Segmented Strength Meter */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => {
            const isActive = score >= step;
            return (
              <div
                key={step}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isActive ? color : "bg-[var(--bg-neutral)]"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px] rounded-xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] p-2.5">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <div
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  passed
                    ? "text-[var(--content-primary)] font-medium"
                    : "text-[var(--content-tertiary)]"
                )}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all",
                    passed
                      ? "bg-emerald-500/20 text-emerald-600 dark:bg-[#8DFF00]/20 dark:text-[#8DFF00]"
                      : "bg-[var(--bg-neutral)] text-[var(--content-tertiary)]"
                  )}
                >
                  {passed ? (
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-current" />
                  )}
                </div>
                <span>{rule.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
