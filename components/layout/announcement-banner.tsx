"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { ArrowRight, Sparkles, X } from "lucide-react";

export function AnnouncementBanner() {
  const { platformSettings } = useSession();
  const [isDismissed, setIsDismissed] = useState(true);

  // Check if banner was dismissed in this session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("craft_announcement_dismissed");
      // If the announcement text changed, re-show even if previously dismissed
      const lastDismissedText = sessionStorage.getItem("craft_announcement_text");
      if (!dismissed || lastDismissedText !== platformSettings.announcementBannerText) {
        setIsDismissed(false);
      }
    }
  }, [platformSettings.announcementBannerText]);

  if (
    isDismissed ||
    !platformSettings.announcementBannerActive ||
    !platformSettings.announcementBannerText.trim()
  ) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("craft_announcement_dismissed", "true");
      sessionStorage.setItem("craft_announcement_text", platformSettings.announcementBannerText);
    }
  };

  const hasLink = Boolean(platformSettings.announcementBannerLink?.trim());

  return (
    <aside
      aria-label="Platform Announcement"
      className="relative z-50 w-full bg-[var(--content-primary)] text-[var(--bg-screen)] border-b border-[var(--border-neutral)]/20 transition-all duration-300"
    >
      <div className="mx-auto flex min-h-[40px] max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
        <div className="flex flex-1 items-center justify-center gap-2 text-center">
          <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80 animate-pulse text-amber-300" />
          
          <span className="font-medium tracking-wide">
            {platformSettings.announcementBannerText}
          </span>

          {hasLink && (
            <Link
              href={platformSettings.announcementBannerLink!}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-4 hover:opacity-80 transition-opacity ml-1.5"
            >
              Learn more
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-full p-1 text-[var(--bg-screen)]/70 hover:text-[var(--bg-screen)] hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
