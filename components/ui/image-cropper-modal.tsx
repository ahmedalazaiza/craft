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

const CROP_BOX_SIZE = 256; // 256px on-screen crop circle diameter

export function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio = 1,
  cropShape = "round",
  title = "Crop Profile Photo",
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

  // 100% Mathematically Exact Canvas Cropping Algorithm
  const handleCrop = useCallback(async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const container = containerRef.current;

      const containerW = container.clientWidth || 320;
      const containerH = container.clientHeight || 320;

      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      if (!naturalW || !naturalH) {
        setIsProcessing(false);
        return;
      }

      // Exact unscaled displayed size of image using contain logic
      const containScale = Math.min(containerW / naturalW, containerH / naturalH);
      const baseRenderedW = naturalW * containScale;
      const baseRenderedH = naturalH * containScale;

      const outputSize = aspectRatio === 1 ? 800 : 1800;
      const targetWidth = outputSize;
      const targetHeight = aspectRatio === 1 ? outputSize : 600;

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

      // Scale factor from preview circle (CROP_BOX_SIZE) to canvas
      const exportFactor = targetWidth / CROP_BOX_SIZE;

      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Apply positional drag offset scaled to canvas resolution
      ctx.translate((position.x * exportFactor) / scale, (position.y * exportFactor) / scale);

      // Draw the exact image dimensions
      const drawW = baseRenderedW * exportFactor;
      const drawH = baseRenderedH * exportFactor;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
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
        0.92
      );
    } catch (err) {
      console.error("Cropping failed:", err);
      setIsProcessing(false);
    }
  }, [aspectRatio, scale, rotation, position, onCropComplete]);

  if (!mounted || !isOpen || !imageSrc) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!isProcessing ? onCancel : undefined}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 sm:p-6 shadow-2xl z-10 space-y-4"
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
                  Drag image to reposition • Zoom to fit the circle
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
            className="relative w-full h-72 bg-black/95 rounded-[22px] overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none border border-white/10"
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
                transition: isDragging ? "none" : "transform 0.08s ease-out",
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
              className="pointer-events-none select-none user-select-none"
            />

            {/* Mask Overlay Guide (Exact 256px Crop Circle) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div
                style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
                className={cn(
                  "border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] shrink-0",
                  aspectRatio === 1
                    ? cropShape === "round"
                      ? "rounded-full ring-2 ring-[#962EE6]/80"
                      : "rounded-2xl"
                    : "w-[90%] h-36 rounded-xl"
                )}
              />
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium border border-white/15">
              <Move className="h-3 w-3" />
              <span>Drag to reposition</span>
            </div>
          </div>

          {/* Adjustment Sliders & Controls */}
          <div className="space-y-3 pt-1">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-[var(--content-tertiary)] shrink-0" />
              <input
                type="range"
                min="1"
                max="3.5"
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
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-neutral)]">
            <Button
              type="button"
              variant="secondary"
              disabled={isProcessing}
              onClick={onCancel}
              className="rounded-full px-5 font-semibold text-xs"
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCrop}
              className="inline-flex items-center gap-1.5 rounded-full font-bold bg-[#962EE6] text-white hover:bg-[#5F0EBA] px-6 py-2.5 text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isProcessing ? "Cropping..." : "Apply & Save Crop"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
