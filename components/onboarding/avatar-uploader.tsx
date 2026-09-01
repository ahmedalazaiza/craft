"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Camera, RefreshCw, Trash2, User, Crop } from "lucide-react";
import { DEFAULT_AVATAR_URL, getInitials } from "@/lib/avatar";
import { uploadMediaFile } from "@/lib/supabase/storage";
import { ImageCropperModal } from "@/components/ui/image-cropper-modal";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  currentAvatar: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  displayName?: string;
}

export function AvatarUploader({
  currentAvatar,
  onAvatarChange,
  displayName,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cropper Modal state
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const isUsingDefault = !currentAvatar || currentAvatar === DEFAULT_AVATAR_URL;
  const initials = getInitials(displayName);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert("Image size should be under 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCropperSrc(e.target.result as string);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.webp`, {
        type: "image/webp",
      });
      const cdnUrl = await uploadMediaFile(croppedFile, "avatars", "avatars");
      onAvatarChange(cdnUrl);
    } catch (err) {
      console.error("Failed to upload cropped avatar:", err);
    } finally {
      setIsUploading(false);
      setCropperSrc(null);
    }
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
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-[var(--border-neutral)] bg-neutral-100 dark:bg-neutral-800 shadow-sm flex items-center justify-center select-none">
              {!isUsingDefault ? (
                <Image
                  src={currentAvatar}
                  alt="Profile avatar preview"
                  fill
                  sizes="128px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : initials ? (
                <span className="text-3xl sm:text-4xl font-black text-neutral-800 dark:text-neutral-100 tracking-wider">
                  {initials}
                </span>
              ) : (
                <User className="h-12 w-12 sm:h-14 sm:w-14 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-[var(--bg-screen)]"
              title="Upload and crop photo"
              aria-label="Upload and crop photo"
            >
              <Camera className="h-4 w-4 stroke-[2]" />
            </button>
          </div>

          {!isUsingDefault && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
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
              ? "border-[var(--content-primary)] bg-[var(--bg-elevated)] scale-[1.01]"
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
                e.target.value = "";
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[var(--content-primary)]">
              Drag and drop your photo here, or <span className="text-[var(--content-primary)] underline font-bold">browse files</span>
            </p>
            <p className="text-[11px] text-[var(--content-tertiary)] flex items-center justify-center gap-1">
              <Crop className="h-3 w-3" />
              <span>Interactive 1:1 image cropper will open to adjust framing</span>
            </p>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropperSrc}
          aspectRatio={1}
          cropShape="round"
          title="Crop Profile Avatar"
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropperOpen(false);
            setCropperSrc(null);
          }}
        />
      )}

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
            Uploading an avatar is completely optional. If you don&apos;t upload a photo, your studio will be presented with your initials or a minimalist signature avatar across all case studies and directory cards.
          </p>
        </div>
      </div>
    </div>
  );
}
