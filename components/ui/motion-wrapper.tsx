"use client";

import React from "react";
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
}: FadeInProps) {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
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
}: ScrollRevealSectionProps) {
  return (
    <section className={className}>
      {children}
    </section>
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
}: ScrollRevealDivProps) {
  return (
    <div className={className}>
      {children}
    </div>
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
}: StaggerGridItemProps) {
  return (
    <div className={className}>
      {children}
    </div>
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
    <div className={cn("h-full transition-transform duration-200 hover:-translate-y-1", className)}>
      {children}
    </div>
  );
}

export function HeroFeaturedParallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function GalleryItemReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
