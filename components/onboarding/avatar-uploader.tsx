"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Camera, RefreshCw, Trash2, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_AVATAR_URL, getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

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

  const isUsingDefault = !currentAvatar || currentAvatar === DEFAULT_AVATAR_URL;

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

  const handleResetToDefault = () => {
    onAvatarChange(DEFAULT_AVATAR_URL);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone & Main Preview */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/40 p-6 sm:p-8">
        {/* Avatar Preview & Action */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative group">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-3 border-[var(--border-neutral)] bg-[var(--bg-screen)] shadow-md">
              <Image
                src={getValidAvatarUrl(currentAvatar)}
                alt="Profile avatar preview"
                fill
                sizes="128px"
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
              aria-label="Upload custom photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {!isUsingDefault && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Use default avatar</span>
            </button>
          )}
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

      {/* Default Avatar Info Banner */}
      <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--chip-bg)] text-[var(--chip-fg)] shrink-0 mt-0.5">
          <User className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-[var(--content-primary)] block">
            Optional Studio Profile Photo
          </span>
          <p className="text-[11px] text-[var(--content-secondary)] leading-relaxed">
            Uploading an avatar is completely optional. If you don&apos;t upload a photo, your studio will be presented with our minimalist signature avatar across all case studies and directory cards.
          </p>
        </div>
      </div>
    </div>
  );
}
