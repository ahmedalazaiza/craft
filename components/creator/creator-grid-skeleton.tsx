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
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <CreatorCardSkeleton key={idx} />
      ))}
    </div>
  );
}
