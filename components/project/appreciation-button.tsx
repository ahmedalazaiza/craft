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
  variant?: "full" | "card";
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

    const success = toggleAppreciation(projectId);
    if (!success) {
      router.push("/login");
    }
  };

  if (variant === "card") {
    // Compact solid chip on project card top-right
    return (
      <button
        type="button"
        onClick={handleClick}
        title={appreciated ? "Remove appreciation" : "Appreciate this project"}
        style={
          appreciated
            ? { backgroundColor: "#962EE6", color: "#FFFFFF" }
            : undefined
        }
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold select-none transition-all duration-150 cursor-pointer shadow-xs border-none",
          appreciated
            ? "bg-[#962EE6] text-white shadow-sm"
            : "bg-[var(--chip-bg)] text-[var(--chip-fg)] hover:bg-[var(--chip-bg-hover)]",
          className
        )}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            appreciated ? "fill-white text-white scale-110" : "fill-none text-[var(--chip-fg)]"
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
