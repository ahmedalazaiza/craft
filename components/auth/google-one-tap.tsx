"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useSession } from "@/lib/session-context";
import { signInWithGoogleIdToken } from "@/lib/supabase/auth";
import { toast } from "@/components/ui/toast";

/* Types for Google Identity Services */
interface GoogleCredentialResponse {
  credential: string; // The ID Token (JWT)
  select_by?: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
  getMomentType: () => string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void | Promise<void>;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  itp_support?: boolean;
  use_fedcm_for_prompt?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (callback?: (notification: GooglePromptNotification) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * Generate cryptographic nonce pair: [rawNonce, hashedNonce]
 * Compatible with Supabase Auth ID token verification
 */
async function generateNonce(): Promise<[string, string]> {
  try {
    const rawBytes = new Uint8Array(32);
    crypto.getRandomValues(rawBytes);
    const rawNonce = btoa(String.fromCharCode(...rawBytes));

    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(rawNonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return [rawNonce, hashedNonce];
  } catch {
    // Fallback if crypto.subtle is unavailable
    const randomStr = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return [randomStr, randomStr];
  }
}

export function GoogleOneTap() {
  const { user, isAuthReady, setUser, refreshFromDb } = useSession();
  const isInitializingRef = useRef(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const initGoogleOneTap = async () => {
    // Only show to unauthenticated visitors
    if (!isAuthReady || user || !googleClientId) {
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      return;
    }

    if (isInitializingRef.current) {
      return;
    }
    isInitializingRef.current = true;

    try {
      const [rawNonce, hashedNonce] = await generateNonce();

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        nonce: hashedNonce,
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) return;

          const toastId = toast.info("Authenticating with Google...", "Signing In");

          try {
            const res = await signInWithGoogleIdToken(response.credential, rawNonce);

            if (res.success && res.user) {
              setUser(res.user);
              await refreshFromDb();
              toast.dismiss(toastId);
              toast.success(
                `Welcome back, ${res.user.displayName || "Creator"}!`,
                "Signed in successfully 🎉"
              );
            } else if (res.success) {
              await refreshFromDb();
              toast.dismiss(toastId);
              toast.success("Welcome to Layerat!", "Signed in successfully 🎉");
            } else {
              toast.dismiss(toastId);
              toast.error(res.error || "Failed to sign in with Google.", "Authentication Error");
            }
          } catch (err: unknown) {
            toast.dismiss(toastId);
            const msg = err instanceof Error ? err.message : "Authentication failed.";
            toast.error(msg, "Error");
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });

      // Display the One Tap prompt with modern FedCM support
      window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          if (process.env.NODE_ENV === "development") {
            if (reason === "unregistered_origin") {
              console.warn(
                `[Google One Tap] Origin "${window.location.origin}" is not authorized. ` +
                  `Please add "${window.location.origin}" and "http://localhost" to ` +
                  `"Authorized JavaScript origins" in Google Cloud Console.`
              );
            } else {
              console.info("[Google One Tap] Prompt not displayed:", reason);
            }
          }
        } else if (notification.isSkippedMoment()) {
          if (process.env.NODE_ENV === "development") {
            console.info("[Google One Tap] Prompt skipped:", notification.getSkippedReason());
          }
        } else if (notification.isDismissedMoment()) {
          if (process.env.NODE_ENV === "development") {
            console.info("[Google One Tap] Prompt dismissed:", notification.getDismissedReason());
          }
        }
      });
    } catch (err) {
      console.warn("[Google One Tap] Initialization error:", err);
    }
  };

  useEffect(() => {
    // If user signs in or is already logged in, cancel any active prompt
    if (user) {
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        // ignore
      }
      return;
    }

    if (isAuthReady && !user && googleClientId && typeof window !== "undefined" && window.google?.accounts?.id) {
      initGoogleOneTap();
    }
  }, [user, isAuthReady, googleClientId]);

  // If user is already authenticated or client ID is not configured, don't load script
  if (user || !isAuthReady || !googleClientId) {
    return null;
  }

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        initGoogleOneTap();
      }}
      onError={(e) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Google One Tap] Failed to load Google Identity script", e);
        }
      }}
    />
  );
}
