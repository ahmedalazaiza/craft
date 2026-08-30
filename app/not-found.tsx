"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bricolage } from "@/lib/fonts";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md mx-auto space-y-4">
        {/* Subtle Tag */}
        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          404 Error
        </span>

        {/* Minimalist Heading */}
        <h1
          className={cn(
            bricolage.className,
            "text-4xl sm:text-6xl font-black text-neutral-950 dark:text-white tracking-tight"
          )}
        >
          Page not found
        </h1>

        {/* Clean Subtitle */}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
          The page or creator profile you are looking for doesn&apos;t exist, was moved, or has been removed.
        </p>

        {/* Clean Pill Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-5 text-xs sm:text-sm font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go back</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-6 text-xs sm:text-sm font-bold bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors shadow-xs"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Back to home</span>
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 rounded-full h-10 px-5 text-xs sm:text-sm font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <span>Explore projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
