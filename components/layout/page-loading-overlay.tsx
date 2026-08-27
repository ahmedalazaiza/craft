"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CraftLoader } from "@/components/ui/craft-loader";

export function PageLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);

  // When route changes and completes mounting, dismiss loader smoothly
  useEffect(() => {
    // Dismiss after slight delay for smooth visual transition
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLoadingText(undefined);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept internal link clicks to trigger full-page loading overlay instantly
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.hasAttribute("download") &&
        target.getAttribute("target") !== "_blank"
      ) {
        const currentPath = window.location.pathname + window.location.search;
        if (href !== currentPath) {
          setIsLoading(true);
        }
      }
    };

    // Custom programmatic loading events (for form submits, auth, etc.)
    const handleStartLoading = (e: Event) => {
      const customEvent = e as CustomEvent<{ text?: string }>;
      setIsLoading(true);
      if (customEvent.detail?.text) {
        setLoadingText(customEvent.detail.text);
      }
    };

    const handleStopLoading = () => {
      setIsLoading(false);
      setLoadingText(undefined);
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("craft:start-page-loading", handleStartLoading);
    window.addEventListener("craft:stop-page-loading", handleStopLoading);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("craft:start-page-loading", handleStartLoading);
      window.removeEventListener("craft:stop-page-loading", handleStopLoading);
    };
  }, []);

  // Safety auto-dismiss timeout (max 4 seconds) to ensure user is never blocked
  useEffect(() => {
    if (!isLoading) return;
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(safetyTimer);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--bg-screen)]/85 backdrop-blur-md select-none pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-6"
          >
            <CraftLoader size="lg" text={loadingText} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
