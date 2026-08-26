"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "./theme-provider";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: {
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-cta-bg)]"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-[16px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--content-tertiary)] uppercase tracking-wider">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-cta-bg)]",
                  isSelected
                    ? "bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)]"
                    : "bg-transparent text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isSelected ? "text-[var(--btn-cta-fg)]" : "text-[var(--content-primary)]"
                    )}
                  />
                  <span className={isSelected ? "text-[var(--btn-cta-fg)] font-bold" : "text-[var(--content-primary)]"}>
                    {opt.label}
                  </span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[var(--btn-cta-fg)] stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
