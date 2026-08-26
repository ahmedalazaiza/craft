"use client";

import React from "react";
import { Project } from "@/lib/mock";
import { ProjectCard } from "./project-card";
import { StaggerGridItem } from "@/components/ui/motion-wrapper";
import { cn } from "@/lib/utils";

interface ProjectGridProps {
  projects: Project[];
  className?: string;
  emptyMessage?: string;
}

export function ProjectGrid({
  projects,
  className,
  emptyMessage = "No projects found.",
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/40 p-8 text-center">
        <p className="type-body-large text-[var(--content-secondary)]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {projects.map((project, idx) => (
        <StaggerGridItem key={project.id} index={idx}>
          <ProjectCard project={project} />
        </StaggerGridItem>
      ))}
    </div>
  );
}
