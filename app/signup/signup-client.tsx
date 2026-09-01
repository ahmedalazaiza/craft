"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Inbox,
  Clock,
  ShieldCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from "@/components/ui/password-strength-indicator";
import { getResendStatus, sendVerificationEmail } from "@/lib/resend-limiter";
import { generateUniqueUsername, slugifyUsername } from "@/lib/supabase/auth";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function SignupClient() {
  const router = useRouter();
  const { signup } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Unique Username Check State
  const [resolvedUsername, setResolvedUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Success "Check Inbox" screen state
  const [isRegistered, setIsRegistered] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { isRequiredSatisfied } = getPasswordStrength(password);

  const isFormValid =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    isRequiredSatisfied;

  // Real-time live check against Supabase profiles table
  useEffect(() => {
    if (!displayName.trim() && !email.trim()) {
      setResolvedUsername("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const unique = await generateUniqueUsername(displayName, email);
        setResolvedUsername(unique);
      } catch (err) {
        console.error("Live handle generation error:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [displayName, email]);

  // Rate limiter cooldown countdown for "Check Inbox" screen
  useEffect(() => {
    if (!isRegistered || !email) return;

    const checkLimiter = () => {
      const status = getResendStatus(email);
      setCooldown(status.remainingCooldownSeconds);
    };

    checkLimiter();
    const interval = setInterval(checkLimiter, 1000);
    return () => clearInterval(interval);
  }, [isRegistered, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!isRequiredSatisfied) {
      setErrorMessage("Please make sure your password satisfies the required strength criteria.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Auto-generates unique username on the backend & Supabase with guaranteed uniqueness
      const res = await signup(email, password, displayName, resolvedUsername || undefined);
      if (res.success) {
        setIsRegistered(true);
      } else {
        setErrorMessage(res.error || "Failed to create account. Please check your information.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Account registration failed.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendSuccess(false);
    setErrorMessage(null);

    try {
      const res = await sendVerificationEmail(email);
      if (res.success) {
        setResendSuccess(true);
        setCooldown(60);
      } else {
        setErrorMessage(res.error || "Could not resend email.");
        if (res.remainingCooldownSeconds) {
          setCooldown(res.remainingCooldownSeconds);
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // =========================================================================
  // VIEW: CHECK YOUR INBOX CONFIRMATION SCREEN
  // =========================================================================
  if (isRegistered) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <FadeIn className="w-full max-w-lg">
          <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-4 sm:p-6 text-center shadow-xl">
            <CardHeader className="pb-4 pt-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#962EE6]/15 dark:bg-[#962EE6]/25 border border-[#962EE6]/30 text-[#962EE6] dark:text-purple-300 shadow-sm">
                <Inbox className="h-8 w-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                <span>Verification Link Dispatched</span>
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
                We sent an activation link to:
              </p>
              <p className="font-mono text-xs sm:text-sm font-bold text-[var(--content-primary)] bg-[var(--bg-neutral)] px-3 py-1.5 rounded-xl inline-block mt-1 border border-[var(--border-neutral)]">
                {email}
              </p>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              <div className="rounded-2xl bg-[var(--bg-neutral)]/50 border border-[var(--border-neutral)] p-4 text-left text-xs text-[var(--content-secondary)] space-y-2">
                <p className="font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#962EE6]" />
                  <span>Why verify your email?</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[var(--content-tertiary)] pl-1">
                  <li>Unlock appreciation (like) on monographs and case studies</li>
                  <li>Follow your favorite independent creators</li>
                  <li>Publish and showcase your own projects to the global directory</li>
                  <li>Receive your verified creator seal</li>
                </ul>
              </div>

              {resendSuccess && (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>A fresh activation link has been sent to your email!</span>
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
                  disabled={isResending || cooldown > 0}
                  onClick={handleResend}
                  className="w-full font-semibold gap-2"
                >
                  {isResending ? (
                    "Sending link..."
                  ) : cooldown > 0 ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Resend available in {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Resend activation link</span>
                    </>
                  )}
                </Button>

                <Link
                  href="/"
                  prefetch={true}
                  className={buttonVariants({
                    variant: "accent",
                    className: "w-full font-bold shadow-xs gap-2 bg-[#962EE6] hover:bg-[#801FD1] text-white",
                  })}
                >
                  <span>Explore Platform</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  // =========================================================================
  // VIEW: SIGN UP FORM
  // =========================================================================
  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[24px] p-2">
          <CardHeader className="text-center pb-4 pt-6 sm:pt-7">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Create your profile
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
              Publish living case studies and connect with makers worldwide.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Full name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (e.target.value.trim()) {
                        setIsCheckingUsername(true);
                      }
                    }}
                    placeholder="e.g. Elena Vance"
                    autoComplete="name"
                  />
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
                {displayName.trim() && (
                  <div className="mt-2.5 min-h-[22px]">
                    {isCheckingUsername ? (
                      <div className="flex items-center gap-2 text-[11px] text-[var(--content-secondary)] animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 text-[#962EE6] animate-spin shrink-0" />
                        <span>Verifying unique handle availability...</span>
                        <span className="h-3.5 w-20 rounded-md bg-[var(--bg-neutral)] inline-block" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--content-tertiary)] animate-fade-in">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#962EE6] shrink-0" />
                        <span>Your unique handle will be:</span>
                        <span className="font-mono font-semibold text-[var(--content-primary)] bg-[var(--bg-neutral)] px-2 py-0.5 rounded-md">
                          @{resolvedUsername || slugifyUsername(displayName)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    autoComplete="email"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose secure password"
                    autoComplete="new-password"
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

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || !isFormValid}
                  className="w-full font-bold shadow-xs gap-2"
                >
                  {loading ? "Creating account..." : "Join as a Creator"}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="mt-3 text-[11px] text-center text-[var(--content-tertiary)] leading-relaxed px-1">
                  By clicking <strong className="font-semibold text-[var(--content-secondary)]">Join as a Creator</strong>, you agree to Layerat&apos;s{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={true}
                    className="font-semibold text-[var(--content-primary)] hover:text-[#962EE6] underline underline-offset-2 transition-colors"
                  >
                    Terms of Use
                  </Link>{" "}
                  and acknowledge our{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={true}
                    className="font-semibold text-[var(--content-primary)] hover:text-[#962EE6] underline underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="type-body-default text-[var(--content-secondary)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--content-link)] hover:text-[var(--content-link-hover)] underline underline-offset-4"
                >
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
