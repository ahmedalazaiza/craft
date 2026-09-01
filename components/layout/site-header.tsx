"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchField } from "@/components/search/search-field";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { Plus, Search, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthReady } = useSession();
  const { resolvedTheme, setTheme } = useTheme();

  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isInlineSearchOpen, setIsInlineSearchOpen] = useState(false);

  const isHome = pathname === "/";
  const isExplore = pathname === "/explore";
  const isCreators = pathname === "/creators";

  // Listen to window scroll to collapse search into an icon when reaching section 2
  useEffect(() => {
    const handleScroll = () => {
      // Threshold around 280px corresponds to scrolling down from the hero into the next sections
      const scrolled = window.scrollY > 280;
      setIsScrolledPastHero(scrolled);
      // If user scrolls back to top, close the manual inline expanded overlay
      if (!scrolled) {
        setIsInlineSearchOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Banner for Unverified Users */}
      <VerificationBanner />

      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-[1580px] items-center justify-between px-4 sm:px-6 gap-4">
          {/* Left: Wordmark & Navigation Links */}
          <div className="flex items-center gap-8 shrink-0">
            <Logo linkHref="/" priority={true} />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-elevated)]/90 border border-[var(--border-neutral)] p-1 rounded-full shadow-2xs">
              <Link
                href="/"
                prefetch={true}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                  isHome
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs border border-black/10 dark:bg-[#962EE6] dark:border-transparent dark:text-white"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isHome && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs animate-pulse" />
                )}
                <span>Home</span>
              </Link>
              <Link
                href="/explore"
                prefetch={true}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                  isExplore
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs border border-black/10 dark:bg-[#962EE6] dark:border-transparent dark:text-white"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isExplore && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs animate-pulse" />
                )}
                <span>Explore</span>
              </Link>
              <Link
                href="/creators"
                prefetch={true}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                  isCreators
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs border border-black/10 dark:bg-[#962EE6] dark:border-transparent dark:text-white"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isCreators && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white shadow-xs animate-pulse" />
                )}
                <span>Creators</span>
              </Link>
            </nav>
          </div>

        {/* Center: Search Field (Constant & Full Width) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4 items-center justify-center">
          <SearchField
            compact
            showFilterButton={false}
            placeholder="Search projects, creators..."
            className="w-full shadow-xs"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0" suppressHydrationWarning>
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
            className="lg:hidden h-12 w-12 min-h-[48px] min-w-[48px] rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] flex items-center justify-center transition-all shadow-xs cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            {isMobileSearchExpanded ? (
              <X className="h-4 w-4" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Mode Switcher (Light / Dark) - Suspended for now as requested
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="md:hidden h-12 w-12 min-h-[48px] min-w-[48px] rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-primary)] flex items-center justify-center transition-all shadow-xs cursor-pointer"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme mode"
            suppressHydrationWarning
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-[var(--accent)]" />
            ) : (
              <Moon className="h-4 w-4 text-[var(--primary-forest-green)]" />
            )}
          </button>
          */}

          {user ? (
            <>
              {/* Notifications Popover Dropdown */}
              <NotificationsPopover />

              {/* Primary Action: + New Project (Desktop Only) */}
              <Link
                href="/me/projects/new"
                className={buttonVariants({
                  variant: "accent",
                  size: "sm",
                  className: "hidden md:inline-flex gap-1.5 h-9 px-3.5 shadow-xs font-bold",
                })}
              >
                <Plus className="h-4 w-4" />
                <span>New project</span>
              </Link>

              {/* User Profile Avatar Dropdown (Desktop Only) */}
              <div className="hidden md:block">
                <ProfileDropdown />
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/me/projects/new"
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "hidden lg:inline-flex gap-1.5 h-9 px-3.5 shadow-xs font-semibold hover:bg-[var(--bg-elevated)]",
                })}
              >
                <Plus className="h-4 w-4" />
                <span>New project</span>
              </Link>

              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "h-9 px-3 text-xs sm:text-sm font-medium",
                })}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "accent",
                  size: "sm",
                  className: "h-9 px-3.5 text-xs sm:text-sm font-bold shadow-xs",
                })}
              >
                Join as Creator
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchExpanded && (
        <div className="lg:hidden px-4 pb-4 pt-1 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)]">
          <SearchField
            compact
            autoFocus
            showFilterButton={false}
            placeholder="Search projects, creators..."
          />
        </div>
      )}
    </header>
    </>
  );
}
