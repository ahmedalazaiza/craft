"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline ? (
        /* OFFLINE FLOATING ALERT */
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-[var(--chip-bg)]/95 border border-[var(--sentiment-warning)]/40 px-4 py-2.5 text-xs text-[var(--chip-fg)] shadow-2xl dark:shadow-none backdrop-blur-md"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sentiment-warning)]/20 text-[var(--sentiment-warning)]">
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="font-medium text-[var(--chip-fg)]">
            You are offline. Showing cached preview.
          </span>
        </motion.div>
      ) : showRestored ? (
        /* CONNECTION RESTORED TOAST */
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-[var(--chip-bg)]/95 border border-[var(--border-neutral)] px-4 py-2.5 text-xs text-[var(--chip-fg)] shadow-2xl backdrop-blur-md"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--chip-fg)] text-[var(--chip-bg)]">
            <Wifi className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-[var(--chip-fg)]">
            Back online! Syncing live directory...
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
