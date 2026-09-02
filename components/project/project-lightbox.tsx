"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LightboxProps {
  isOpen: boolean;
  images: { url: string; alt: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ProjectLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = images.length;
  // Ensure valid safe index
  const safeIndex = Math.max(0, Math.min(currentIndex, total - 1));
  const currentImage = images[safeIndex];

  // Reset zoom & loading indicator when navigating between images or opening
  useEffect(() => {
    setIsZoomed(false);
    setIsLoadingImage(true);
  }, [safeIndex, isOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage?.url) return;
    navigator.clipboard.writeText(currentImage.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onNavigate((safeIndex - 1 + total) % total);
  }, [safeIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onNavigate((safeIndex + 1) % total);
  }, [safeIndex, total, onNavigate]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || isZoomed) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  if (!mounted || !isOpen || !currentImage) return null;

  const lightboxContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md select-none"
          onClick={onClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* TOP ACTION BAR */}
          <div
            className="w-full flex items-center justify-between px-4 sm:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white tracking-wide">
                {safeIndex + 1} / {total}
              </span>
              <span className="text-white/80 text-xs sm:text-sm font-medium hidden sm:inline truncate max-w-sm md:max-w-lg">
                {currentImage.alt}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom In/Out Toggle */}
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-full p-2.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                title={isZoomed ? "Fit to screen (Zoom Out)" : "100% View (Zoom In)"}
                aria-label="Toggle image zoom"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Fit</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Zoom</span>
                  </>
                )}
              </button>

              {/* Copy Direct Image Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-full p-2.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                title="Copy direct image link"
                aria-label="Copy image link"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy link</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2.5 bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer ml-1"
                title="Close (Esc)"
                aria-label="Close image viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* MAIN IMAGE DISPLAY AREA */}
          <div
            className={cn(
              "relative flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-hidden",
              isZoomed ? "overflow-auto cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed((prev) => !prev);
            }}
          >
            <motion.div
              key={currentImage.url}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "relative flex items-center justify-center transition-transform duration-300",
                isZoomed ? "max-w-none max-h-none py-10" : "max-h-[78vh] max-w-[90vw]"
              )}
            >
              {/* Sleek Loading Indicator */}
              {isLoadingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl">
                    <Loader2 className="h-7 w-7 animate-spin text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 tracking-wide">
                    Loading high-res spread...
                  </span>
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                onLoad={() => setIsLoadingImage(false)}
                onError={() => setIsLoadingImage(false)}
                className={cn(
                  "rounded-[14px] shadow-2xl object-contain transition-all select-none",
                  isLoadingImage ? "opacity-0" : "opacity-100",
                  isZoomed
                    ? "w-auto max-w-none h-auto"
                    : "max-h-[76vh] max-w-[88vw] w-auto h-auto"
                )}
                draggable={false}
              />
            </motion.div>
          </div>

          {/* PREV / NEXT NAVIGATION CONTROLS */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 rounded-full p-3 sm:p-3.5 bg-black/60 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/10 active:scale-95"
                title="Previous Image (← Left Arrow)"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 rounded-full p-3 sm:p-3.5 bg-black/60 hover:bg-white/20 text-white transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/10 active:scale-95"
                title="Next Image (→ Right Arrow)"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* BOTTOM THUMBNAILS CAROUSEL STRIP */}
          {total > 1 && (
            <div
              className="w-full flex items-center justify-center py-4 px-4 z-20 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto no-scrollbar gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 px-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigate(idx)}
                    className={cn(
                      "relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                      idx === safeIndex
                        ? "border-white scale-105 shadow-md ring-2 ring-white/50"
                        : "border-transparent opacity-50 hover:opacity-100 hover:border-white/30"
                    )}
                    title={`Go to image ${idx + 1}`}
                    aria-label={`Thumbnail ${idx + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(lightboxContent, document.body);
}
