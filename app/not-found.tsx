"use client";

import React from "react";
import Link from "next/link";
import { bricolage } from "@/lib/fonts";
import { buttonVariants } from "@/components/ui/button";
import { Compass, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shadow-sm">
          <Compass className="h-10 w-10 text-[var(--primary-forest-green)] animate-spin-slow" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3.5 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-4">
        <span>404 Error</span>
        <span>•</span>
        <span>Artifact Not Found</span>
      </div>

      <h1
        className={cn(
          bricolage.className,
          "text-4xl sm:text-5xl font-black text-[var(--primary-forest-green)] tracking-tight"
        )}
      >
        Monograph or Studio Not Found
      </h1>

      <p className="mt-3 max-w-md text-sm text-[var(--content-secondary)] leading-relaxed">
        The project, creator, or path you are looking for may have been archived, renamed, or does not exist.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className={buttonVariants({
            variant: "accent",
            className: "font-bold gap-2",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          href="/explore"
          className={buttonVariants({
            variant: "secondary",
            className: "font-semibold gap-2",
          })}
        >
          <span>Explore All Works</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
