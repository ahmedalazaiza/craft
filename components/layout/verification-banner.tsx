"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/session-context";
import { Mail, X, CheckCircle2, Clock } from "lucide-react";
import { getResendStatus, sendVerificationEmail } from "@/lib/resend-limiter";
import { motion, AnimatePresence } from "framer-motion";

export function VerificationBanner() {
  const { user } = useSession();
  const [isDismissed, setIsDismissed] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const userEmail = user?.email || (typeof window !== "undefined" ? localStorage.getItem("craft_last_registered_email") || "" : "");

  useEffect(() => {
    // Check sessionStorage to see if dismissed for current tab session
    const dismissedInSession = sessionStorage.getItem("craft_hide_verification_banner");
    if (!dismissedInSession && user && !user.isVerified) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [user]);

  // Rate limiter cooldown countdown
  useEffect(() => {
    if (!userEmail || isDismissed) return;

    const updateCooldown = () => {
      const status = getResendStatus(userEmail);
      setCooldown(status.remainingCooldownSeconds);
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [userEmail, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("craft_hide_verification_banner", "true");
    } catch {
      // ignore
    }
  };

  const handleResend = async () => {
    if (!userEmail || cooldown > 0 || isSending) return;

    setIsSending(true);
    setSendSuccess(false);

    try {
      const res = await sendVerificationEmail(userEmail);
      if (res.success) {
        setSendSuccess(true);
        setCooldown(60);
        setTimeout(() => setSendSuccess(false), 5000);
      }
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  // Only render if user is logged in, not verified, and hasn't dismissed in current session
  if (!user || user.isVerified || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 bg-[var(--chip-bg)] text-[var(--chip-fg)] border-b border-white/10 px-4 py-2.5 sm:px-6 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
              <Mail className="h-3 w-3" />
            </span>

            <p className="truncate font-medium text-white/90">
              <strong className="text-white">Account activation required:</strong> Please verify your email{" "}
              {userEmail && <span className="underline opacity-80">({userEmail})</span>} to unlock appreciation, following, and project publishing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {sendSuccess ? (
              <span className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Link sent! Check inbox</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending || cooldown > 0}
                className="font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs inline-flex items-center gap-1"
              >
                {isSending ? (
                  "Sending..."
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Resend ({cooldown}s)</span>
                  </>
                ) : (
                  "Resend activation link"
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded p-1 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Dismiss for this session"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
