"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/lib/supabase/client";
import { generateUniqueUsername } from "@/lib/supabase/auth";
import { DEFAULT_AVATAR_URL } from "@/lib/avatar";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Loader2, AlertCircle } from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectPath = rawRedirect.startsWith("/") ? rawRedirect : "/";

  const { refreshFromDb, setUser } = useSession();
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = React.useRef(false);

  useEffect(() => {
    // Prevent duplicate execution in React StrictMode
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    // Safety timeout: if authentication hangs for over 7s, give the user an escape hatch
    const safetyTimer = setTimeout(() => {
      setError((prev) => {
        if (prev) return prev;
        return "Authentication is taking longer than expected. Please verify your connection or return to login.";
      });
    }, 7000);

    async function processAuth() {
      try {
        // Check for error parameters returned from OAuth provider
        const urlError = searchParams.get("error_description") || searchParams.get("error");
        if (urlError) {
          clearTimeout(safetyTimer);
          setError(urlError);
          return;
        }

        // 1. Fast PKCE code exchange
        const code = searchParams.get("code");
        let user = null;

        if (code) {
          try {
            const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeErr) {
              console.warn("PKCE code exchange notice:", exchangeErr.message);
            } else if (exchangeData?.user) {
              user = exchangeData.user;
            }
          } catch (e) {
            console.warn("PKCE exchange call notice:", e);
          }
        }

        // 2. Fallback to session if code was already exchanged by Supabase listener
        if (!user) {
          const { data: sessionData } = await supabase.auth.getSession();
          user = sessionData?.session?.user || null;
        }

        // 3. Fallback to getUser()
        if (!user) {
          const { data: userData } = await supabase.auth.getUser();
          user = userData?.user || null;
        }

        // 4. Short polling delay if session token is still propagating in browser
        if (!user) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          const { data: retrySession } = await supabase.auth.getSession();
          user = retrySession?.session?.user || null;
        }

        if (!user) {
          clearTimeout(safetyTimer);
          setError("Could not establish your Google authentication session. Please try logging in again.");
          return;
        }

        // 5. Extract authentic Google metadata details
        const email = user.email?.trim().toLowerCase() || "";
        const fullName =
          user.user_metadata?.full_name?.trim() ||
          user.user_metadata?.name?.trim() ||
          user.user_metadata?.given_name?.trim() ||
          (email ? email.split("@")[0] : "Creator");

        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          DEFAULT_AVATAR_URL;

        // 6. Check existing profile or initialize new one
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        let finalProfile = existingProfile;

        if (existingProfile) {
          if (existingProfile.is_suspended) {
            clearTimeout(safetyTimer);
            await supabase.auth.signOut().catch(() => {});
            setError("This account has been suspended. Please contact support.");
            return;
          }

          // Smart synchronization for Google login
          const updates: Record<string, unknown> = {
            is_verified: true,
            auth_provider: existingProfile.auth_provider || "google",
          };

          if (!existingProfile.email && email) {
            updates.email = email;
          }

          if (
            (!existingProfile.avatar_url || existingProfile.avatar_url === DEFAULT_AVATAR_URL) &&
            avatarUrl &&
            avatarUrl !== DEFAULT_AVATAR_URL
          ) {
            updates.avatar_url = avatarUrl;
          }

          if (
            (!existingProfile.display_name || existingProfile.display_name === "Creator") &&
            fullName &&
            fullName !== "Creator"
          ) {
            updates.display_name = fullName;
          }

          const { data: updatedData } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select("*")
            .single();

          if (updatedData) {
            finalProfile = updatedData;
          }
        } else {
          // First-time Google user: Auto-initialize creator profile with rich details
          const uniqueUsername = await generateUniqueUsername(fullName, email);

          const newProfile = {
            id: user.id,
            username: uniqueUsername,
            display_name: fullName,
            email: email,
            avatar_url: avatarUrl,
            bio: "",
            location: "Worldwide",
            city: "Global",
            skills: [],
            is_online: false,
            is_verified: true,
            auth_provider: "google",
            followers_count: 0,
          };

          const { data: insertedData, error: insertErr } = await supabase
            .from("profiles")
            .upsert(newProfile, { onConflict: "id" })
            .select("*")
            .maybeSingle();

          if (insertErr) {
            console.error("Error creating Google creator profile:", insertErr);
            finalProfile = newProfile;
          } else {
            finalProfile = insertedData || newProfile;
            toast.success("Welcome to Layerat! Your profile is ready.", "Account Created 🎉", 4000);
          }
        }

        // 7. Build Creator object and immediately hydrate local session cache
        const { mapProfileToCreator } = await import("@/lib/supabase/queries");
        const creator = mapProfileToCreator(finalProfile);
        creator.isCurrentUser = true;
        creator.email = email;
        creator.isVerified = true;

        if (typeof window !== "undefined") {
          localStorage.setItem("craft_cached_profile", JSON.stringify(creator));
          sessionStorage.removeItem("layerat_session_terminated");
        }

        setUser(creator);
        refreshFromDb().catch(() => {});

        clearTimeout(safetyTimer);

        // If redirect was pointing to default, /me, /login, or /signup, direct to creator studio profile
        const isDefaultOrMe =
          !redirectPath ||
          redirectPath === "/" ||
          redirectPath === "/me" ||
          redirectPath === "/me/" ||
          redirectPath === "/login" ||
          redirectPath === "/signup";

        const destination = isDefaultOrMe ? `/u/${creator.username}` : redirectPath;

        if (typeof window !== "undefined") {
          window.location.replace(destination);
        } else {
          router.replace(destination);
        }
      } catch (err: unknown) {
        clearTimeout(safetyTimer);
        console.error("OAuth callback handling failed:", err);
        const msg = err instanceof Error ? err.message : "Authentication failed.";
        setError(msg);
      }
    }

    processAuth();

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [searchParams, redirectPath, refreshFromDb, router, setUser]);

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <FadeIn className="w-full max-w-sm">
        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 text-center shadow-xl">
          {error ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className={cn(bricolage.className, "text-xl font-bold text-[var(--content-primary)]")}>
                Authentication Failed
              </h2>
              <p className="text-xs text-[var(--content-secondary)] leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full mt-2 h-10 rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold text-xs"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Loader2 className="h-9 w-9 text-[var(--content-primary)] animate-spin mx-auto" />
              <h2 className={cn(bricolage.className, "text-xl font-bold text-[var(--content-primary)]")}>
                Signing you in...
              </h2>
              <p className="text-xs text-[var(--content-secondary)]">
                Securing your session and connecting with Google.
              </p>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
