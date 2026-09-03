"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Collection } from "@/lib/types";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ArrowRight, Layers, Sparkles } from "lucide-react";

interface CollectionsClientProps {
  initialCollections: Collection[];
}

export function CollectionsClient({ initialCollections }: CollectionsClientProps) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-[80px] py-6 sm:py-10 pb-28 sm:pb-32">
      <FadeIn>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Collections", isCurrent: true },
          ]}
        />

        {/* Header Hero */}
        <header className="mb-10 sm:mb-14 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-3.5 py-1 text-xs font-bold text-[var(--content-primary)] shadow-2xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>Editorial Showcases</span>
          </div>

          <h1
            className={cn(
              bricolage.className,
              "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--content-primary)]"
            )}
          >
            Curated Collections
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[var(--content-secondary)] leading-relaxed">
            Thematic monographs, design systems, and visual movements handpicked by the Layerat curatorial board.
          </p>
        </header>

        {/* Collections Grid */}
        {initialCollections.length === 0 ? (
          <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 text-center my-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-secondary)]">
              <Layers className="h-7 w-7" />
            </div>
            <h2 className={cn(bricolage.className, "text-xl font-bold text-[var(--content-primary)] mb-2")}>
              No Collections Assembled Yet
            </h2>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-sm mx-auto">
              The editorial board is currently curating the first set of thematic design collections. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {initialCollections.map((collection, index) => (
              <StaggerGridItem key={collection.id} index={index}>
                <Link
                  href={`/collections/${collection.slug}`}
                  prefetch={true}
                  className="group relative flex flex-col rounded-[24px] sm:rounded-[28px] overflow-hidden border border-[var(--border-neutral)] bg-[var(--bg-elevated)] hover:border-[var(--content-primary)]/40 transition-all duration-300 hover:shadow-xl"
                >
                  {/* Cover Canvas */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--bg-neutral)]">
                    <Image
                      src={collection.coverImage}
                      alt={collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={index < 2}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                        <Layers className="h-3 w-3" />
                        <span>{collection.projectsCount || collection.projectIds.length} Projects</span>
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-10">
                      <h2
                        className={cn(
                          bricolage.className,
                          "text-xl sm:text-2xl font-bold text-white drop-shadow-md group-hover:text-amber-200 transition-colors"
                        )}
                      >
                        {collection.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                    <p className="text-xs sm:text-sm text-[var(--content-secondary)] line-clamp-2 leading-relaxed">
                      {collection.description || "A cohesive curation of projects showcasing visual excellence and craft."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-neutral)]/60 text-xs font-bold text-[var(--content-primary)]">
                      <span className="text-[var(--content-tertiary)]">Curated Monograph</span>
                      <span className="inline-flex items-center gap-1 text-[var(--content-primary)] group-hover:translate-x-1 transition-transform">
                        Explore Collection
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerGridItem>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
