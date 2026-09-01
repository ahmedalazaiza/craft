"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Standard luxury easing curve (Apple / Linear standard - snappy, restrained)
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const;

export interface FadeInProps {
  delay?: number;
  duration?: number;
  yOffset?: number;
  children: React.ReactNode;
  className?: string;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.35,
  yOffset = 10,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn("w-full", className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: MOTION_EASE,
      }}
      className={cn("w-full will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.div>
  );
}

export interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  id?: string;
}

export function ScrollRevealSection({
  children,
  className,
  delay = 0,
  yOffset = 14,
  id,
}: ScrollRevealSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay,
        ease: MOTION_EASE,
      }}
      className={cn("will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.section>
  );
}

export interface ScrollRevealDivProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

export function ScrollRevealDiv({
  children,
  className,
  delay = 0,
  yOffset = 12,
}: ScrollRevealDivProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay,
        ease: MOTION_EASE,
      }}
      className={cn("will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerGridItemProps {
  index?: number;
  children: React.ReactNode;
  className?: string;
}

export function StaggerGridItem({
  children,
  className,
  index = 0,
}: StaggerGridItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const staggeredDelay = Math.min((index % 8) * 0.025, 0.18);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.24,
        delay: staggeredDelay,
        ease: MOTION_EASE,
      }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}

export interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function MotionCardWrapper({
  children,
  className,
}: MotionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("h-full will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}

export function GalleryItemReveal({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const delay = Math.min((index % 6) * 0.05, 0.25);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{
        duration: 0.35,
        delay,
        ease: MOTION_EASE,
      }}
      className={cn("will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{
        duration: shouldReduceMotion ? 0.15 : 0.28,
        ease: MOTION_EASE,
      }}
      className={cn("w-full flex-1 will-change-[transform,opacity]", className)}
    >
      {children}
    </motion.div>
  );
}
