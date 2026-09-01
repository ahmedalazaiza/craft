"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Move,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio?: 1 | 3; // 1 = 1:1 for Avatar, 3 = 3:1 for Banner
  cropShape?: "round" | "rect";
  title?: string;
  onCropComplete: (croppedBlob: Blob, croppedPreviewUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio = 1,
  cropShape = "round",
  title = "Crop & Adjust Image",
  onCropComplete,
  onCancel,
}: ImageCropperModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset adjustments on new image or open
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc]);

  // Pointer drag events for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = useCallback(async () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const targetWidth = aspectRatio === 1 ? 800 : 1800;
      const targetHeight = aspectRatio === 1 ? 800 : 600;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate centering and transformed bounds
      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Estimate scale factor relative to container display size
      const containerW = containerRef.current?.clientWidth || 300;
      const factor = targetWidth / containerW;

      ctx.translate((position.x * factor) / scale, (position.y * factor) / scale);

      // Draw original image centered
      const drawW = img.naturalWidth;
      const drawH = img.naturalHeight;

      // Scale draw to cover container
      const scaleToFit = Math.max(targetWidth / drawW, targetHeight / drawH);
      const finalW = drawW * scaleToFit;
      const finalH = drawH * scaleToFit;

      ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);
      ctx.restore();

      // Convert canvas to optimized WebP Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            onCropComplete(blob, previewUrl);
          }
          setIsProcessing(false);
        },
        "image/webp",
        0.9
      );
    } catch (err) {
      console.error("Cropping failed:", err);
      setIsProcessing(false);
    }
  }, [aspectRatio, scale, rotation, position, onCropComplete]);

  if (!mounted || !isOpen || !imageSrc) return null;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!isProcessing ? onCancel : undefined}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-2xl z-10 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#962EE6]/15 text-[#962EE6] dark:text-purple-300">
                <Crop className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className={cn(
                    bricolage.className,
                    "text-lg font-bold text-[var(--content-primary)]"
                  )}
                >
                  {title}
                </h3>
                <p className="text-[11px] text-[var(--content-tertiary)]">
                  Drag to re-center • Zoom and rotate to fit perfectly
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="p-1 rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Interactive Crop Viewport Area */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-72 sm:h-80 bg-black/90 rounded-[20px] overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none border border-white/10"
          >
            {/* The Image under transform */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
              className="pointer-events-none select-none user-select-none"
            />

            {/* Mask Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                className={cn(
                  "border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]",
                  aspectRatio === 1
                    ? cropShape === "round"
                      ? "w-56 h-56 sm:w-64 sm:h-64 rounded-full"
                      : "w-56 h-56 sm:w-64 sm:h-64 rounded-2xl"
                    : "w-[90%] h-36 sm:h-44 rounded-xl"
                )}
              />
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-medium border border-white/10">
              <Move className="h-3 w-3" />
              <span>Drag image to position</span>
            </div>
          </div>

          {/* Adjustment Sliders & Controls */}
          <div className="space-y-4 pt-1">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-[var(--content-tertiary)] shrink-0" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-[#962EE6] cursor-pointer"
              />
              <ZoomIn className="h-4 w-4 text-[var(--content-tertiary)] shrink-0" />

              <button
                type="button"
                onClick={handleRotate}
                className="p-2 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)] hover:bg-[var(--border-neutral)] text-[var(--content-primary)] transition-colors cursor-pointer shrink-0 ml-1"
                title="Rotate 90 degrees"
                aria-label="Rotate image"
              >
                <RotateCw className="h-4 w-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-neutral)]">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={onCancel}
                disabled={isProcessing}
                className="text-xs font-semibold px-4"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="accent"
                size="default"
                disabled={isProcessing}
                onClick={handleCrop}
                className="text-xs font-bold px-5 gap-2 shadow-xs"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>{isProcessing ? "Processing WebP..." : "Apply & Save"}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
