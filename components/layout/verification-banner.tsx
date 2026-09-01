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
  const userEmail = user?.email || "";

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
        className="relative z-50 bg-[#150D21] dark:bg-[#10071C] text-white border-b border-[#962EE6]/30 px-4 py-2.5 sm:px-6 shadow-xs"
      >
        <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#962EE6] text-white shadow-xs animate-pulse">
              <Mail className="h-3 w-3" />
            </span>

            <p className="truncate font-medium text-white/90">
              <strong className="text-white font-bold">Account Activation Required:</strong> Please confirm your email{" "}
              {userEmail && <span className="font-mono text-[#DEB2FF] underline">({userEmail})</span>} to unlock appreciation, following creators, and publishing projects.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {sendSuccess ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Link sent! Check inbox</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending || cooldown > 0}
                className="font-bold text-[#DEB2FF] hover:text-white underline underline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs inline-flex items-center gap-1"
              >
                {isSending ? (
                  "Sending..."
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>Resend in {cooldown}s</span>
                  </>
                ) : (
                  "Resend activation link"
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => openVerificationModal("publish")}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#962EE6] hover:bg-[#801FD1] text-white px-3 py-1 font-bold text-[11px] shadow-xs transition-all cursor-pointer"
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
