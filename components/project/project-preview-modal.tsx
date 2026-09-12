"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Monitor, Tag, Sparkles, Send, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { getValidAvatarUrl } from "@/lib/avatar";
import { Creator } from "@/lib/types";
import { FormattedCaseStudy } from "@/components/project/formatted-case-study";

interface CaseStudySection {
  title?: string;
  content: string;
}

interface ProjectPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
  galleryImages: string[];
  coverImage?: string;
  categories: string[];
  tags: string[];
  tools: string[];
  creator?: Creator | null;
  onPublish?: () => void;
  isPublishing?: boolean;
}

export function ProjectPreviewModal({
  isOpen,
  onClose,
  title,
  body,
  galleryImages,
  coverImage,
  categories,
  tags,
  tools,
  creator,
  onPublish,
  isPublishing = false,
}: ProjectPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-screen)]">
        {/* Top Control Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-[var(--border-neutral)] bg-[var(--bg-elevated)]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Preview Mode</span>
            </span>
            <span className="hidden sm:inline text-xs text-[var(--content-secondary)]">
              This is how your case study appears to viewers.
            </span>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1.5 bg-[var(--bg-neutral)] p-1 rounded-xl border border-[var(--border-neutral)]">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "desktop"
                  ? "bg-[var(--bg-elevated)] text-[var(--content-primary)] shadow-xs"
                  : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
              )}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "mobile"
                  ? "bg-[var(--bg-elevated)] text-[var(--content-primary)] shadow-xs"
                  : "text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
              )}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Actions: Publish or Close */}
          <div className="flex items-center gap-2.5">
            {onPublish && (
              <Button
                type="button"
                variant="accent"
                size="sm"
                disabled={isPublishing}
                onClick={onPublish}
                className="font-bold text-xs gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isPublishing ? "Publishing..." : "Looks Good, Publish Live"}</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Scroll Container */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-neutral)]/40 py-6 sm:py-10 px-2 sm:px-4">
          <div
            className={cn(
              "mx-auto transition-all duration-300 bg-[var(--bg-screen)] border border-[var(--border-neutral)] shadow-2xl rounded-3xl overflow-hidden",
              viewMode === "desktop" ? "max-w-[1240px]" : "max-w-[420px]"
            )}
          >
            <article className="p-4 sm:p-8 lg:p-12 space-y-8">
              {/* Header */}
              <header className="space-y-4 pb-6 border-b border-[var(--border-neutral)]">
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[var(--btn-cta-bg)] text-[var(--btn-cta-fg)] px-3 py-1 text-xs font-bold shadow-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <h1
                  className={cn(
                    bricolage.className,
                    "text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--content-primary)] tracking-tight leading-[1.1]"
                  )}
                >
                  {title || "Untitled Project"}
                </h1>

                {creator && (
                  <div className="flex items-center gap-3 text-xs text-[var(--content-secondary)] pt-2">
                    <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)]">
                      <Image
                        src={getValidAvatarUrl(creator.avatarUrl)}
                        alt={creator.displayName}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-[var(--content-primary)]">
                      <span>{creator.displayName}</span>
                      {creator.isVerified !== false && (
                        <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />
                      )}
                    </div>
                    <span>•</span>
                    <span>{creator.city || creator.location || "Global"}</span>
                    <span>•</span>
                    <span className="font-mono text-[var(--content-tertiary)]">Just now</span>
                  </div>
                )}
              </header>

              {/* Continuous Spreads Stack */}
              <div className="flex flex-col gap-0 w-full rounded-2xl overflow-hidden border border-[var(--border-neutral)]/60 bg-[var(--bg-neutral)] shadow-xs">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative w-full overflow-hidden bg-[var(--bg-neutral)]">
                    <img
                      src={img}
                      alt={`Spread ${idx + 1}`}
                      className="w-full h-auto block"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>

              {/* Case Study Body / Narrative */}
              {body && (
                <div className="rounded-3xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-10 shadow-xs space-y-4">
                  <h2 className="type-title-section text-[var(--content-primary)] font-black text-xl">
                    About this Project
                  </h2>
                  <FormattedCaseStudy content={body} />
                </div>
              )}

              {/* Tags and Tools */}
              {(tags.length > 0 || tools.length > 0) && (
                <div className="rounded-3xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 space-y-6 shadow-xs">
                  {tools.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block">
                        Tools Used
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tools.map((tool) => (
                          <span
                            key={tool}
                            className="rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-semibold text-[var(--content-secondary)]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block">
                        Tags & Keywords
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-semibold text-[var(--content-secondary)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
