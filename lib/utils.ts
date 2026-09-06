import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function formatDisplayUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}

export interface FormattedPublishedDate {
  display: string;
  tooltip?: string;
  isRecent: boolean;
}

/**
 * Formats a project's published date according to the hybrid smart pattern:
 * - Within 7 days: Relative time ("Published Just now", "Published 25m ago", "Published 3h ago", "Published 2d ago")
 * - 7 days or older: Calendar date ("Published Sep 1, 2026")
 * - Includes a full date/time string for tooltips on hover
 */
export function formatProjectPublishedDate(
  publishedAt?: string | null,
  options?: { now?: number }
): FormattedPublishedDate {
  if (!publishedAt) {
    return { display: "Recently Published", isRecent: true };
  }

  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) {
    return { display: "Recently Published", isRecent: true };
  }

  const nowTime = options?.now ?? Date.now();
  const diffInSeconds = Math.floor((nowTime - date.getTime()) / 1000);

  // Full tooltip format: e.g. "Sep 5, 2026, 11:38 PM"
  const tooltip = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Future or clock skew or within the last 60 seconds
  if (diffInSeconds < 60) {
    return { display: "Published Just now", tooltip, isRecent: true };
  }

  // Under 60 minutes
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return { display: `Published ${diffInMinutes}m ago`, tooltip, isRecent: true };
  }

  // Under 24 hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return { display: `Published ${diffInHours}h ago`, tooltip, isRecent: true };
  }

  // Under 7 days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return { display: `Published ${diffInDays}d ago`, tooltip, isRecent: true };
  }

  // 7 days or older: Formatted calendar date
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return {
    display: `Published ${formattedDate}`,
    tooltip,
    isRecent: false,
  };
}
