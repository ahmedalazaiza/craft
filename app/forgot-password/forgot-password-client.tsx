"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { getAuthRedirectUrl } from "@/lib/seo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      const redirectUrl = getAuthRedirectUrl("/reset-password");

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setIsSent(true);
        setCooldown(60);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send reset link.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setResendSuccess(false);

    try {
      const redirectUrl = getAuthRedirectUrl("/reset-password");

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        setErrorMessage(error.message);
      } else {
        setResendSuccess(true);
        setCooldown(60);
      }
    } catch {
      setErrorMessage("Could not resend email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // VIEW: CHECK INBOX FOR RESET LINK
  // =========================================================================
  if (isSent) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn className="w-full max-w-md">
          <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-4 sm:p-6 text-center shadow-xl">
            <CardHeader className="pb-4 pt-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#7110DE]/15 border border-[#7110DE]/30 text-[#7110DE] dark:text-purple-300 shadow-sm">
                <KeyRound className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Reset Request Dispatched</span>
              </div>

              <h1
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
                )}
              >
                Check your inbox
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-sm mx-auto">
                If an account is associated with this email, we sent password reset instructions to:
              </p>
              <p className="font-mono text-xs sm:text-sm font-bold text-[var(--content-primary)] bg-[var(--bg-neutral)] px-3 py-1.5 rounded-xl inline-block mt-2 border border-[var(--border-neutral)]">
                {email}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              <div className="rounded-2xl bg-[var(--bg-neutral)]/60 border border-[var(--border-neutral)] p-4 text-left text-xs text-[var(--content-secondary)] space-y-2">
                <p className="font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#7110DE]" />
                  <span>Important tips:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--content-tertiary)] pl-1">
                  <li>Click the link in the email to set a new password (valid for 1 hour).</li>
                  <li>Check your spam or junk folder if the email doesn&apos;t arrive within 2 minutes.</li>
                  <li>If no email arrives, this address may not have an account registered yet.</li>
                </ul>
              </div>

              {resendSuccess && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>A new reset link has been dispatched!</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading || cooldown > 0}
                  onClick={handleResend}
                  className="w-full font-semibold gap-2"
                >
                  {loading ? (
                    "Sending..."
                  ) : cooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Resend available in {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Resend reset link</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsSent(false);
                    setErrorMessage(null);
                    setResendSuccess(false);
                  }}
                  className="w-full font-semibold text-xs text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                >
                  Try a different email address
                </Button>
              </div>

              <div className="pt-2 border-t border-[var(--border-neutral)] flex items-center justify-between text-xs">
                <Link
                  href="/login"
                  className="font-medium text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </Link>

                <Link
                  href="/signup"
                  className="font-semibold text-[#7110DE] hover:underline"
                >
                  Create new account &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // =========================================================================
  // VIEW: REQUEST FORM
  // =========================================================================
  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          className="justify-center mb-4"
          items={[
            { label: "Log in", href: "/login" },
            { label: "Reset Password", isCurrent: true },
          ]}
        />

        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[24px] p-2">
          <CardHeader className="text-center pb-4 pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
              <KeyRound className="h-3 w-3 text-white" />
              <span>Password Recovery</span>
            </div>

            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Forgot your password?
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
              Enter your registered email address and we will send you a secure link to reset your password.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendReset} className="space-y-4">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Registered email address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    autoFocus
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                disabled={loading || !email.trim()}
                className="w-full mt-2 font-bold shadow-xs"
              >
                {loading ? "Sending reset link..." : "Send Reset Instructions"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="pt-3 border-t border-[var(--border-neutral)] flex items-center justify-between text-xs">
              <Link
                href="/login"
                className="font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to log in</span>
              </Link>

              <Link
                href="/signup"
                className="font-semibold text-[#7110DE] hover:underline"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
