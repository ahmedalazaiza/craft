"use client";

import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Standard easing curve (restrained, no bounce)
export const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

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
  duration = 0.3,
  yOffset = 10,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: MOTION_EASE }}
      className={cn("w-full", className)}
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
}

export function ScrollRevealSection({
  children,
  className,
  delay = 0,
  yOffset = 16,
}: ScrollRevealSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: MOTION_EASE }}
      className={className}
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
  yOffset = 16,
}: ScrollRevealDivProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: MOTION_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerGridItemProps {
  index: number;
  children: React.ReactNode;
  className?: string;
}

export function StaggerGridItem({
  index,
  children,
  className,
}: StaggerGridItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const cappedIndex = Math.min(index, 6);
  const delay = cappedIndex * 0.03; // Fast 30ms stagger

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: MOTION_EASE }}
      className={className}
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
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}

export function HeroFeaturedParallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 24]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, scale: 0.98, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: MOTION_EASE }}
      className={className}
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

  const delay = Math.min(index * 0.08, 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: MOTION_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
