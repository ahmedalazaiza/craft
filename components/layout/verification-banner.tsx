"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/session-context";
import { Mail, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { getResendStatus, sendVerificationEmail } from "@/lib/resend-limiter";
import { motion, AnimatePresence } from "framer-motion";

export function VerificationBanner() {
  const { user, openVerificationModal } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // STRICT LOGIC: The verification banner MUST ONLY appear if a user is actively logged in
  // AND their account is NOT verified in the database.
  // When logged out (user === null) or verified (user.isVerified === true), return null immediately.
  const isPendingVerification = Boolean(user && !user.isVerified);
  const userEmail =
    user?.email ||
    (typeof window !== "undefined"
      ? localStorage.getItem("craft_last_registered_email") || ""
      : "");

  // Rate limiter cooldown countdown
  useEffect(() => {
    if (!isPendingVerification || !userEmail) return;

    const updateCooldown = () => {
      const status = getResendStatus(userEmail);
      setCooldown(status.remainingCooldownSeconds);
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, [isPendingVerification, userEmail]);

  const handleResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  if (!isPendingVerification) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50 bg-neutral-950 text-white border-b border-neutral-800 px-3 py-2 sm:px-6 sm:py-2.5 lg:px-[80px] shadow-xs"
      >
        <div className="flex w-full items-center justify-between gap-2.5 sm:gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-xs animate-pulse">
              <Mail className="h-3 w-3" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-medium text-white/90 leading-tight">
                <strong className="text-white font-bold">Please verify your account:</strong>{" "}
                <span className="hidden sm:inline">Confirm your email </span>
                {userEmail && (
                  <span className="font-mono text-neutral-300 underline">({userEmail})</span>
                )}
                <span className="hidden md:inline">
                  {" "}to unlock appreciation, following creators, and publishing projects.
                </span>
                <span className="inline md:hidden text-white/75"> to unlock all creator perks.</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {sendSuccess ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] sm:text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Link sent! Check inbox</span>
                <span className="sm:hidden">Sent!</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending || cooldown > 0}
                className="font-bold text-neutral-300 hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[11px] sm:text-xs inline-flex items-center gap-1"
              >
                {isSending ? (
                  "Sending..."
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Resend in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Resend link</span>
                    <span className="hidden sm:inline">Resend activation link</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => openVerificationModal("publish")}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white hover:bg-neutral-200 text-black px-3 py-1 font-bold text-[11px] shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Perks</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
