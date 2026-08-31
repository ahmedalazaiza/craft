"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { motion } from "framer-motion";
import { Home, Compass, Plus, Users, User } from "lucide-react";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useSession();

  // Hide on full-screen editor/login/signup if desired, or keep as universal quick access
  const isHome = pathname === "/";
  const isExplore = pathname.startsWith("/explore") || pathname.startsWith("/project");
  const isCreators = pathname.startsWith("/creators") || (pathname.startsWith("/u/") && !pathname.startsWith("/me"));
  const isNewProject = pathname === "/me/projects/new";
  const isMe = pathname.startsWith("/me") && !isNewProject;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden pointer-events-none px-4 pb-safe pb-3 pt-2">
      <nav
        aria-label="Mobile Navigation"
        className="pointer-events-auto mx-auto max-w-md h-16 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/95 backdrop-blur-2xl px-3 flex items-center justify-around shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-none transition-all"
      >
        {/* 1. Home */}
        <Link
          href="/"
          prefetch={true}
          className={cn(
            "relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] w-12 h-12 rounded-full transition-all duration-200",
            isHome
              ? "text-[var(--primary-forest-green)] dark:text-white font-bold"
              : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
          )}
        >
          <Home className={cn("h-5 w-5 transition-transform", isHome ? "scale-110 text-[var(--primary-forest-green)] dark:text-white stroke-[2.5]" : "stroke-[1.8]")} />
          <span className="text-xs mt-0.5 tracking-tight font-medium">Home</span>
          {isHome && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[#962EE6]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>

        {/* 2. Explore */}
        <Link
          href="/explore"
          prefetch={true}
          className={cn(
            "relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] w-12 h-12 rounded-full transition-all duration-200",
            isExplore
              ? "text-[var(--primary-forest-green)] dark:text-white font-bold"
              : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
          )}
        >
          <Compass className={cn("h-5 w-5 transition-transform", isExplore ? "scale-110 text-[var(--primary-forest-green)] dark:text-white stroke-[2.5]" : "stroke-[1.8]")} />
          <span className="text-xs mt-0.5 tracking-tight font-medium">Explore</span>
          {isExplore && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[#962EE6]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>

        {/* 3. Center CTA: + Publish New Project */}
        <Link
          href={user ? "/me/projects/new" : "/login"}
          prefetch={true}
          className="relative -top-2 flex items-center justify-center min-h-[48px] min-w-[48px]"
          title="Publish Project"
        >
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] shadow-md border-2 border-[var(--bg-screen)]"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </motion.div>
        </Link>

        {/* 4. Creators Directory */}
        <Link
          href="/creators"
          prefetch={true}
          className={cn(
            "relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] w-12 h-12 rounded-full transition-all duration-200",
            isCreators
              ? "text-[var(--primary-forest-green)] dark:text-white font-bold"
              : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
          )}
        >
          <Users className={cn("h-5 w-5 transition-transform", isCreators ? "scale-110 text-[var(--primary-forest-green)] dark:text-white stroke-[2.5]" : "stroke-[1.8]")} />
          <span className="text-xs mt-0.5 tracking-tight font-medium">Creators</span>
          {isCreators && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[#962EE6]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>

        {/* 5. Me / Profile (or Login) */}
        <Link
          href={user ? "/me" : "/login"}
          prefetch={true}
          className={cn(
            "relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] w-12 h-12 rounded-full transition-all duration-200",
            isMe
              ? "text-[var(--primary-forest-green)] dark:text-white font-bold"
              : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
          )}
        >
          {user ? (
            <div className={cn("relative h-6 w-6 rounded-full overflow-hidden border border-[var(--border-neutral)] transition-all mt-0.5", isMe && "ring-2 ring-[var(--primary-forest-green)] dark:ring-[#962EE6]")}>
              <Image
                src={getValidAvatarUrl(user.avatarUrl)}
                alt={user.displayName}
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
          ) : (
            <User className={cn("h-5 w-5 transition-transform", isMe ? "scale-110 text-[var(--primary-forest-green)] dark:text-white stroke-[2.5]" : "stroke-[1.8]")} />
          )}
          <span className="text-xs mt-0.5 tracking-tight font-medium">{user ? "Studio" : "Login"}</span>
          {isMe && (
            <motion.div
              layoutId="mobile-nav-pill"
              className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--primary-forest-green)] dark:bg-[#962EE6]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      </nav>
    </div>
  );
}
