"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * Root Page Transition Template
 *
 * Next.js App Router re-mounts `template.tsx` on every route navigation,
 * providing a frictionless 60/120fps motion transition between all platform pages.
 */
export default function Template({ children }: TemplateProps) {
  const shouldReduceMotion = useReducedMotion();

  // Snappy, luxury ease curve (Apple / Linear standard)
  const transitionConfig = {
    duration: shouldReduceMotion ? 0.15 : 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, y: 0 }}
      exit={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -6 }
      }
      transition={transitionConfig}
      className="w-full flex-1 flex flex-col will-change-[transform,opacity]"
    >
      {children}
    </motion.div>
  );
}
