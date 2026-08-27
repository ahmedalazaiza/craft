"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ScrollRevealDiv } from "@/components/ui/motion-wrapper";

export function SiteFooter() {
  const { user } = useSession();

  return (
    <footer className="w-full border-t border-[var(--border-neutral)] bg-[var(--bg-screen)] pt-8 pb-6 transition-colors">
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6">
        <ScrollRevealDiv className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[var(--border-neutral)]">
          {/* Brand Blurb (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-[var(--primary-forest-green)] select-none"
            >
              <span className="font-semibold tracking-[-0.04em] text-[22px]">
                Craft<span className="text-[var(--accent)] font-black">.</span>
              </span>
            </Link>
            <p className="type-body-default text-[var(--content-secondary)] max-w-sm leading-relaxed">
              A modern portfolio platform for designers, art directors, and creative professionals to showcase their work, build their presence, and discover standout projects worldwide.
            </p>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="type-title-group text-[var(--content-primary)] font-semibold mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                >
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                >
                  Discover Creators
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Account */}
          <div>
            <h4 className="type-title-group text-[var(--content-primary)] font-semibold mb-4">
              Account & Profile
            </h4>
            <ul className="space-y-2.5">
              {user ? (
                <>
                  <li>
                    <Link
                      href="/me"
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/me/projects/new"
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      Publish Project
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/u/${user.username}`}
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      Public Profile
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      Sign up
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="type-body-default text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors"
                    >
                      Publish Work
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </ScrollRevealDiv>

        {/* Bottom copyright & notes */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="type-label text-[var(--content-tertiary)]">
            &copy; {new Date().getFullYear()} Craft. Portfolio Platform for Independent Designers & Creators.
          </p>
          <div className="flex items-center gap-4">
            <span className="type-label text-[var(--content-tertiary)]">Theme:</span>
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </footer>
  );
}
