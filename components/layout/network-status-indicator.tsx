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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-[#0E120E]/90 border border-amber-500/40 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-md"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          </div>
          <span className="font-medium text-white/90">
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-[#0E120E]/90 border border-[#8DFF00]/40 px-4 py-2.5 text-xs text-white shadow-2xl backdrop-blur-md"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#8DFF00]/20 text-[#8DFF00]">
            <Wifi className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-white/90">
            Back online! Syncing live directory...
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
