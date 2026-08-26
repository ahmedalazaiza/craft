"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { currentUser } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function SignupClient() {
  const router = useRouter();
  const { setUser } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setTimeout(() => {
      setUser({
        ...currentUser,
        displayName: displayName.trim() || "Elena Vance",
      });
      router.push("/me");
    }, 400);
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          className="justify-center mb-4"
          items={[
            { label: "Join Collective", isCurrent: true },
          ]}
        />

        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[24px] p-2">
          <CardHeader className="text-center pb-4 pt-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#8DFF00]" />
              <span>Creator Collective</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              Create your studio
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
              Publish living case studies and connect with makers worldwide.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Disabled Google OAuth button */}
            <button
              type="button"
              disabled
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 text-xs font-medium text-[var(--content-tertiary)] cursor-not-allowed opacity-75"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google — coming soon</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-neutral)]" />
              </div>
              <span className="relative bg-[var(--bg-screen)] px-3 type-label text-[var(--content-tertiary)] uppercase tracking-wider">
                or details
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                  />
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
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
                    placeholder="name@studio.com"
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
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose secure password"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid}
                className="w-full mt-2 font-semibold shadow-xs"
              >
                {loading ? "Creating studio..." : "Create Creator Studio"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="type-body-default text-[var(--content-secondary)]">
                Already registered?{" "}
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
