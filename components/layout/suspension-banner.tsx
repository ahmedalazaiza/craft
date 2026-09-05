"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { ShieldAlert, Mail } from "lucide-react";
import Link from "next/link";

export function SuspensionBanner() {
  const { user } = useSession();

  if (!user || !user.isSuspended) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative z-40 bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-200 px-4 py-2.5 text-xs sm:text-sm font-medium shadow-xs"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong className="font-bold">Account Notice:</strong> Your creator studio has been suspended by Layerat moderation. Publishing, commenting, and editing public showcases are disabled.
          </span>
        </div>
        <Link
          href="mailto:support@layerat.com?subject=Account%20Suspension%20Inquiry"
          className="inline-flex items-center gap-1.5 underline hover:text-amber-800 dark:hover:text-amber-100 font-semibold shrink-0 text-xs"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Contact Support</span>
        </Link>
      </div>
    </div>
  );
}
