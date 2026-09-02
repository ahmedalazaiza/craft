"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface MobileBlockSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileBlockSheet({ isOpen, onClose }: MobileBlockSheetProps) {
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
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
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
            className="fixed inset-x-0 bottom-0 z-[71] rounded-t-[28px] bg-[var(--bg-screen)] border-t border-[var(--border-neutral)] shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[var(--border-neutral)]" />
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

              {/* CTA */}
              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-xs h-12 rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] font-bold text-sm hover:bg-[var(--btn-cta-bg-hover)] active:bg-[var(--btn-cta-bg-active)] transition-all active:scale-[0.98] shadow-sm"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
