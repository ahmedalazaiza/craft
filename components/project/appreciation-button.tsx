"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppreciationButtonProps {
  projectId: string;
  count: number;
  variant?: "full" | "card" | "icon";
  className?: string;
}

export function AppreciationButton({
  projectId,
  count,
  variant = "full",
  className,
}: AppreciationButtonProps) {
  const router = useRouter();
  const { isProjectAppreciated, toggleAppreciation } = useSession();
  const appreciated = isProjectAppreciated(projectId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAppreciation(projectId);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={appreciated ? "Remove appreciation" : "Appreciate this project"}
        aria-label={appreciated ? `Remove appreciation (${count})` : `Appreciate this project (${count})`}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white hover:bg-white backdrop-blur-md transition-all duration-150 cursor-pointer shadow-md hover:scale-110 active:scale-95",
          appreciated && "text-[var(--brand-secondary)]",
          className
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-transform duration-150",
            appreciated ? "fill-[var(--brand-secondary)] text-[var(--brand-secondary)] scale-110" : "fill-none text-current"
          )}
        />
      </button>
    );
  }

  if (variant === "card") {
    // Compact solid chip on project card top-right
    return (
      <button
        type="button"
        onClick={handleClick}
        title={appreciated ? "Remove appreciation" : "Appreciate this project"}
        aria-label={appreciated ? `Remove appreciation (${count})` : `Appreciate this project (${count})`}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold select-none transition-all duration-150 cursor-pointer shadow-xs border-none",
          appreciated
            ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-sm scale-105"
            : "bg-[var(--chip-bg)]/80 text-[var(--chip-fg)] hover:bg-[var(--chip-bg)]",
          className
        )}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            appreciated ? "fill-current text-[var(--chip-fg)] scale-110" : "fill-none text-[var(--chip-fg)]"
          )}
        />
        <span className="font-bold">
          {count}
        </span>
      </button>
    );
  }

  // Full button on project page (uses real Button variant="accent" on CTA tokens or "secondary")
  return (
    <Button
      variant={appreciated ? "accent" : "secondary"}
      size="default"
      onClick={handleClick}
      className={cn(
        "gap-2 px-6 transition-all duration-200 select-none shadow-sm",
        appreciated && "scale-[1.02]",
        className
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          appreciated
            ? "fill-[var(--btn-cta-fg)] text-[var(--btn-cta-fg)] scale-110"
            : "text-[var(--content-primary)]"
        )}
      />
      <span>
        {appreciated ? "Appreciated" : "Appreciate"} ({count})
      </span>
    </Button>
  );
}
