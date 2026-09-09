"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  hasUnsavedImages?: boolean;
}

export function ExitConfirmModal({
  isOpen,
  onClose,
  onDiscard,
  onSaveDraft,
  isSavingDraft = false,
  hasUnsavedImages = false,
}: ExitConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isSavingDraft) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isSavingDraft, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSavingDraft) onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Close button */}
          <button
            type="button"
            disabled={isSavingDraft}
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full p-1.5 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Warning Icon Badge */}
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
            <AlertTriangle className="h-6 w-6 stroke-[2]" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2 mb-6">
            <h3
              className={cn(
                bricolage.className,
                "text-xl sm:text-2xl font-black text-[var(--content-primary)] tracking-tight"
              )}
            >
              Discard Unsaved Project?
            </h3>
            <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
              {hasUnsavedImages
                ? "You have uploaded case study images and edits that are not yet published. Leaving now without saving will permanently discard your work."
                : "You have unsaved changes in your project editor. Are you sure you want to leave?"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* 1. Primary: Keep Editing */}
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              disabled={isSavingDraft}
              className="w-full justify-center font-bold shadow-xs py-2.5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Keep Editing</span>
            </Button>

            {/* 2. Optional: Save Draft & Exit */}
            {onSaveDraft && (
              <Button
                type="button"
                variant="secondary"
                onClick={onSaveDraft}
                disabled={isSavingDraft}
                className="w-full justify-center font-semibold text-xs py-2.5 shadow-2xs"
              >
                <Save className="h-3.5 w-3.5 mr-2" />
                <span>{isSavingDraft ? "Saving Draft..." : "Save Draft & Exit"}</span>
              </Button>
            )}

            {/* 3. Destructive: Discard & Exit */}
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSavingDraft}
              className="w-full text-center text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors py-2 cursor-pointer disabled:opacity-50"
            >
              Discard Changes and Exit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
