"use client";

import React, { useEffect } from "react";
import { bricolage } from "@/lib/fonts";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Layerat Platform Runtime Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 shadow-sm">
          <AlertTriangle className="h-10 w-10" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-4">
        <span>Application Error</span>
      </div>

      <h1
        className={cn(
          bricolage.className,
          "text-3xl sm:text-4xl font-black text-[var(--primary-forest-green)] tracking-tight"
        )}
      >
        Something unexpected occurred
      </h1>

      <p className="mt-3 max-w-md text-sm text-[var(--content-secondary)] leading-relaxed">
        An error occurred while loading this view. You can try refreshing the view or navigating back to the homepage.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => reset()}
          variant="accent"
          className="font-bold gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </Button>

        <Link
          href="/"
          className={buttonVariants({
            variant: "secondary",
            className: "font-semibold gap-2",
          })}
        >
          <Home className="h-4 w-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}
