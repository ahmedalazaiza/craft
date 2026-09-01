"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * Root Page Transition Template
 *
 * Next.js App Router re-mounts `template.tsx` on every route navigation,
 * providing a frictionless 60/120fps motion transition between all platform pages.
 * Initial SSR render paints with full opacity immediately (0ms LCP penalty).
 */
export default function Template({ children }: TemplateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const transitionConfig = {
    duration: shouldReduceMotion ? 0.15 : 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  if (shouldReduceMotion) {
    return <div className="w-full flex-1 flex flex-col">{children}</div>;
  }

  return (
    <motion.div
      initial={hasMounted ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={transitionConfig}
      className="w-full flex-1 flex flex-col will-change-[transform,opacity]"
    >
      {children}
    </motion.div>
  );
}
