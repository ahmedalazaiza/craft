"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Sparkles, Check, X, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
];

interface AvatarUploaderProps {
  currentAvatar: string;
  onAvatarChange: (newAvatarUrl: string) => void;
}

export function AvatarUploader({
  currentAvatar,
  onAvatarChange,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onAvatarChange(e.target.result as string);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Main Preview */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/40 p-6">
        {/* Large Avatar Preview */}
        <div className="relative group shrink-0">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-3 border-[var(--border-neutral)] bg-[var(--bg-screen)] shadow-md">
            <Image
              src={currentAvatar || PRESET_AVATARS[0]}
              alt="Profile avatar preview"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-xs">
                <RefreshCw className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-[var(--accent)] text-[#090C09] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-[var(--bg-screen)]"
            title="Upload custom photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Drop Zone Box */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex-1 w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-[#8DFF00] bg-[#8DFF00]/10 scale-[1.01]"
              : "border-[var(--border-neutral)] hover:border-[var(--content-secondary)] bg-[var(--bg-screen)]/70"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[var(--content-primary)]">
              Drag and drop your photo here, or <span className="text-[var(--accent)] underline">browse files</span>
            </p>
            <p className="text-[11px] text-[var(--content-tertiary)]">
              Supports PNG, JPG, or WebP up to 5MB (Square recommended)
            </p>
          </div>
        </div>
      </div>

      {/* Curated Presets Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--content-secondary)] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
            <span>Or choose from curated creator presets</span>
          </label>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {PRESET_AVATARS.map((url, idx) => {
            const isSelected = currentAvatar === url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onAvatarChange(url)}
                className={cn(
                  "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group",
                  isSelected
                    ? "border-[#8DFF00] ring-3 ring-[#8DFF00]/30 scale-105"
                    : "border-[var(--border-neutral)] hover:border-[var(--content-secondary)] opacity-80 hover:opacity-100"
                )}
              >
                <Image
                  src={url}
                  alt={`Preset avatar ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-[#8DFF00]/25 flex items-center justify-center">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8DFF00] text-[#090C09]">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
