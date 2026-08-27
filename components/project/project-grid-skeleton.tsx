"use client";

import React from "react";
import { ProjectCardSkeleton } from "./project-card-skeleton";
import { cn } from "@/lib/utils";

interface ProjectGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProjectGridSkeleton({
  count = 8,
  columns = 4,
  className,
}: ProjectGridSkeletonProps) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        columnClasses[columns] || columnClasses[4],
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProjectCardSkeleton key={idx} />
      ))}
    </div>
  );
}
