"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "full" | "icon" | "wordmark" | "image-full";
  size?: "sm" | "default" | "lg" | "xl";
  className?: string;
  linkHref?: string;
  priority?: boolean;
}

export function Logo({
  variant = "full",
  size = "default",
  className,
  linkHref,
  priority = false,
}: LogoProps) {
  // Sizing configurations (refined for optical balance and crisp detail)
  const iconSizes = {
    sm: { width: 28, height: 28, imgClass: "h-7 w-7" },
    default: { width: 38, height: 38, imgClass: "h-[38px] w-[38px]" },
    lg: { width: 48, height: 48, imgClass: "h-12 w-12" },
    xl: { width: 58, height: 58, imgClass: "h-[58px] w-[58px]" },
    "2xl": { width: 72, height: 72, imgClass: "h-[72px] w-[72px]" },
  };

  const textSizes = {
    sm: "text-lg tracking-[-0.03em]",
    default: "text-[23px] tracking-[-0.03em]",
    lg: "text-2xl tracking-[-0.03em]",
    xl: "text-3xl tracking-[-0.03em]",
    "2xl": "text-4xl tracking-[-0.03em]",
  };

  const imageFullHeights = {
    sm: "h-6 w-auto",
    default: "h-8.5 w-auto",
    lg: "h-11 w-auto",
    xl: "h-14 w-auto",
    "2xl": "h-18 w-auto",
  };

  const currentIcon = iconSizes[size];
  const currentText = textSizes[size];

  // Inner content based on variant
  const renderContent = () => {
    if (variant === "image-full") {
      return (
        <div className={cn("relative flex items-center shrink-0", className)}>
          <Image
            src="/logo-full.png"
            alt="Layerat Logo"
            width={1024}
            height={252}
            priority={priority}
            className={cn(
              imageFullHeights[size],
              "object-contain dark:invert dark:brightness-150 transition-all select-none"
            )}
          />
        </div>
      );
    }

    if (variant === "icon") {
      return (
        <div className={cn("relative flex items-center justify-center shrink-0", currentIcon.imgClass, className)}>
          <Image
            src="/logo-icon.png"
            alt="Layerat Mark"
            width={currentIcon.width}
            height={currentIcon.height}
            priority={priority}
            className="object-contain h-full w-full select-none transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      );
    }

    if (variant === "wordmark") {
      return (
        <span
          className={cn(
            bricolage.className,
            "font-black text-[var(--content-primary)] select-none",
            currentText,
            className
          )}
        >
          Layerat<span className="text-[#7110DE] font-black">.</span>
        </span>
      );
    }

    // Default: "full" (Icon + Razor-sharp adaptive typography)
    return (
      <div className={cn("inline-flex items-center gap-1.5 select-none group", className)}>
        <div className={cn("relative flex items-center justify-center shrink-0", currentIcon.imgClass)}>
          <Image
            src="/logo-icon.png"
            alt="Layerat Mark"
            width={currentIcon.width}
            height={currentIcon.height}
            priority={priority}
            className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span
          className={cn(
            bricolage.className,
            "font-black text-[var(--content-primary)] transition-colors",
            currentText
          )}
        >
          Layerat<span className="text-[#7110DE] font-black">.</span>
        </span>
      </div>
    );
  };

  if (linkHref !== undefined) {
    return (
      <Link
        href={linkHref}
        prefetch={true}
        className="inline-flex items-center hover:opacity-90 transition-opacity"
        aria-label="Layerat Home"
      >
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
}
