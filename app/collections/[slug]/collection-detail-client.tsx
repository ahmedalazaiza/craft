"use client";

import React from "react";
import Image from "next/image";
import { Collection, Project } from "@/lib/types";
import { ProjectCard } from "@/components/project/project-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Layers, Sparkles } from "lucide-react";

interface CollectionDetailClientProps {
  collection: Collection;
  projects: Project[];
}

export function CollectionDetailClient({
  collection,
  projects,
}: CollectionDetailClientProps) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-[80px] py-6 sm:py-10 pb-28 sm:pb-32">
      <FadeIn>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", href: "/collections" },
            { label: collection.title, isCurrent: true },
          ]}
        />

        {/* Hero Header */}
        <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)] mb-10 sm:mb-14 shadow-lg">
          {/* Background Image Banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <Image
              src={collection.coverImage}
              alt={collection.title}
              fill
              priority
              className="object-cover"
            />
            {/* Dark Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 backdrop-blur-[2px]" />

            {/* Inner Content */}
            <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-end text-white max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-bold text-white w-fit mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Editorial Monograph</span>
                <span className="opacity-40">•</span>
                <span>{projects.length} Works</span>
              </div>

              <h1
                className={cn(
                  bricolage.className,
                  "text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3"
                )}
              >
                {collection.title}
              </h1>

              {collection.description && (
                <p className="text-xs sm:text-sm md:text-base text-white/80 leading-relaxed max-w-2xl">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 text-center my-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-secondary)]">
              <Layers className="h-7 w-7" />
            </div>
            <h2 className={cn(bricolage.className, "text-xl font-bold text-[var(--content-primary)] mb-2")}>
              No Projects Assigned to this Collection Yet
            </h2>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-sm mx-auto">
              Curators are assembling the monographs for this series. Check back soon.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm sm:text-base font-bold text-[var(--content-primary)]">
                Selected Monographs ({projects.length})
              </h2>
              <span className="text-xs text-[var(--content-tertiary)]">
                Curated by Layerat Editorial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {projects.map((project, index) => (
                <StaggerGridItem key={project.id} index={index}>
                  <ProjectCard project={project} priority={index < 3} />
                </StaggerGridItem>
              ))}
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
