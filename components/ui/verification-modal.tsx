"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import {
  Mail,
  Heart,
  UserPlus,
  MessageSquare,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  ShieldCheck,
  Compass,
  Zap,
  Lock,
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

  const userEmail = user?.email || "";

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

  const getActionConfig = () => {
    switch (action) {
      case "like":
        return {
          glowColor: "rgba(244, 63, 94, 0.15)",
          badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          badgeIcon: <Heart className="h-3.5 w-3.5 fill-current" />,
          badgeLabel: "Appreciation Access",
          iconBg: "from-rose-500/20 to-rose-600/5 text-rose-500 ring-rose-500/20",
          icon: <Heart className="h-7 w-7 fill-rose-500/25 stroke-[2.2]" />,
          title: "Appreciate & Save Works",
          description: targetName
            ? `Sign in or verify your email to appreciate and bookmark this case study.`
            : "Sign in or verify your email to appreciate projects and curate your private library.",
          targetLabel: "Project",
          benefits: [
            "Support independent designers with instant hearts",
            "Bookmark projects to your personal inspiration feed",
            "Receive creator milestone notifications",
          ],
        };
      case "follow":
        return {
          glowColor: "rgba(150, 46, 230, 0.16)",
          badgeBg: "bg-[#962EE6]/10 text-[#962EE6] dark:text-purple-300 border-[#962EE6]/25",
          badgeIcon: <UserPlus className="h-3.5 w-3.5" />,
          badgeLabel: "Creator Network",
          iconBg: "from-[#962EE6]/25 to-[#962EE6]/5 text-[#962EE6] dark:text-purple-300 ring-[#962EE6]/25",
          icon: <UserPlus className="h-7 w-7 stroke-[2.2]" />,
          title: "Follow Independent Studios",
          description: targetName
            ? `Sign in to follow ${targetName} and catch their latest monographs in your feed.`
            : "Sign in to follow verified designers and build your design network.",
          targetLabel: "Creator",
          benefits: [
            "Direct updates when creators publish new work",
            "Personalized following feed tailored to your taste",
            "Connect with verified creative directors worldwide",
          ],
        };
      case "comment":
        return {
          glowColor: "rgba(59, 130, 246, 0.15)",
          badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          badgeIcon: <MessageSquare className="h-3.5 w-3.5 fill-current" />,
          badgeLabel: "Critique & Discussion",
          iconBg: "from-blue-500/20 to-blue-600/5 text-blue-500 ring-blue-500/20",
          icon: <MessageSquare className="h-7 w-7 fill-blue-500/25 stroke-[2.2]" />,
          title: "Join the Conversation",
          description: "Sign in to leave constructive feedback, discuss typography & craft, and interact with creators.",
          targetLabel: "Discussion",
          benefits: [
            "Share constructive insights with top designers",
            "Direct replies and feedback from authors",
            "Participate in high-craft design discourse",
          ],
        };
      case "publish":
        return {
          glowColor: "rgba(16, 185, 129, 0.15)",
          badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          badgeIcon: <Sparkles className="h-3.5 w-3.5" />,
          badgeLabel: "Studio Publishing",
          iconBg: "from-emerald-500/20 to-emerald-600/5 text-emerald-500 ring-emerald-500/20",
          icon: <Sparkles className="h-7 w-7 stroke-[2.2]" />,
          title: "Publish Visual Case Studies",
          description: "Verify your email to release high-resolution monographs, branding archives, and interactive kinetic streams.",
          targetLabel: "Studio",
          benefits: [
            "Unlimited high-resolution gallery uploads",
            "Editorial placement in kinetic discover streams",
            "Custom studio profile with verified badge",
          ],
        };
    }
  };

  const config = getActionConfig();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
        {/* Ambient Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-all"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[440px] max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.18)] dark:shadow-none z-10 pb-safe"
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-80 rounded-full blur-3xl opacity-70"
            style={{ backgroundColor: config.glowColor }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="group absolute top-5 right-5 rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-all cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-90 duration-200" />
          </button>

          {/* Header Content */}
          <div className="relative flex flex-col items-center text-center">
            {/* Layered Luxury Hero Icon */}
            <div className="relative mb-5">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-[var(--bg-neutral)] to-[var(--bg-screen)] border border-[var(--border-neutral)] shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-4 ring-[var(--bg-neutral)]/50">
                {config.icon}
              </div>
              {/* Floating Sparkle Micro-badge */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs">
                <Lock className="h-3 w-3 text-[var(--content-tertiary)]" />
              </div>
            </div>

            {/* Action Category Pill */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border mb-3 tracking-wide select-none shadow-2xs",
                config.badgeBg
              )}
            >
              {config.badgeIcon}
              <span>{config.badgeLabel}</span>
            </div>

            {/* Main Title */}
            <h3
              className={cn(
                bricolage.className,
                "text-2xl sm:text-[26px] font-bold text-[var(--content-primary)] tracking-tight leading-snug"
              )}
            >
              {config.title}
            </h3>

            {/* Targeted Object Chip (if available) */}
            {targetName ? (
              <div className="mt-3 w-full rounded-2xl bg-[var(--bg-neutral)]/70 border border-[var(--border-neutral)]/80 px-3.5 py-2.5 flex items-center gap-2.5 text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-[var(--content-secondary)]">
                  <Compass className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                    {config.targetLabel}
                  </span>
                  <span className="block text-xs font-semibold text-[var(--content-primary)] truncate">
                    {targetName}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs sm:text-[13px] text-[var(--content-secondary)] leading-relaxed max-w-sm">
                {config.description}
              </p>
            )}

            {/* Visual Value Props / Perks */}
            <div className="mt-4.5 w-full rounded-2xl bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)]/50 p-3.5 space-y-2 text-left">
              {config.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[var(--content-secondary)]">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#962EE6]/15 text-[#962EE6] dark:text-purple-300">
                    <Zap className="h-2.5 w-2.5 fill-current" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 space-y-3">
            {user ? (
              /* Signed-in but unverified user */
              <>
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--bg-neutral)]/80 border border-[var(--border-neutral)] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)]">
                    <Mail className="h-4 w-4 text-[var(--content-tertiary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-[var(--content-tertiary)]">
                      Registered Email
                    </span>
                    <span className="block text-xs font-bold text-[var(--content-primary)] truncate">
                      {userEmail || "your registered email"}
                    </span>
                  </div>
                </div>

                {/* Feedback Alerts */}
                {sendSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>A fresh verification link has been sent to your inbox!</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-medium text-rose-700 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={isSending || cooldown > 0}
                    onClick={handleResend}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] disabled:opacity-50 shadow-xs transition-all cursor-pointer"
                  >
                    {isSending ? (
                      "Sending link..."
                    ) : cooldown > 0 ? (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>Resend link in {cooldown}s</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-xs font-medium text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
                  >
                    Dismiss for now
                  </button>
                </div>
              </>
            ) : (
              /* Unauthenticated Guest */
              <div className="space-y-2.5">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="group relative flex items-center justify-center gap-2 w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-[var(--primary-forest-green)] text-[var(--bg-screen)] dark:bg-[#962EE6] dark:text-white shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Log in to your account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/signup"
                  onClick={onClose}
                  className="flex items-center justify-center w-full py-3 px-5 rounded-2xl font-semibold text-sm bg-[var(--bg-neutral)]/80 hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-primary)] hover:scale-[1.005] active:scale-[0.99] transition-all cursor-pointer"
                >
                  Create a free account
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
