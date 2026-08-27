"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import {
  Mail,
  ShieldAlert,
  Heart,
  UserPlus,
  MessageSquare,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { getResendStatus, sendVerificationEmail } from "@/lib/resend-limiter";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type GatedActionType = "like" | "follow" | "comment" | "publish";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: GatedActionType;
  targetName?: string;
}

export function VerificationModal({
  isOpen,
  onClose,
  action = "like",
  targetName,
}: VerificationModalProps) {
  const { user } = useSession();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const userEmail = user?.email || (typeof window !== "undefined" ? localStorage.getItem("craft_last_registered_email") || "" : "");

  // Update rate limiter cooldown timer
  useEffect(() => {
    if (!isOpen || !userEmail) return;

    const checkLimiter = () => {
      const status = getResendStatus(userEmail);
      setCooldown(status.remainingCooldownSeconds);
    };

    checkLimiter();
    const interval = setInterval(checkLimiter, 1000);
    return () => clearInterval(interval);
  }, [isOpen, userEmail]);

  const handleResend = async () => {
    if (!userEmail || cooldown > 0 || isSending) return;

    setIsSending(true);
    setErrorMessage(null);
    setSendSuccess(false);

    try {
      const res = await sendVerificationEmail(userEmail);
      if (res.success) {
        setSendSuccess(true);
        setCooldown(60);
      } else {
        setErrorMessage(res.error || "Could not send verification email.");
        if (res.remainingCooldownSeconds) {
          setCooldown(res.remainingCooldownSeconds);
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const getActionDetails = () => {
    switch (action) {
      case "like":
        return {
          icon: <Heart className="h-6 w-6 text-red-500 fill-red-500/20" />,
          title: "Verify to Appreciate Projects",
          description: targetName
            ? `Please verify your email to appreciate "${targetName}" and support creators.`
            : "Please verify your email to appreciate projects and save them to your inspiration feed.",
        };
      case "follow":
        return {
          icon: <UserPlus className="h-6 w-6 text-[#8DFF00]" />,
          title: "Verify to Follow Creators",
          description: targetName
            ? `Please verify your email to follow ${targetName} and receive their latest updates.`
            : "Please verify your email to follow independent creators and curate your network.",
        };
      case "comment":
        return {
          icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
          title: "Verify to Post Comments",
          description: "Please verify your email to participate in discussions and leave feedback.",
        };
      case "publish":
        return {
          icon: <PlusCircle className="h-6 w-6 text-[var(--accent)]" />,
          title: "Verify to Publish Projects",
          description: "Please verify your email before publishing live case studies and monographs.",
        };
    }
  };

  const details = getActionDetails();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[var(--base-dark)]/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Action Icon Header */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shadow-xs">
              {details.icon}
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-0.5 text-[11px] font-semibold text-[var(--chip-fg)] mb-2 shadow-xs">
              <ShieldAlert className="h-3 w-3 text-[#8DFF00]" />
              <span>Email Verification Required</span>
            </div>

            <h3
              className={cn(
                bricolage.className,
                "text-2xl font-bold text-[var(--content-primary)] tracking-tight"
              )}
            >
              {details.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
              {details.description}
            </p>
          </div>

          {/* Body Content depending on User vs Guest */}
          <div className="mt-6 space-y-4">
            {user ? (
              <>
                {/* Email Target Box */}
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg-neutral)]/60 border border-[var(--border-neutral)] p-3.5">
                  <Mail className="h-4 w-4 text-[var(--content-tertiary)] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase font-mono text-[var(--content-tertiary)]">
                      Activation link sent to
                    </span>
                    <span className="block text-xs font-bold text-[var(--content-primary)] truncate">
                      {userEmail || "your registered email"}
                    </span>
                  </div>
                </div>

                {/* Feedback Alerts */}
                {sendSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>A fresh verification link has been sent to your inbox!</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSending || cooldown > 0}
                    onClick={handleResend}
                    className="w-full font-bold shadow-xs gap-2"
                  >
                    {isSending ? (
                      "Sending link..."
                    ) : cooldown > 0 ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Resend available in {cooldown}s</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="w-full text-xs text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
                  >
                    Dismiss for now
                  </Button>
                </div>
              </>
            ) : (
              /* Guest Not Logged In */
              <div className="space-y-3 pt-2">
                <Link href="/login" onClick={onClose} className="block">
                  <Button variant="accent" className="w-full font-bold shadow-xs gap-2">
                    <span>Log in to your account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/signup" onClick={onClose} className="block">
                  <Button variant="secondary" className="w-full font-semibold">
                    Create a free account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
