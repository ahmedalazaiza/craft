"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  showHomeIcon = true,
}: BreadcrumbsProps) {
  // Always ensure Home is the root item if not explicitly provided
  const allItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...items,
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs font-medium text-[var(--content-tertiary)] mb-6 select-none", className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              {/* Separator between items */}
              {!isFirst && (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--border-neutral)] text-[var(--content-tertiary)]/60 shrink-0" aria-hidden="true" />
              )}

              {/* Item link or current text */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-[var(--content-primary)] transition-colors py-0.5 rounded-sm hover:underline underline-offset-2"
                >
                  {isFirst && showHomeIcon && (
                    <Home className="h-3.5 w-3.5 shrink-0 mb-0.5" />
                  )}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate max-w-[200px] sm:max-w-xs md:max-w-md",
                    isLast
                      ? "font-bold text-[var(--content-primary)]"
                      : "text-[var(--content-secondary)]"
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
