"use client";

import React, { useEffect, useRef } from "react";
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
  ArrowRight,
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
  const { user, isAdmin, notifications, logout, creators } = useSession();

  // 1. ONLY close when pathname actually changes (prevents premature closure on click)
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // 2. Lock body scroll and listen to Escape key when open
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
      style={{ touchAction: "manipulation" }}
      className={cn(
        "fixed inset-0 z-50 w-full h-full bg-[var(--bg-screen)] flex flex-col transition-all duration-200 ease-out",
        isOpen
          ? "opacity-100 pointer-events-auto translate-y-0"
          : "opacity-0 pointer-events-none -translate-y-2"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Full-View Header */}
      <div className="flex items-center justify-between px-6 h-18 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)] shrink-0">
        <Logo linkHref="/" priority={false} showBeta={true} />
        <button
          type="button"
          onClick={onClose}
          className="h-10 w-10 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--content-primary)] active:scale-95 transition-transform cursor-pointer select-none shadow-xs"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Full-View Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* User Studio Identity (If Logged In) */}
        {user ? (
          <Link
            href={profileHref}
            onClick={onClose}
            className="flex items-center gap-4 p-4 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs hover:border-[var(--content-primary)] transition-all group"
          >
            <div className="relative h-14 w-14 rounded-full overflow-hidden shrink-0 border-2 border-[var(--border-neutral)] shadow-xs">
              <Image
                src={getValidAvatarUrl(user.avatarUrl)}
                alt={user.displayName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-[var(--content-primary)] truncate">
                  {user.displayName}
                </span>
                {Boolean(user.isVerified) && <VerifiedBadge size="default" />}
              </div>
              <span className="text-xs text-[var(--content-tertiary)] block truncate mt-0.5">
                @{user.username}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-secondary-light)] mt-1.5">
                <span>View Studio Profile</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)] transition-colors shrink-0" />
          </Link>
        ) : (
          /* Guest Branded Card */
          <div className="relative overflow-hidden rounded-[28px] bg-neutral-950 dark:bg-[#121511] text-white border border-neutral-800/80 p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] space-y-4">
            {/* Ambient Brand Violet Glows */}
            <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[var(--brand-secondary-glow)]/30 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-[var(--brand-secondary-subtle)]/30 blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Header Badge */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Creative Network
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                Free to Join
              </span>
            </div>

            {/* Headline & Description */}
            <div className="relative z-10 space-y-1.5">
              <h3 className={cn(bricolage.className, "text-lg font-black tracking-tight text-white leading-snug")}>
                Where designers showcase world-class craft.
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                Publish case studies, get discovered by studios, and connect with creative peers worldwide.
              </p>
            </div>

            {/* Social Proof Creators Avatars */}
            {creators && creators.length > 0 && (
              <div className="relative z-10 flex items-center gap-2.5 pt-0.5">
                <div className="flex items-center -space-x-2">
                  {creators.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="relative h-6 w-6 rounded-full overflow-hidden ring-2 ring-neutral-950 shrink-0"
                    >
                      <Image
                        src={getValidAvatarUrl(c.avatarUrl)}
                        alt={c.displayName}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-neutral-300 font-medium">
                  Joined by independent creators & studios
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="relative z-10 flex items-center gap-2.5 pt-1">
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center h-11 px-5 rounded-full text-xs font-semibold border border-white/20 bg-white/10 hover:bg-white/15 text-white active:scale-95 transition-all backdrop-blur-md shrink-0"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full text-xs font-bold bg-white text-neutral-950 hover:bg-neutral-100 shadow-md active:scale-95 transition-all"
              >
                <span>Join as Creator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Primary Navigation Section */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] px-3 block mb-2">
            Main Navigation
          </span>

          <Link
            href="/"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
              pathname === "/"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
            )}
          >
            <Home className="h-5 w-5 shrink-0" />
            <span>Home</span>
          </Link>

          <Link
            href="/explore"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
              pathname.startsWith("/explore")
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
            )}
          >
            <Compass className="h-5 w-5 shrink-0" />
            <span>Explore Projects</span>
          </Link>

          <Link
            href="/creators"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
              pathname.startsWith("/creators")
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
            )}
          >
            <Users className="h-5 w-5 shrink-0" />
            <span>Creators Directory</span>
          </Link>
        </div>

        {/* Studio & Workspace Section (Authenticated) */}
        {user && (
          <div className="space-y-1.5 pt-3 border-t border-[var(--border-neutral)]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] px-3 block mb-2">
              Studio Workspace
            </span>

            <Link
              href={profileHref}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                pathname.toLowerCase() === `/u/${user.username.toLowerCase()}`
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <User className="h-5 w-5 shrink-0" />
              <span>My Studio Profile</span>
            </Link>

            <Link
              href="/favorites"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                pathname === "/favorites"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Heart className="h-5 w-5 shrink-0" />
              <span>Saved Favorites</span>
            </Link>

            <Link
              href="/boards"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                pathname.startsWith("/boards")
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <LayoutGrid className="h-5 w-5 shrink-0" />
              <span>Moodboards</span>
            </Link>

            <Link
              href="/me"
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                pathname === "/me"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <div className="flex items-center gap-3.5">
                <Bell className="h-5 w-5 shrink-0" />
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--brand-secondary)] text-black">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                pathname === "/settings"
                  ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                  : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span>Account Settings</span>
            </Link>

            {isAdmin && (
              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-base font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span>Admin Settings</span>
              </Link>
            )}
          </div>
        )}

        {/* Sign Out Button (Authenticated) */}
        {user && (
          <div className="pt-4 border-t border-[var(--border-neutral)]">
            <button
              type="button"
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="flex items-center justify-center gap-2.5 w-full h-12 rounded-2xl text-sm font-semibold text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 active:scale-98 transition-all cursor-pointer border border-rose-500/20"
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
