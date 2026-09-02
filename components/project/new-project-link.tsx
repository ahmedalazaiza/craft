"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { Plus } from "lucide-react";
import { buttonVariants, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewProjectLinkProps {
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  children?: React.ReactNode;
  showIcon?: boolean;
  iconClassName?: string;
}

/**
 * Universal NewProjectLink:
 * On mobile view (<768px), intercepts clicks and opens the desktop-publishing MobileBlockSheet.
 * On desktop/tablet, navigates directly to /me/projects/new.
 */
export function NewProjectLink({
  className,
  variant = "accent",
  size = "sm",
  children,
  showIcon = true,
  iconClassName = "h-4 w-4",
}: NewProjectLinkProps) {
  const { openMobilePublishBlock } = useSession();

  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      e.preventDefault();
      openMobilePublishBlock();
    }
  };

  return (
    <Link
      href="/me/projects/new"
      prefetch={true}
      onClick={handleClick}
      className={buttonVariants({
        variant,
        size,
        className: cn("inline-flex items-center gap-1.5 font-bold shadow-xs", className),
      })}
    >
      {showIcon && <Plus className={iconClassName} />}
      <span>{children || "New Project"}</span>
    </Link>
  );
}
