"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { CraftLoader } from "@/components/ui/craft-loader";

export function PageLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoadingDb } = useSession();
  const [manualLoading, setManualLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Smoothly dismiss initial load overlay when database fetch finishes
  useEffect(() => {
    if (!isLoadingDb) {
      const timer = setTimeout(() => {
        setIsInitialMount(false);
        setManualLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoadingDb]);

  // When route changes, dismiss loader smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      setManualLoading(false);
      setLoadingText(undefined);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept internal link clicks for instant visual feedback
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
          setManualLoading(true);
        }
      }
    };

    const handleStartLoading = (e: Event) => {
      const customEvent = e as CustomEvent<{ text?: string }>;
      setManualLoading(true);
      if (customEvent.detail?.text) {
        setLoadingText(customEvent.detail.text);
      }
    };

    const handleStopLoading = () => {
      setManualLoading(false);
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

  // Safety auto-dismiss timeout (max 3 seconds)
  useEffect(() => {
    if (!manualLoading && !isInitialMount) return;
    const safetyTimer = setTimeout(() => {
      setManualLoading(false);
      setIsInitialMount(false);
    }, 3000);
    return () => clearTimeout(safetyTimer);
  }, [manualLoading, isInitialMount]);

  const shouldShow = (isInitialMount && isLoadingDb) || manualLoading;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="page-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--bg-screen)]/90 backdrop-blur-md select-none pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-6"
          >
            <CraftLoader
              size="lg"
              text={loadingText || (isInitialMount ? "Loading Craft Studio..." : "Loading page...")}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
