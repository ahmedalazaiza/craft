"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { PasswordResetModal } from "@/components/settings/password-reset-modal";
import { requestPasswordResetInDb } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";
import {
  User,
  Shield,
  Bell,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "security" | "preferences" | "danger";

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoadingDb } = useSession();

  const [activeTab, setActiveTab] = useState<SettingsTab>("security");

  // Security / Password Reset State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [commentNotifs, setCommentNotifs] = useState(true);
  const [appreciateNotifs, setAppreciateNotifs] = useState(true);
  const [directoryDiscoverable, setDirectoryDiscoverable] = useState(true);

  // Check for password reset trigger from URL or Auth State
  useEffect(() => {
    const isResetParam = searchParams.get("reset_password") === "true";
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token");
      const isCancelled = sessionStorage.getItem("craft_password_reset_cancelled") === "true";
      const isCompleted = sessionStorage.getItem("craft_password_reset_completed") === "true";

      if ((isResetParam || isRecoveryHash) && !isCancelled && !isCompleted) {
        setIsPasswordModalOpen(true);
      }
    }

    // Listener for auth state password recovery event
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordModalOpen(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  // Cooldown countdown timer for password reset email
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  // Handle Send Password Reset Email
  const handleSendPasswordReset = async () => {
    if (!user?.email || isSendingReset || resetCooldown > 0) return;

    setIsSendingReset(true);
    setResetSentSuccess(false);
    setResetError(null);

    try {
      const res = await requestPasswordResetInDb(user.email);
      if (res.success) {
        setResetSentSuccess(true);
        setResetCooldown(60); // 60s cooldown
      } else {
        setResetError(res.error || "Failed to dispatch password reset email.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send reset link.";
      setResetError(errorMsg);
    } finally {
      setIsSendingReset(false);
    }
  };

  if (isLoadingDb) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)]" />
          <span className="text-xs font-semibold text-[var(--content-tertiary)]">Loading Account Settings...</span>
        </div>
      </div>
    );
  }

  // Guest State -> Auth Required
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 rounded-[28px] shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] mx-auto mb-4 text-[var(--primary-forest-green)]">
            <User className="h-8 w-8" />
          </div>
          <h1 className="type-title-section text-[var(--content-primary)]">
            Account Settings Authentication Required
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            Please log in with your creator credentials to access and modify your studio security, preferences, and account configurations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({
                variant: "accent",
                className: "font-bold shadow-xs",
              })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold",
              })}
            >
              Create account
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-10">
      <FadeIn>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "My Studio", href: "/me" },
            { label: "Account Settings", isCurrent: true },
          ]}
        />

        {/* Page Header */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-neutral)] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-2">
              <span>Account Hub</span>
              <span>•</span>
              <span>@{user.username}</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl font-black text-[var(--primary-forest-green)] tracking-tight"
              )}
            >
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-[var(--content-secondary)] max-w-2xl">
              Configure your credentials, security recovery, notifications, and account preferences.
            </p>
          </div>

          {/* Quick Action: View Public Studio */}
          <div className="flex items-center gap-3">
            <Link
              href={`/u/${user.username}`}
              target="_blank"
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "gap-1.5 font-bold shadow-xs",
              })}
            >
              <span>View Public Studio</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Layout Grid: Sidebar Navigation + Settings Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Tabs (Desktop Sidebar / Mobile Bar) */}
          <div className="lg:col-span-3">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 p-1.5 rounded-[20px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "security"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>Security & Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "preferences"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Bell className="h-4 w-4 shrink-0" />
                <span>Preferences & Privacy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("danger")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "danger"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                )}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>Danger Zone</span>
              </button>
            </nav>
          </div>

          {/* Settings Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* ============================================================= */}
            {/* 1. SECURITY & CREDENTIALS TAB                                */}
            {/* ============================================================= */}
            {activeTab === "security" && (
              <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h2 className="type-title-subsection text-[var(--content-primary)]">
                    Security & Authentication
                  </h2>
                  <p className="mt-1 text-xs text-[var(--content-secondary)]">
                    Manage your verified email address and single-session account password recovery.
                  </p>
                </div>

                {/* Email Section */}
                <div className="p-4 rounded-[20px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--content-primary)]">
                          {user.email || "No email on record"}
                        </span>
                        {user.isVerified !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sentiment-positive-bg)]/15 text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Email
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            Pending Verification
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--content-tertiary)]">
                        Primary email used for sign-in and security notifications.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Reset Dispatch Section */}
                <div className="p-5 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/20 text-[var(--primary-forest-green)] shrink-0 mt-0.5">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--content-primary)]">
                          Account Password
                        </h3>
                        <p className="text-xs text-[var(--content-secondary)] mt-0.5 max-w-md leading-relaxed">
                          To change your password, request a secure single-use recovery link. Upon clicking the link in your inbox, a pop-up modal will allow you to define a new password.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={handleSendPasswordReset}
                      disabled={isSendingReset || resetCooldown > 0}
                      className="gap-2 font-bold shadow-xs shrink-0"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : resetCooldown > 0 ? (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Resend in {resetCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>Send Password Reset Link</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {resetSentSuccess && (
                    <div className="rounded-xl border border-[var(--sentiment-positive-bg)]/30 bg-[var(--sentiment-positive-bg)]/10 p-3.5 text-xs text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Password reset link successfully sent to <strong>{user.email}</strong>. Open the link to update your password in the single-use modal.
                      </span>
                    </div>
                  )}

                  {resetError && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ============================================================= */}
            {/* 2. PREFERENCES & PRIVACY TAB                                 */}
            {/* ============================================================= */}
            {activeTab === "preferences" && (
              <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h2 className="type-title-subsection text-[var(--content-primary)]">
                    Notification & Privacy Preferences
                  </h2>
                  <p className="mt-1 text-xs text-[var(--content-secondary)]">
                    Control what notifications you receive and how your studio appears in the public creator directory.
                  </p>
                </div>

                <div className="space-y-4 divide-y divide-[var(--border-neutral)]">
                  {/* Public Directory Visibility */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Public Creator Directory Listing
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Display your studio in the global Creators discovery stream.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDirectoryDiscoverable(!directoryDiscoverable)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        directoryDiscoverable ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle directory discoverability"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          directoryDiscoverable ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Appreciation Notifications */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Peer Appreciations (Likes)
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Receive activity notifications when creators appreciate your monographs.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppreciateNotifs(!appreciateNotifs)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        appreciateNotifs ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle appreciation notifications"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          appreciateNotifs ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Comment & Feedback Notifications */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Critiques & Discussion Notes
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Get notified when peers leave feedback on your published case studies.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCommentNotifs(!commentNotifs)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        commentNotifs ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle critique notifications"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          commentNotifs ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* ============================================================= */}
            {/* 3. DANGER ZONE TAB                                           */}
            {/* ============================================================= */}
            {activeTab === "danger" && (
              <Card elevated className="border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                    <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">
                      Danger Zone
                    </h2>
                    <p className="mt-1 text-xs text-[var(--content-secondary)] leading-relaxed max-w-xl">
                      Actions in this section are irreversible. Deleting your account will completely purge all your published case studies, uploaded gallery spreads, peer feedback, appreciations, and studio profile from the database.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-rose-500/20 bg-[var(--bg-elevated)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--content-primary)]">
                      Permanently Delete Account
                    </div>
                    <div className="text-xs text-[var(--content-secondary)] mt-0.5">
                      Once deleted, your studio username and data cannot be recovered.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Single-Session Password Reset Popup Modal */}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setResetSentSuccess(false);
          setActiveTab("security");
        }}
      />
    </div>
  );
}
