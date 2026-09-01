"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ProjectForm } from "@/components/project/project-form";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectEditorSkeleton } from "@/components/project/project-editor-skeleton";
import { Sparkles, LogIn, UserPlus } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function NewProjectClient() {
  const { user, isLoadingDb } = useSession();

  // While session/auth is initializing on reload and no cached user, show authentic editor skeleton
  if (isLoadingDb && !user) {
    return <ProjectEditorSkeleton />;
  }

  // Not logged in -> Show Auth Gate Screen with redirect parameter
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-8 sm:p-12 rounded-[28px] shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#962EE6]/15 dark:bg-[#962EE6]/25 border border-[#962EE6]/30 text-[#962EE6] dark:text-purple-300 shadow-sm">
            <Sparkles className="h-8 w-8" />
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

  return <ProjectForm mode="new" />;
}
