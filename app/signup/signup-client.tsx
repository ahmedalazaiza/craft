"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Lock, Mail, User, ArrowRight, Sparkles, AtSign, Eye, EyeOff, AlertCircle } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function SignupClient() {
  const router = useRouter();
  const { signup } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (password.trim().length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
      }
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const generatedUsername =
      username.trim() ||
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);

    try {
      const res = await signup(email, password, displayName, generatedUsername);
      if (res.success) {
        router.push("/me");
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
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Full name / Studio name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                      }
                    }}
                    placeholder="Elena Vance"
                    autoComplete="name"
                  />
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Studio handle (@username)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="elena_v"
                    autoComplete="username"
                  />
                  <AtSign className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
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
                    placeholder="elena@studio.com"
                    autoComplete="email"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5">
                  Password (6+ characters)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
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
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid}
                className="w-full mt-2 font-semibold shadow-xs"
              >
                {loading ? "Creating Studio with Supabase..." : "Join as a Creator"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
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
