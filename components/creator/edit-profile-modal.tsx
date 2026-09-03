"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Camera,
  Loader2,
  Edit3,
  Check,
  Globe,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Creator } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { uploadMediaFile } from "@/lib/supabase/storage";
import { getValidAvatarUrl } from "@/lib/avatar";
import { normalizeUrl } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/ui/location-input";
import { ImageCropperModal } from "@/components/ui/image-cropper-modal";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
}

export function EditProfileModal({
  isOpen,
  onClose,
  creator,
}: EditProfileModalProps) {
  const { updateProfile, taxonomy } = useSession();
  const [mounted, setMounted] = useState(false);

  const [editName, setEditName] = useState(creator.displayName || "");
  const [editBio, setEditBio] = useState(creator.bio || "");
  const [editLocation, setEditLocation] = useState(creator.location || creator.city || "");
  const [editWebsite, setEditWebsite] = useState(creator.website || "");
  const [editAvatarUrl, setEditAvatarUrl] = useState(creator.avatarUrl);
  const [editSkills, setEditSkills] = useState<string[]>(creator.skills || []);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync state when creator prop changes
  useEffect(() => {
    if (creator) {
      setEditName(creator.displayName || "");
      setEditBio(creator.bio || "");
      setEditLocation(creator.location || creator.city || "");
      setEditWebsite(creator.website || "");
      setEditAvatarUrl(creator.avatarUrl);
      setEditSkills(creator.skills || []);
    }
  }, [creator, isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAvatarFileSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP).", "Invalid File");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCropperSrc(reader.result);
        setIsCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploadingAvatar(true);
    try {
      const file = new File([croppedBlob], `avatar-${Date.now()}.webp`, {
        type: "image/webp",
      });
      const cdnUrl = await uploadMediaFile(file, "avatars", "avatars");
      setEditAvatarUrl(cdnUrl);
      toast.success("Profile photo updated!", "Avatar Ready");
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar image. Please try again.", "Upload Error");
    } finally {
      setIsUploadingAvatar(false);
      setCropperSrc(null);
    }
  };

  const toggleSkill = (skill: string) => {
    if (editSkills.includes(skill)) {
      setEditSkills(editSkills.filter((s) => s !== skill));
    } else {
      if (editSkills.length >= 12) {
        toast.warning("Maximum 12 disciplines allowed.", "Discipline Limit");
        return;
      }
      setEditSkills([...editSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (editSkills.includes(clean)) {
      setCustomSkillInput("");
      return;
    }
    if (editSkills.length >= 12) {
      toast.warning("Maximum 12 disciplines allowed.", "Discipline Limit");
      return;
    }
    setEditSkills([...editSkills, clean]);
    setCustomSkillInput("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Display name cannot be empty.", "Name Required");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: editName.trim(),
        bio: editBio.trim(),
        location: editLocation.trim(),
        city: editLocation.trim(),
        website: normalizeUrl(editWebsite.trim()),
        avatarUrl: editAvatarUrl,
        skills: editSkills,
      });
      toast.success("Profile successfully updated!", "Profile Saved");
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error("Failed to update profile. Please try again.", "Update Failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <>
      {createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={!isSaving ? onClose : undefined}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-[28px] border-t sm:border border-[var(--border-neutral)] bg-[var(--bg-elevated)] shadow-2xl z-10 overflow-hidden pb-safe"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-2.5 pb-1 shrink-0 bg-[var(--bg-elevated)]">
                <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
              </div>

              {/* Top Sticky Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-neutral)] shrink-0 bg-[var(--bg-elevated)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
                    <Edit3 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2
                      className={cn(
                        bricolage.className,
                        "text-lg sm:text-xl font-bold text-[var(--content-primary)]"
                      )}
                    >
                      Edit Creator Profile
                    </h2>
                    <p className="text-xs text-[var(--content-secondary)]">
                      Update your public identity, bio, and social presence.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form
                id="edit-profile-form"
                onSubmit={handleSaveProfile}
                className="flex-1 overflow-y-auto p-6 space-y-6"
              >
                {/* 1. Avatar Image Uploader */}
                <div className="flex flex-col items-center justify-center pb-2">
                  <div
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="group relative h-24 w-24 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] hover:ring-[var(--content-primary)] transition-all cursor-pointer shadow-md"
                    title="Click to change profile picture"
                  >
                    <Image
                      src={getValidAvatarUrl(editAvatarUrl)}
                      alt={editName}
                      fill
                      sizes="96px"
                      className="object-cover rounded-full aspect-square"
                      priority
                    />

                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <Camera className="h-5 w-5 mb-0.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                    </div>

                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    className="mt-2.5 text-xs font-semibold text-[var(--content-primary)] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Change Profile Photo</span>
                  </button>

                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleAvatarFileSelected(e.target.files[0]);
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* 2. Display Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center justify-between">
                    <span>Display Name *</span>
                    <span className="text-[10px] text-[var(--content-tertiary)] font-normal">
                      Visible publicly
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your Full Name or Studio Name"
                    className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-2.5 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
                  />
                </div>

                {/* 3. Creative Bio / Statement */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--content-primary)]">
                      About / Bio
                    </label>
                    <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
                      {editBio.length}/280 max
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell the community about your craft, design philosophy, and what you're currently exploring..."
                    className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 p-4 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden resize-none leading-relaxed"
                  />
                </div>

                {/* 4. Location & Website URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocationInput
                    value={editLocation}
                    onChange={setEditLocation}
                    label="Location / City"
                    placeholder="e.g. Berlin, Germany"
                    showPresets={false}
                    enableAutoDetect={true}
                  />

                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[var(--content-secondary)]" />
                      <span>Website URL</span>
                    </label>
                    <input
                      type="text"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="www.yourdomain.com or https://..."
                      className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-2.5 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* 5. Disciplines & Specializations (Clean Integrated Tag Selector) */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--content-primary)]">
                      Your Disciplines & Specializations ({editSkills.length}/12)
                    </label>
                    {editSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditSkills([])}
                        className="text-[11px] font-semibold text-[var(--content-primary)] hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Active Selected Skills Chips */}
                  {editSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-[var(--bg-neutral)]/70 border border-[var(--border-neutral)]">
                      {editSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-3 py-1 text-xs font-bold shadow-xs hover:opacity-85 transition-opacity cursor-pointer"
                        >
                          <span>{skill}</span>
                          <X className="h-3 w-3 shrink-0 stroke-[3]" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Discipline Suggestions Strip */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                      Select Master Disciplines:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {taxonomy.map((cat) => {
                        const isSelected = editSkills.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleSkill(cat.name)}
                            className={cn(
                              "rounded-full px-3 py-1 text-xs transition-all cursor-pointer inline-flex items-center gap-1",
                              isSelected
                                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                                : "border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:border-[var(--content-secondary)] hover:bg-[var(--bg-neutral)]"
                            )}
                          >
                            <span>{cat.shortName}</span>
                            {isSelected ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              <Plus className="h-3 w-3 opacity-60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Specialty Field */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder="Add custom specialization (e.g. Design Systems, Spatial Audio)..."
                      className="flex-1 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-2 text-xs text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddCustomSkill()}
                      className="rounded-2xl px-4 text-xs font-bold gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>
              </form>

              {/* Sticky Action Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-neutral)] bg-[var(--bg-elevated)] shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={onClose}
                  className="rounded-full px-5 font-semibold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-profile-form"
                  variant="accent"
                  disabled={isSaving || isUploadingAvatar}
                  className="rounded-full px-6 font-bold text-xs shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* 1:1 Image Cropper Modal */}
      {cropperSrc && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropperSrc}
          aspectRatio={1}
          cropShape="round"
          title="Crop Profile Photo"
          onCancel={() => {
            setIsCropperOpen(false);
            setCropperSrc(null);
          }}
          onCropComplete={(croppedBlob) => handleCropComplete(croppedBlob)}
        />
      )}
    </>
  );
}
