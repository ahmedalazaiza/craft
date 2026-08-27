"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { CheckCircle2, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export function VerifyClient() {
  const router = useRouter();
  const { refreshFromDb, setUser } = useSession();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function completeVerification() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Update is_verified in public.profiles
          const { data: profile } = await supabase
            .from("profiles")
            .update({ is_verified: true })
            .eq("id", user.id)
            .select("*")
            .single();

          await refreshFromDb();
          setSuccess(true);
        } else {
          // Check if session can be retrieved from URL hash
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            await supabase
              .from("profiles")
              .update({ is_verified: true })
              .eq("id", sessionData.session.user.id);

            await refreshFromDb();
            setSuccess(true);
          } else {
            setSuccess(true); // Treat as verified if redirected
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verification could not be completed.";
        setErrorMsg(msg);
      } finally {
        setVerifying(false);
      }
    }

    completeVerification();
  }, [refreshFromDb, setUser]);

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <FadeIn className="w-full max-w-md">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[28px] p-6 text-center shadow-2xl">
          {verifying ? (
            <div className="py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-[#8DFF00] animate-spin mx-auto" />
              <h2 className="type-title-subsection text-[var(--content-primary)]">
                Confirming your email...
              </h2>
              <p className="text-xs text-[var(--content-secondary)]">
                Connecting with Supabase to grant verified creator privileges.
              </p>
            </div>
          ) : success ? (
            <>
              <CardHeader className="pb-4 pt-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#8DFF00]/20 border border-[#8DFF00]/30 text-[#8DFF00] shadow-sm animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mx-auto mb-3 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
                  <span>Account Verified</span>
                </div>

                <h1
                  className={cn(
                    bricolage.className,
                    "text-2xl sm:text-3xl font-bold text-[var(--content-primary)] tracking-tight flex items-center justify-center gap-2"
                  )}
                >
                  <span>You&apos;re verified!</span>
                  <VerifiedBadge size="lg" />
                </h1>

                <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
                  Your email has been confirmed. You now have full access to appreciate projects, follow creators, and publish case studies.
                </p>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <Link href="/me" className="block w-full">
                  <Button variant="accent" className="w-full font-bold shadow-xs gap-2">
                    <span>Enter My Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/explore" className="block w-full">
                  <Button variant="secondary" className="w-full font-semibold">
                    Explore Directory
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <div className="py-8 space-y-4">
              <h2 className="text-xl font-bold text-red-500">Verification Failed</h2>
              <p className="text-xs text-[var(--content-secondary)]">
                {errorMsg || "The verification link may have expired or is invalid."}
              </p>
              <Link href="/login" className="block">
                <Button variant="secondary" className="w-full font-semibold">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
