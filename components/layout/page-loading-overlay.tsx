"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CraftLoader } from "@/components/ui/craft-loader";

export function PageLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);

  // When route changes, dismiss loader smoothly
  useEffect(() => {
    setIsLoading(false);
    setLoadingText(undefined);
  }, [pathname, searchParams]);

  // Listen to navigation clicks and explicit custom events
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Don't intercept modified clicks (Cmd/Ctrl + click for new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

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
          // Determine contextual loading text based on target route
          let text = "Loading...";
          if (href.startsWith("/project/")) text = "Loading case study...";
          else if (href.startsWith("/u/")) text = "Opening creator studio...";
          else if (href.startsWith("/explore")) text = "Loading gallery...";
          else if (href.startsWith("/creators")) text = "Loading creators directory...";
          else if (href.startsWith("/me/projects/new")) text = "Opening project studio...";
          else if (href.startsWith("/settings")) text = "Loading account settings...";
          
          setLoadingText(text);
          setIsLoading(true);
        }
      }
    };

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

    document.addEventListener("click", handleAnchorClick, { capture: true });
    window.addEventListener("craft:start-page-loading", handleStartLoading);
    window.addEventListener("craft:stop-page-loading", handleStopLoading);

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      window.removeEventListener("craft:start-page-loading", handleStartLoading);
      window.removeEventListener("craft:stop-page-loading", handleStopLoading);
    };
  }, []);

  // Safety auto-dismiss timeout (max 3.5 seconds)
  useEffect(() => {
    if (!isLoading) return;
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setLoadingText(undefined);
    }, 3500);
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
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--bg-screen)]/85 backdrop-blur-md select-none pointer-events-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-6"
          >
            <CraftLoader
              size="lg"
              text={loadingText || "Loading..."}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
