"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { buttonVariants } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { VerificationBanner } from "@/components/layout/verification-banner";
import { SearchModal } from "@/components/search/search-modal";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useSession();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const isHome = pathname === "/";
  const isExplore = pathname === "/explore";
  const isCreators = pathname === "/creators";

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K or / to open Search Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Top Announcement Banner for Unverified Users */}
      <VerificationBanner />

      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md transition-all">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-[80px] gap-4">
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
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isHome && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--chip-fg)] shadow-xs animate-pulse" />
                )}
                <span>Home</span>
              </Link>
              <Link
                href="/explore"
                prefetch={true}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                  isExplore
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isExplore && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--chip-fg)] shadow-xs animate-pulse" />
                )}
                <span>Explore</span>
              </Link>
              <Link
                href="/creators"
                prefetch={true}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5",
                  isCreators
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isCreators && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--chip-fg)] shadow-xs animate-pulse" />
                )}
                <span>Creators</span>
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0" suppressHydrationWarning>
            {/* Search Icon Button (Identical to Notifications Button) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="relative h-9 w-9 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] flex items-center justify-center transition-all cursor-pointer select-none shadow-xs text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              title="Search (⌘K)"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
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
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "h-9 px-4 text-xs sm:text-sm font-semibold shadow-xs",
                  })}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    variant: "primary",
                    size: "sm",
                    className: "h-9 px-4 text-xs sm:text-sm font-bold shadow-xs",
                  })}
                >
                  Join as Creator
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Spotlight Search Modal with Backdrop Blur */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}

