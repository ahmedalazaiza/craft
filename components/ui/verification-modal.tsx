"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import {
  Mail,
  Heart,
  UserPlus,
  User,
  MessageSquare,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  FolderKanban,
  Check,
} from "lucide-react";
import { getResendStatus, sendVerificationEmail } from "@/lib/resend-limiter";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

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
          glowColor: "rgba(133, 16, 222, 0.12)",
          badgeBg: "bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] border-[var(--brand-secondary)]/20",
          badgeIcon: <Heart className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />,
          badgeLabel: "Appreciation Access",
          icon: <Heart className="h-7 w-7 text-[var(--brand-secondary)]" />,
          targetIcon: <FolderKanban className="h-3.5 w-3.5 text-[var(--content-primary)]" />,
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
          glowColor: "rgba(133, 16, 222, 0.12)",
          badgeBg: "bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] border-[var(--brand-secondary)]/20",
          badgeIcon: <UserPlus className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />,
          badgeLabel: "Creator Network",
          icon: <UserPlus className="h-7 w-7 text-[var(--brand-secondary)]" />,
          targetIcon: <User className="h-3.5 w-3.5 text-[var(--content-primary)]" />,
          title: "Follow Independent Creators",
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
          glowColor: "rgba(133, 16, 222, 0.12)",
          badgeBg: "bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] border-[var(--brand-secondary)]/20",
          badgeIcon: <MessageSquare className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />,
          badgeLabel: "Critique & Discussion",
          icon: <MessageSquare className="h-7 w-7 text-[var(--brand-secondary)]" />,
          targetIcon: <MessageSquare className="h-3.5 w-3.5 text-[var(--content-primary)]" />,
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
          glowColor: "rgba(133, 16, 222, 0.12)",
          badgeBg: "bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] border-[var(--brand-secondary)]/20",
          badgeIcon: <Sparkles className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />,
          badgeLabel: "Studio Publishing",
          icon: <Sparkles className="h-7 w-7 text-[var(--brand-secondary)]" />,
          targetIcon: <Sparkles className="h-3.5 w-3.5 text-[var(--content-primary)]" />,
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
          {/* Mobile Pull Handle Indicator */}
          <div className="flex sm:hidden justify-center pt-1 pb-4 -mt-2 shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
          </div>

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
            {/* Clean Modern Hero Icon Container */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/25 text-[var(--brand-secondary)] shadow-xs">
              {config.icon}
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
                  {config.targetIcon}
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
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)]">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
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
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSending || cooldown > 0}
                    onClick={handleResend}
                    className="w-full font-bold shadow-xs"
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
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full font-semibold text-xs"
                  >
                    Dismiss for now
                  </Button>
                </div>
              </>
            ) : (
              /* Unauthenticated Guest */
              <div className="space-y-2.5">
                <Link
                  href="/login"
                  onClick={onClose}
                  className={buttonVariants({
                    variant: "primary",
                    size: "default",
                    className: "w-full font-bold shadow-xs gap-2",
                  })}
                >
                  <span>Log in to your account</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/signup"
                  onClick={onClose}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "default",
                    className: "w-full font-semibold",
                  })}
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
