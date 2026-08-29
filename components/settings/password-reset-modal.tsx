"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, X, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PasswordStrengthIndicator,
  getPasswordStrength,
} from "@/components/ui/password-strength-indicator";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PasswordResetModal({ isOpen, onClose, onSuccess }: PasswordResetModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Invalidate on dismissal / unload
  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("craft_password_reset_cancelled", "true");
      // Clean query params from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("reset_password");
      url.hash = "";
      window.history.replaceState({}, document.title, url.toString());
    }
    onClose();
  };

  const { isRequiredSatisfied } = getPasswordStrength(password);
  const isMatching = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const isFormValid = isRequiredSatisfied && isMatching;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setIsSuccess(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("craft_password_reset_completed", "true");
        const url = new URL(window.location.href);
        url.searchParams.delete("reset_password");
        url.hash = "";
        window.history.replaceState({}, document.title, url.toString());
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1600);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to update password.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!loading ? handleDismiss : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-none z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--primary-forest-green)] shrink-0">
                <KeyRound className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-black text-[var(--content-primary)] tracking-tight"
                  )}
                >
                  Set New Password
                </h2>
                <span className="text-xs text-[var(--content-secondary)]">
                  Secure your Layerat account credentials
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              disabled={loading}
              className="rounded-full p-1.5 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center py-4 space-y-3"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sentiment-positive-bg)] text-[var(--sentiment-positive-fg)] shadow-md">
                <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
              </div>
              <h3 className="type-title-subsection text-[var(--content-primary)]">
                Password Successfully Updated
              </h3>
              <p className="type-body-default text-[var(--content-secondary)] max-w-xs mx-auto">
                Your new password is now active and your account session is secure.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--content-tertiary)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 chars, mixed case & numbers"
                    className="pl-10 pr-10 text-sm"
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-2">
                  <PasswordStrengthIndicator password={password} />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--content-tertiary)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="pl-10 pr-10 text-sm"
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && !isMatching && (
                  <p className="mt-1 text-[11px] font-medium text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleDismiss}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  disabled={!isFormValid || loading}
                  className="gap-2 font-bold shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
