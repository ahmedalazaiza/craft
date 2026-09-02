"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, Check, X, Sliders, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const STORAGE_KEY = "layerat_cookie_consent_v1";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        setPreferences(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Listen for manual reopen events (e.g. from footer "Cookie Settings" link)
  useEffect(() => {
    const handleReopen = () => {
      setIsVisible(true);
      setIsCustomizeOpen(true);
    };
    window.addEventListener("open-cookie-preferences", handleReopen);
    return () => window.removeEventListener("open-cookie-preferences", handleReopen);
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    // Set cookie for server-side awareness if needed
    document.cookie = `layerat_consent=1; path=/; max-age=31536000; SameSite=Lax`;
    setIsVisible(false);
    setIsCustomizeOpen(false);
  };

  const handleAcceptAll = () => {
    const all = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(all);
    saveConsent(all);
  };

  const handleEssentialOnly = () => {
    const essential = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(essential);
    saveConsent(essential);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!mounted || !isVisible) return null;

  const content = (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-[99990] max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)]/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-[var(--content-primary)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)] shrink-0">
                  <Cookie className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    className={cn(
                      bricolage.className,
                      "text-base font-bold tracking-tight text-[var(--content-primary)]"
                    )}
                  >
                    Your Privacy & Cookie Choices
                  </h3>
                  <p className="text-[11px] text-[var(--content-tertiary)]">
                    We value transparency and give you full control over your data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEssentialOnly}
                className="p-1 rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                title="Dismiss (Essential only)"
                aria-label="Dismiss cookie banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description Body */}
            <p className="mt-3 text-xs leading-relaxed text-[var(--content-secondary)]">
              Layerat uses cookies and localized storage to maintain your studio session, analyze creator reach, and optimize your portfolio viewing experience. Read our{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="font-semibold text-[var(--content-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                target="_blank"
                className="font-semibold text-[var(--content-primary)] underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Terms of Use
              </Link>.
            </p>

            {/* Customization Accordion */}
            {isCustomizeOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-3 border-t border-[var(--border-neutral)] space-y-2.5 text-xs"
              >
                {/* Essential */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-neutral)]/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[var(--content-primary)] flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                      Strictly Essential
                    </span>
                    <p className="text-[11px] text-[var(--content-tertiary)]">
                      Required for secure authentication and studio project drafts.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--content-primary)] bg-[var(--bg-neutral)] px-2 py-0.5 rounded-full border border-[var(--border-neutral)]">
                    Always Active
                  </span>
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-neutral)]/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[var(--content-primary)]">
                      Performance & Analytics
                    </span>
                    <p className="text-[11px] text-[var(--content-tertiary)]">
                      Helps us count monograph views and improve platform speed.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded accent-[var(--content-primary)] cursor-pointer"
                  />
                </div>

                {/* Functional */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-neutral)]/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[var(--content-primary)]">
                      Studio Personalization
                    </span>
                    <p className="text-[11px] text-[var(--content-tertiary)]">
                      Remembers theme preferences and filter sort configurations.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        functional: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded accent-[var(--content-primary)] cursor-pointer"
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
                className="text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] inline-flex items-center gap-1.5 transition-colors cursor-pointer py-1.5"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{isCustomizeOpen ? "Hide Settings" : "Customize"}</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={isCustomizeOpen ? handleSaveCustom : handleEssentialOnly}
                  className="text-xs font-semibold px-3.5 h-8"
                >
                  {isCustomizeOpen ? "Save Preferences" : "Essential Only"}
                </Button>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="text-xs font-bold px-4 h-8 shadow-xs gap-1"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Accept All</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
