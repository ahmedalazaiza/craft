"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchField } from "@/components/search/search-field";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { Plus, Search, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
            <Link
              href="/"
            className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-[var(--primary-forest-green)] select-none hover:opacity-90 transition-opacity"
          >
            <span className="font-semibold tracking-[-0.04em] text-[22px]">
              Craft<span className="text-[var(--accent)] font-black">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isHome
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              Home
            </Link>
            <Link
              href="/explore"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isExplore
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              Explore
            </Link>
            <Link
              href="/creators"
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                isCreators
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              Creators
            </Link>
          </nav>
        </div>

        {/* Center: Search Field */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4 items-center justify-center">
          {!isScrolledPastHero ? (
            <SearchField
              compact
              showFilterButton={false}
              placeholder="Search projects, creators..."
              className="w-full shadow-xs"
            />
          ) : (
            <div className="relative">
              <AnimatePresence mode="wait">
                {isInlineSearchOpen ? (
                  <motion.div
                    key="expanded-input"
                    initial={{ width: 44, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 44, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="relative flex items-center"
                  >
                    <SearchField
                      compact
                      autoFocus
                      showFilterButton={false}
                      placeholder="Search projects, creators..."
                      className="w-full shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setIsInlineSearchOpen(false)}
                      className="absolute right-3 p-1 rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                      title="Close search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="collapsed-icon"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    type="button"
                    onClick={() => setIsInlineSearchOpen(true)}
                    className="h-9 px-4 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] flex items-center gap-2.5 transition-all shadow-xs cursor-pointer select-none group"
                    title="Search Craft"
                    aria-label="Search Craft"
                  >
                    <Search className="h-4 w-4 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] transition-colors" />
                    <span className="text-xs font-medium text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] transition-colors">
                      Search...
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
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

          {/* Mobile Mode Switcher (Light / Dark) */}
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
