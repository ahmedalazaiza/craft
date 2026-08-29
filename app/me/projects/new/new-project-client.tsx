"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ProjectForm } from "@/components/project/project-form";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectEditorSkeleton } from "@/components/project/project-editor-skeleton";

export function NewProjectClient() {
  const { user, isLoadingDb } = useSession();

  // While session/auth is initializing on reload and no cached user, show authentic editor skeleton
  if (isLoadingDb && !user) {
    return <ProjectEditorSkeleton />;
  }

  // Not logged in -> Show Auth Gate Screen
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 rounded-[28px] shadow-sm">
          <h1 className="type-title-section text-[var(--content-primary)]">
            Authentication Required
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            You must be signed in with a verified account to publish case studies and design projects.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({
                variant: "accent",
                className: "font-bold shadow-xs",
              })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold",
              })}
            >
              Create account
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <ProjectForm mode="new" />;
}
