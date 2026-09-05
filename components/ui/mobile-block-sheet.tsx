"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X, ArrowRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface MobileBlockSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileBlockSheet({ isOpen, onClose }: MobileBlockSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/me/projects/new`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-block-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            key="mobile-block-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Desktop required for publishing"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-[71] rounded-t-[28px] bg-[var(--bg-elevated)] border-t border-[var(--border-neutral)] shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center bg-[var(--bg-neutral)] text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral-hover)] transition-all"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 pt-4 pb-8 flex flex-col items-center text-center space-y-5">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/20 text-[var(--brand-secondary)] shadow-xs">
                <Monitor className="h-8 w-8" strokeWidth={1.8} />
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl font-black text-[var(--content-primary)] tracking-tight"
                  )}
                >
                  Publishing Requires a Larger Screen
                </h2>
                <p className="text-sm text-[var(--content-secondary)] leading-relaxed max-w-xs mx-auto">
                  For the best experience uploading case study images, filling in project details, and previewing your work — please switch to a tablet or desktop.
                </p>
              </div>

              {/* Feature list */}
              <ul className="w-full max-w-xs space-y-2.5 text-left">
                {[
                  "Upload high-resolution cover & gallery images",
                  "Add detailed case study descriptions",
                  "Preview your project before publishing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-[var(--content-secondary)]">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-[var(--brand-secondary-subtle)] border border-[var(--brand-secondary)]/30 flex items-center justify-center shrink-0">
                      <ArrowRight className="h-2.5 w-2.5 text-[var(--brand-secondary)]" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="w-full max-w-xs space-y-2.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full h-11 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] text-[var(--content-primary)] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[var(--bg-neutral)] transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied Editor Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[var(--content-secondary)]" />
                      <span>Copy Editor Link for Desktop</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-11 rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold text-sm hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
