"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import {
  X,
  Home,
  Compass,
  Users,
  User,
  Heart,
  LayoutGrid,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Logo } from "@/components/ui/logo";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { user, isAdmin, notifications, logout } = useSession();

  // 1. Automatically close drawer when user navigates to a new route
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // 2. Lock body scroll and listen to Escape key when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const profileHref = user ? `/u/${user.username}` : "/login";

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-visibility duration-200",
        isOpen ? "visible" : "invisible pointer-events-none"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop (instant fade, tap to dismiss) */}
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200 ease-out",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel (GPU transform for 120fps responsiveness) */}
      <div
        style={{ touchAction: "manipulation" }}
        className={cn(
          "absolute top-0 bottom-0 right-0 w-[86%] max-w-sm bg-[var(--bg-elevated)] border-l border-[var(--border-neutral)] shadow-2xl flex flex-col transition-transform duration-200 ease-out will-change-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--border-neutral)] shrink-0">
          <Logo linkHref="/" priority={false} showBeta={true} />
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/60 flex items-center justify-center text-[var(--content-secondary)] hover:text-[var(--content-primary)] active:scale-95 transition-all cursor-pointer select-none"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* User Profile Card (if authenticated) */}
          {user ? (
            <Link
              href={profileHref}
              onClick={onClose}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] transition-all group"
            >
              <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-[var(--border-neutral)]">
                <Image
                  src={getValidAvatarUrl(user.avatarUrl)}
                  alt={user.displayName}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[var(--content-primary)] truncate">
                    {user.displayName}
                  </span>
                  {Boolean(user.isVerified) && <VerifiedBadge size="sm" />}
                </div>
                <span className="text-xs text-[var(--content-tertiary)] block truncate">
                  @{user.username}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] transition-colors shrink-0" />
            </Link>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--bg-neutral)] to-[var(--bg-screen)] border border-[var(--border-neutral)] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--brand-secondary)]" />
                <span className={cn(bricolage.className, "text-sm font-bold text-[var(--content-primary)]")}>
                  Join the Creative Studio
                </span>
              </div>
              <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                Publish your design monographs, connect with curators, and get discovered worldwide.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center h-9 rounded-full text-xs font-semibold bg-[var(--bg-elevated)] border border-[var(--border-neutral)] text-[var(--content-primary)] active:scale-95 transition-transform"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={onClose}
                  className="flex items-center justify-center h-9 rounded-full text-xs font-bold bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] active:scale-95 transition-transform shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Section: Main Navigation */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] px-3 block mb-1.5">
              Explore
            </span>

            <Link
              href="/"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Home</span>
            </Link>

            <Link
              href="/explore"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith("/explore")
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Compass className="h-4 w-4 shrink-0" />
              <span>Explore Projects</span>
            </Link>

            <Link
              href="/creators"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname.startsWith("/creators")
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>Creators Directory</span>
            </Link>
          </div>

          {/* Section: Studio & Workspace (Authenticated) */}
          {user && (
            <div className="space-y-1 pt-2 border-t border-[var(--border-neutral)]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] px-3 block mb-1.5">
                Workspace
              </span>

              <Link
                href={profileHref}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname.toLowerCase() === `/u/${user.username.toLowerCase()}`
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <User className="h-4 w-4 shrink-0" />
                <span>My Profile & Works</span>
              </Link>

              <Link
                href="/favorites"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === "/favorites"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Heart className="h-4 w-4 shrink-0" />
                <span>Favorites</span>
              </Link>

              <Link
                href="/boards"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname.startsWith("/boards")
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span>Moodboards</span>
              </Link>

              <Link
                href="/me"
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === "/me"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 shrink-0" />
                  <span>Notifications</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--brand-secondary)] text-black">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>

              <Link
                href="/settings"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  pathname === "/settings"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Account Settings</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Admin Settings</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer (Sign out or Help) */}
        {user && (
          <div className="p-4 border-t border-[var(--border-neutral)] bg-[var(--bg-neutral)]/20 shrink-0">
            <button
              type="button"
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 active:scale-98 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out of Layerat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
