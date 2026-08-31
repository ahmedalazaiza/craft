"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[var(--border-neutral)] bg-[var(--bg-screen)] pt-12 pb-8 transition-colors">
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 space-y-12">
        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-[var(--border-neutral)]">
          {/* Column 1: Brand & Ethos */}
          <div className="space-y-4">
            <Logo linkHref="/" size="default" />

            <p className="type-body-default text-[var(--content-secondary)] text-xs sm:text-sm leading-relaxed max-w-sm">
              The portfolio platform for designers, art directors, and creative studios to showcase their work and connect with peers worldwide.
            </p>

            {/* Live Operational Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3 py-1 text-[11px] font-medium text-[var(--content-secondary)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All systems active • Global Network</span>
            </div>
          </div>

          {/* Column 2: Platform & Explore */}
          <div className="space-y-3">
            <h4 className="type-title-group text-[var(--content-primary)] font-bold text-xs uppercase tracking-wider">
              Explore & Discover
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Discover Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Global Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Story */}
          <div className="space-y-3">
            <h4 className="type-title-group text-[var(--content-primary)] font-bold text-xs uppercase tracking-wider">
              Company & Story
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/about"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Our Team & Curators
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Trust */}
          <div className="space-y-3">
            <h4 className="type-title-group text-[var(--content-primary)] font-bold text-xs uppercase tracking-wider">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="/terms"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  prefetch={true}
                  className="text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-purple-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar without theme changer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--content-tertiary)] text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} Layerat Platforms Inc. All projects and visual works belong to their respective creators.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              prefetch={true}
              className="hover:text-[var(--content-primary)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              prefetch={true}
              className="hover:text-[var(--content-primary)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/guidelines"
              prefetch={true}
              className="hover:text-[var(--content-primary)] transition-colors"
            >
              Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
