"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const { user, deleteAccount } = useSession();
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const expectedInput = user.username;
  const isMatch = confirmationInput.trim().toLowerCase() === expectedInput.toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const success = await deleteAccount();
      if (success) {
        onClose();
        router.push("/?account_deleted=true");
      } else {
        setErrorMessage("Failed to delete account. Please try again or contact support.");
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!isDeleting ? onClose : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-rose-500/30 bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-none z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-black text-[var(--content-primary)] tracking-tight"
                  )}
                >
                  Delete Account
                </h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Irreversible Action
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-full p-1.5 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Warning Narrative */}
          <div className="mt-5 space-y-3 text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
            <p>
              Are you absolutely certain you want to delete your account? This action is{" "}
              <strong className="text-[var(--content-primary)] font-bold">permanent and irreversible</strong>.
            </p>
            <div className="rounded-[16px] border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs text-rose-700 dark:text-rose-300 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <span>The following data will be permanently wiped:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90 pl-1">
                <li>Your public profile and studio moniker (@{user.username})</li>
                <li>All published design monographs, case studies, and uploaded gallery images</li>
                <li>All comments, feedback notes, and peer discussions</li>
                <li>All appreciations and studio follower connections</li>
              </ul>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleDelete} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="confirm-delete-username"
                className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5"
              >
                Type your username{" "}
                <span className="font-mono px-1.5 py-0.5 rounded-md bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold">
                  {expectedInput}
                </span>{" "}
                to confirm:
              </label>
              <Input
                id="confirm-delete-username"
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={`Type "${expectedInput}"`}
                disabled={isDeleting}
                className="w-full font-mono text-sm"
                autoComplete="off"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto font-semibold"
              >
                Cancel
              </Button>

              <button
                type="submit"
                disabled={!isMatch || isDeleting}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full h-12 min-h-[48px] px-6 text-sm font-bold transition-all w-full sm:w-auto select-none",
                  isMatch && !isDeleting
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer active:scale-98"
                    : "bg-rose-500/20 text-rose-400/60 border border-rose-500/20 cursor-not-allowed pointer-events-none"
                )}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Purging Account Data...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Permanently Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
