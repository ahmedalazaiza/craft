"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ProjectForm } from "@/components/project/project-form";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectEditorSkeleton } from "@/components/project/project-editor-skeleton";
import { Sparkles, LogIn, UserPlus, Monitor, ArrowRight } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function NewProjectClient() {
  const { user, isLoadingDb, openMobilePublishBlock } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        openMobilePublishBlock();
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [openMobilePublishBlock]);

  // While session/auth is initializing on reload and no cached user, show authentic editor skeleton
  if (isLoadingDb && !user) {
    return <ProjectEditorSkeleton />;
  }

  // Not logged in -> Show Auth Gate Screen with redirect parameter
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-8 sm:p-12 rounded-[28px] shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-xs">
            <Sparkles className="h-7 w-7" strokeWidth={2} />
          </div>
          <h1
            className={cn(
              bricolage.className,
              "type-title-section text-[var(--content-primary)] font-black text-2xl sm:text-3xl"
            )}
          >
            Publish Your Studio Work
          </h1>
          <p className="mt-3 type-body-default text-[var(--content-secondary)] max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Sign in or create a free creator account to upload case study spreads, customize design tags, and publish to the global directory.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup?redirect=/me/projects/new"
              prefetch={true}
              className={buttonVariants({
                variant: "accent",
                size: "lg",
                className: "w-full sm:w-auto gap-2 font-bold shadow-md px-6",
              })}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Free Account</span>
            </Link>
            <Link
              href="/login?redirect=/me/projects/new"
              prefetch={true}
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "w-full sm:w-auto gap-2 font-semibold px-6",
              })}
            >
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Mobile gate for logged-in users — block project creation on small screens
  if (hasMounted && isMobile) {
    return (
      <div className="min-h-[calc(100vh-64px-80px)] flex items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-xs">
            <Monitor className="h-10 w-10" strokeWidth={1.6} />
          </div>

          {/* Headline */}
          <div className="space-y-2.5">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl font-black text-[var(--content-primary)] tracking-tight leading-tight"
              )}
            >
              Switch to a Larger Screen to Publish
            </h1>
            <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
              Publishing case studies with images, descriptions, and tags requires a tablet or desktop for the best experience.
            </p>
          </div>

          {/* Feature list */}
          <ul className="w-full space-y-3 text-left">
            {[
              "Upload and crop high-resolution cover images",
              "Build a multi-image gallery for your case study",
              "Write detailed project descriptions and process notes",
              "Preview your project before it goes live",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-[var(--content-secondary)]">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/30 flex items-center justify-center shrink-0">
                  <ArrowRight className="h-3 w-3 text-[var(--brand-secondary)]" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          {/* Back to studio */}
          <Link
            href="/me"
            className={buttonVariants({
              variant: "accent",
              size: "lg",
              className: "w-full gap-2 font-bold shadow-sm",
            })}
          >
            Back to My Studio
          </Link>

          <p className="text-xs text-[var(--content-tertiary)]">
            You can browse, like, and share projects on mobile anytime.
          </p>
        </div>
      </div>
    );
  }

  return <ProjectForm mode="new" />;
}
