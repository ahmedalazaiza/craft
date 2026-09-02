"use client";

import React from "react";
import { CreatorCardSkeleton } from "./creator-card-skeleton";
import { cn } from "@/lib/utils";

interface CreatorGridSkeletonProps {
  count?: number;
  className?: string;
}

export function CreatorGridSkeleton({
  count = 6,
  className,
}: CreatorGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8",
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <CreatorCardSkeleton key={idx} />
      ))}
    </div>
  );
}
