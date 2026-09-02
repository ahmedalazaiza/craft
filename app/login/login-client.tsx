"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/me";

  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectPath);
      } else {
        setErrorMessage(res.error || "Invalid email or password. Please check your credentials.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-[80px]">
      <FadeIn className="w-full max-w-md">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[24px] p-2">
          <CardHeader className="text-center pb-4 pt-6 sm:pt-7">
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Sign in to your account
            </h1>
            <p className="mt-1.5 type-body-default text-[var(--content-secondary)]">
              Welcome back. Enter your credentials to access your studio.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--content-primary)]">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--content-primary)]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[var(--content-link)] hover:text-[var(--content-link-hover)] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid}
                className="w-full mt-2 font-semibold shadow-xs"
              >
                {loading ? "Signing in..." : "Log in"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="type-body-default text-[var(--content-secondary)]">
                Don&apos;t have an account yet?{" "}
                <Link
                  href={redirectPath !== "/me" ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : "/signup"}
                  className="font-semibold text-[var(--content-link)] hover:text-[var(--content-link-hover)] underline underline-offset-4"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
