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

  // Listen to explicit custom events only (e.g. saving large project, auth operations)
  useEffect(() => {
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

    window.addEventListener("craft:start-page-loading", handleStartLoading);
    window.addEventListener("craft:stop-page-loading", handleStopLoading);

    return () => {
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
