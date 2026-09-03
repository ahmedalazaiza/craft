"use client";

import React, { useState, useEffect } from "react";
import { submitReportInDb } from "@/lib/supabase/queries";
import { ReportReason } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Flag, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "project" | "creator";
  targetId: string;
  targetName: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: "copyright",
    label: "Copyright / Intellectual Property",
    description: "Work was posted without permission or infringes original ownership.",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate or Explicit Content",
    description: "Contains prohibited, graphic, or non-work-appropriate imagery.",
  },
  {
    value: "spam",
    label: "Spam or Commercial Solicitation",
    description: "Promotional spam, fake work, or automated bulk posting.",
  },
  {
    value: "harassment",
    label: "Harassment or Abusive Behavior",
    description: "Targeted harassment, derogatory language, or defamation.",
  },
  {
    value: "other",
    label: "Other Community Issue",
    description: "Any other violation of Layerat community standards.",
  },
];

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason>("copyright");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setReason("copyright");
      setNotes("");
      setIsSubmitting(false);
      setIsSubmitted(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload =
      targetType === "project"
        ? { projectId: targetId, reason, notes }
        : { reportedCreatorId: targetId, reason, notes };

    const res = await submitReportInDb(payload);

    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setErrorMsg(res.error || "Failed to submit report. Please try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close dialog"
          className="absolute top-5 right-5 h-8 w-8 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {isSubmitted ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)] mb-2")}>
              Report Submitted
            </h2>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-sm">
              Thank you for keeping Layerat authentic and safe. Our moderation team will review this notice promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-3">
                <Flag className="h-3 w-3" />
                <span>Content Moderation</span>
              </div>
              <h2
                id="report-modal-title"
                className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}
              >
                Report {targetType === "project" ? "Project" : "Creator"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--content-secondary)] mt-1 truncate">
                Target: <span className="font-semibold text-[var(--content-primary)]">{targetName}</span>
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Reason for report
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((item) => (
                  <label
                    key={item.value}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all",
                      reason === item.value
                        ? "border-[var(--content-primary)] bg-[var(--bg-neutral)]/80 shadow-xs"
                        : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)]/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={item.value}
                      checked={reason === item.value}
                      onChange={() => setReason(item.value)}
                      className="mt-0.5 text-[var(--content-primary)] focus:ring-[var(--content-primary)]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--content-primary)]">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[var(--content-secondary)] mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes Textarea */}
            <div className="space-y-1.5">
              <label htmlFor="reportNotes" className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Additional context (optional)
              </label>
              <textarea
                id="reportNotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any links or context to help our curators review this issue..."
                className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-3 text-xs text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--content-primary)]/20 focus:border-[var(--content-primary)] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="default"
                disabled={isSubmitting}
                onClick={onClose}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="default"
                disabled={isSubmitting}
                className="rounded-full font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Report</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
