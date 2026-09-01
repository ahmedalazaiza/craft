"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface TemplateProps {
  children: React.ReactNode;
}

/**
 * Root Page Transition Template
 *
 * Provides a silky-smooth opacity fade transition between routes without
 * introducing CSS `transform` or `will-change: transform` properties that
 * interfere with `position: fixed` modal overlays and popups.
 */
export default function Template({ children }: TemplateProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (shouldReduceMotion) {
    return <div className="w-full flex-1 flex flex-col">{children}</div>;
  }

  return (
    <motion.div
      initial={hasMounted ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
