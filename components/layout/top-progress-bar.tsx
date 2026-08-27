"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger brief top bar animation when route changes
  useEffect(() => {
    setIsNavigating(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(75), 100);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 250);
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, searchParams]);

  // Intercept click on internal links to start progress bar instantly
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
        // If clicking a link to a different path/query, start progress immediately
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setIsNavigating(true);
          setProgress(25);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] bg-transparent">
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{
              width: `${progress}%`,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: progress === 100 ? 0.2 : 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="h-full bg-gradient-to-r from-[#8DFF00] via-[#A8FF33] to-[#8DFF00] shadow-[0_0_12px_rgba(141,255,0,0.8)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
