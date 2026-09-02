"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from "@/components/ui/password-strength-indicator";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function ResetPasswordClient() {
  const router = useRouter();
  const { refreshFromDb } = useSession();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verify auth session from password reset token & prevent back-nav to completed reset
  useEffect(() => {
    // 1. If password was already reset in this browser session, prevent returning via Back button
    if (typeof window !== "undefined") {
      const alreadyCompleted = sessionStorage.getItem("craft_password_reset_completed");
      if (alreadyCompleted === "true") {
        router.replace("/explore");
        return;
      }
    }

    async function checkRecoverySession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsSessionValid(true);
        } else {
          // Listen for onAuthStateChange
          const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === "PASSWORD_RECOVERY" || session) {
                setIsSessionValid(true);
              }
            }
          );
          // Wait briefly for hash extraction
          setTimeout(() => {
            setCheckingSession(false);
          }, 600);
          return () => listener.subscription.unsubscribe();
        }
      } catch (err) {
        console.error("Session recovery error:", err);
      } finally {
        setCheckingSession(false);
      }
    }

    checkRecoverySession();
  }, [router]);

  const { isRequiredSatisfied } = getPasswordStrength(password);

  const isMatching =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isFormValid = isRequiredSatisfied && isMatching;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRequiredSatisfied) {
      setErrorMessage("Password must satisfy all required strength criteria.");
      return;
    }
    if (!isMatching) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // Mark as completed in sessionStorage & clean URL hash
        if (typeof window !== "undefined") {
          sessionStorage.setItem("craft_password_reset_completed", "true");
          window.history.replaceState(null, "", "/reset-password");
        }
        setIsUpdated(true);
        await refreshFromDb();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToExplore = () => {
    // Replaces history entry so pressing Back in browser won't return to /reset-password
    router.replace("/explore");
  };

  // =========================================================================
  // VIEW: CHECKING LINK VALIDITY
  // =========================================================================
  if (checkingSession) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-[140px]">
        <FadeIn className="w-full max-w-md text-center">
          <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-8">
            <Loader2 className="h-10 w-10 text-[var(--content-primary)] animate-spin mx-auto mb-4" />
            <h2 className="type-title-subsection text-[var(--content-primary)]">
              Verifying reset token...
            </h2>
            <p className="text-xs text-[var(--content-secondary)] mt-1">
              Establishing a secure connection with authentication service.
            </p>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // =========================================================================
  // VIEW: INVALID OR EXPIRED RECOVERY LINK
  // =========================================================================
  if (!isSessionValid && !isUpdated) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-[140px]">
        <FadeIn className="w-full max-w-md text-center">
          <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-6 sm:p-8 shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h1
              className={cn(
                bricolage.className,
                "text-2xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Reset Link Expired or Invalid
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
              This password recovery link has expired, has already been used, or is invalid. Please request a fresh reset link.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link href="/forgot-password" className="block w-full">
                <Button variant="accent" className="w-full font-bold shadow-xs">
                  Request New Reset Link
                </Button>
              </Link>

              <Link href="/login" className="block w-full">
                <Button variant="secondary" className="w-full font-semibold text-xs">
                  Return to Log in
                </Button>
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // =========================================================================
  // VIEW: SUCCESS CONFIRMATION
  // =========================================================================
  if (isUpdated) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-[140px]">
        <FadeIn className="w-full max-w-md">
          <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-6 sm:p-8 text-center shadow-xl">
            <CardHeader className="pb-4 pt-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-xs">
                <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Security Updated</span>
              </div>

              <h1
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
                )}
              >
                Password Updated!
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
                Your account password has been updated securely. You are signed in and ready to dive back in.
              </p>
            </CardHeader>

            <CardContent className="pt-3">
              <Button
                variant="accent"
                onClick={handleGoToExplore}
                className="w-full font-bold shadow-xs gap-2 h-12 text-sm cursor-pointer"
              >
                <span>Explore Projects</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // =========================================================================
  // VIEW: RESET FORM
  // =========================================================================
  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-[140px]">
      <FadeIn className="w-full max-w-md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          className="justify-center mb-4"
          items={[
            { label: "Log in", href: "/login" },
            { label: "Set New Password", isCurrent: true },
          ]}
        />

        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[24px] p-2">
          <CardHeader className="text-center pb-4 pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
              <KeyRound className="h-3 w-3 text-white" />
              <span>Secure Recovery</span>
            </div>

            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Choose new password
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
              Please enter your new strong password below to secure your account.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator & Rules Checklist */}
                <PasswordStrengthIndicator password={password} />
              </div>

              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Match Status */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                    {isMatching ? (
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Passwords match</span>
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Passwords do not match yet</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid}
                className="w-full mt-2 font-semibold shadow-xs"
              >
                {loading ? "Updating password..." : "Set New Password"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="type-body-default text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors"
              >
                Cancel and return to log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
