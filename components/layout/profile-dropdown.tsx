"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { useTheme, Theme } from "./theme-provider";
import {
  User,
  Plus,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Sparkles,
  Check,
  FolderKanban,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";

export function ProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const themeOptions: {
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ];

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button (Unified with icon button dimensions) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-9 w-9 rounded-full overflow-hidden transition-all duration-200 cursor-pointer select-none shrink-0",
          isOpen
            ? "ring-2 ring-[var(--content-primary)] ring-offset-2 ring-offset-[var(--bg-screen)]"
            : "ring-1 ring-[var(--border-neutral)] hover:ring-2 hover:ring-[var(--content-primary)]"
        )}
        title={`Signed in as ${user.displayName}`}
        aria-label="User profile menu"
      >
        <Image
          src={user.avatarUrl}
          alt={user.displayName}
          fill
          sizes="36px"
          className="object-cover"
        />
        {/* Dynamic Online Indicator */}
        <OnlineBadge isOnline={user.isOnline} size="sm" className="absolute bottom-0 right-0 z-10" />
      </button>

      {/* Dropdown Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-[280px] rounded-[22px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-[0_20px_50px_rgba(9,12,9,0.18)] z-50 overflow-hidden divide-y divide-[var(--border-neutral)]"
          >
            {/* Header: User Identity & Studio Badge */}
            <div className="p-3.5 flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)] shrink-0">
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
                <OnlineBadge isOnline={user.isOnline} size="sm" className="absolute bottom-0 right-0 z-10" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--content-primary)] truncate">
                    {user.displayName}
                  </span>
                  {user.isVerified !== false && <VerifiedBadge size="sm" />}
                </div>
                <div className="text-[11px] text-[var(--content-tertiary)] truncate">
                  @{user.username}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--chip-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chip-fg)]">
                  <span>Verified Creator</span>
                </div>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="p-1.5 space-y-0.5">
              <Link
                href="/me"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-xs font-medium text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[var(--content-tertiary)]" />
                  <span>My Profile</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
              </Link>

              <Link
                href={`/u/${user.username}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-xs font-medium text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="h-4 w-4 text-[var(--content-tertiary)]" />
                  <span>View Public Profile</span>
                </div>
                <span className="text-[10px] text-[var(--content-tertiary)] font-mono">
                  ↗
                </span>
              </Link>

              <Link
                href="/me/projects/new"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between gap-2.5 rounded-[12px] px-3 py-2 text-xs font-medium text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="h-4 w-4 text-[var(--content-tertiary)]" />
                  <span>Publish New Case Study</span>
                </div>
                <span className="rounded-full bg-[#8DFF00] text-[#090C09] px-1.5 py-0.2 text-[9px] font-bold">
                  NEW
                </span>
              </Link>
            </div>

            {/* Appearance & Theme Switcher Section */}
            <div className="p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] font-semibold mb-2">
                Interface Theme
              </div>
              <div className="grid grid-cols-3 gap-1 bg-[var(--bg-neutral)] p-1 rounded-[12px] border border-[var(--border-neutral)]">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[8px] text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                          : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                      )}
                      title={`${opt.label} Theme`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[11px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer / Log Out */}
            <div className="p-1.5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-[12px] px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
