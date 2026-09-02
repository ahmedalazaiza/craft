"use client";

import React from "react";
import { motion } from "framer-motion";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface CraftLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function CraftLoader({
  size = "md",
  text,
  className,
}: CraftLoaderProps) {
  const sizeMap = {
    sm: { box: "w-8 h-8", dot: "w-1.5 h-1.5", text: "text-xs" },
    md: { box: "w-12 h-12", dot: "w-2.5 h-2.5", text: "text-sm" },
    lg: { box: "w-16 h-16", dot: "w-3.5 h-3.5", text: "text-base" },
  };

  const current = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3.5", className)}>
      <div className={cn("relative flex items-center justify-center", current.box)}>
        {/* Ambient Outer Glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-2xl bg-[var(--content-primary)]/10 blur-md"
        />

        {/* Outer Rotating/Pulsing Geometric Frame */}
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["24%", "50%", "24%"],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/80 backdrop-blur-xs shadow-xs"
        />

        {/* Inner Counter-Rotating Diamond / Square */}
        <motion.div
          animate={{
            rotate: [0, -90, -180, -270, -360],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-1/2 h-1/2 rounded-md border border-[var(--content-primary)]/60 bg-[var(--bg-elevated)]"
        />

        {/* Core Glowing Orb */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn("rounded-full bg-[var(--content-primary)]", current.dot)}
        />
      </div>

      {text && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5"
        >
          <span
            className={cn(
              bricolage.className,
              "font-medium text-[var(--content-secondary)] tracking-tight",
              current.text
            )}
          >
            {text}
          </span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="inline-block h-1 w-1 rounded-full bg-[var(--content-tertiary)]"
              />
            ))}
          </span>
        </motion.div>
      )}
    </div>
  );
}
