"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ProjectForm } from "@/components/project/project-form";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { sendVerificationEmail } from "@/lib/resend-limiter";
import { ProjectEditorSkeleton } from "@/components/project/project-editor-skeleton";

export function NewProjectClient() {
  const { user, isLoadingDb } = useSession();
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResend = async () => {
    if (!user?.email || resending) return;
    setResending(true);
    try {
      const res = await sendVerificationEmail(user.email);
      if (res.success) setResendSent(true);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  // While session/auth is initializing on reload, show authentic editor skeleton
  if (isLoadingDb) {
    return <ProjectEditorSkeleton />;
  }

  // Guest State
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
            <Link href="/login">
              <Button variant="accent" className="font-bold shadow-xs">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="font-semibold">Create account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6">
      <FadeIn>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "My Profile", href: "/me" },
            { label: "Publish New Project", isCurrent: true },
          ]}
        />

        {/* Warning if user is logged in but not yet verified */}
        {!user.isVerified && (
          <div className="mb-6 rounded-[22px] bg-amber-500/10 border border-amber-500/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--content-primary)]">
                  Account verification required to publish
                </h4>
                <p className="text-xs text-[var(--content-secondary)] mt-0.5">
                  You can prepare and draft your project, but publishing it live requires verifying your email ({user.email}).
                </p>
              </div>
            </div>

            {resendSent ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                <span>Link sent!</span>
              </span>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResend}
                disabled={resending}
                className="shrink-0 gap-1.5 font-semibold text-xs"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{resending ? "Sending..." : "Resend Link"}</span>
              </Button>
            )}
          </div>
        )}

        <div className="mb-8">
          <h1 className="type-title-screen text-[var(--primary-forest-green)]">
            Create New Project
          </h1>
          <p className="mt-1.5 type-body-large text-[var(--content-secondary)]">
            Document your process, design artifacts, and spatial identity systems.
          </p>
        </div>

        <ProjectForm mode="new" />
      </FadeIn>
    </div>
  );
}
