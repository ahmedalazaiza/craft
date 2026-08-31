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
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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

  const CurrentIcon = !mounted ? Sun : resolvedTheme === "dark" ? Sun : Moon;

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)} suppressHydrationWarning>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all shadow-xs cursor-pointer select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--primary-forest-green)]"
        title={mounted ? `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}` : "Change theme"}
        aria-label="Toggle theme appearance"
      >
        {mounted && resolvedTheme === "dark" ? (
          <Sun className="h-4 w-4 text-amber-400 dark:text-amber-300" />
        ) : (
          <Moon className="h-4 w-4 text-[var(--primary-forest-green)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 overflow-hidden rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.14)] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 text-[10px] font-bold text-[var(--content-tertiary)] uppercase tracking-wider">
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
                  "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer text-left focus-visible:outline-hidden",
                  isSelected
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#7110DE] dark:text-white font-bold"
                    : "bg-transparent text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
