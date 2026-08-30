"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualsCarouselProps {
  images: string[];
  title: string;
}

export function VisualsCarousel({ images, title }: VisualsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (!images || images.length === 0) return null;

  // Single Image Mode
  if (images.length === 1) {
    return (
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[var(--border-neutral)] bg-[var(--bg-neutral)] shadow-xs">
        <Image
          src={images[0]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
          priority={false}
        />
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="group/carousel relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[var(--border-neutral)] bg-black/90 shadow-xs select-none">
      {/* 1. Slide Image with Motion */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="relative h-full w-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`${title} - Slide ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. Instagram-Style Slide Counter (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold text-white shadow-md select-none border border-white/10">
        {currentIndex + 1}/{images.length}
      </div>

      {/* 3. Navigation Arrows (Left & Right) */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/10"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      )}

      {/* 4. Instagram-Style Indicator Dots (Bottom Center) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-1.5 border border-white/10 shadow-md">
        {images.map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => goToSlide(idx, e)}
              className={cn(
                "transition-all duration-200 cursor-pointer rounded-full",
                isActive
                  ? "h-1.5 w-4 bg-[#8DFF00] shadow-xs"
                  : "h-1.5 w-1.5 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
