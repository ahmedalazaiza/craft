"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { CommunityPostType, ProjectCategory } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  X,
  MessageCircle,
  Image as ImageIcon,
  Scale,
  BarChart2,
  Trash2,
  UploadCloud,
  Loader2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { createCommunityPost } = useSession();

  const [postType, setPostType] = useState<CommunityPostType>("ab_test");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ProjectCategory>(
    MASTER_TAXONOMY[0].name
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Community", "Feedback"]);

  // Visual Images state
  const [images, setImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // A/B Test state
  const [optionALabel, setOptionALabel] = useState("Option A: Dark Theme");
  const [optionAImage, setOptionAImage] = useState("");
  const [optionBLabel, setOptionBLabel] = useState("Option B: Light Theme");
  const [optionBImage, setOptionBImage] = useState("");
  const optionAInputRef = useRef<HTMLInputElement>(null);
  const optionBInputRef = useRef<HTMLInputElement>(null);

  // Poll state
  const [pollOptions, setPollOptions] = useState<string[]>([
    "Option 1",
    "Option 2",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, "");
      if (clean && !tags.includes(clean) && tags.length < 6) {
        setTags((prev) => [...prev, clean]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleVisualFiles = async (files: FileList) => {
    const newImgs: string[] = [];
    for (let i = 0; i < Math.min(files.length, 4); i++) {
      const dataUrl = await readFileAsDataUrl(files[i]);
      newImgs.push(dataUrl);
    }
    setImages((prev) => [...prev, ...newImgs].slice(0, 4));
  };

  const handleOptionAFile = async (files: FileList) => {
    if (files.length > 0) {
      const dataUrl = await readFileAsDataUrl(files[0]);
      setOptionAImage(dataUrl);
    }
  };

  const handleOptionBFile = async (files: FileList) => {
    if (files.length > 0) {
      const dataUrl = await readFileAsDataUrl(files[0]);
      setOptionBImage(dataUrl);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
    }
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleUpdatePollOption = (idx: number, val: string) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a title or question.");
      return;
    }

    if (postType === "ab_test") {
      if (!optionALabel.trim() || !optionBLabel.trim()) {
        setErrorMessage("Please provide labels for Option A and Option B.");
        return;
      }
    } else if (postType === "poll") {
      const validOptions = pollOptions.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        setErrorMessage("Please provide at least 2 poll options.");
        return;
      }
    } else if (postType === "image" && images.length === 0) {
      setErrorMessage("Please upload at least 1 visual image.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCommunityPost({
        type: postType,
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        images: postType === "image" ? images : undefined,
        abTest:
          postType === "ab_test"
            ? {
                optionA: {
                  id: "A",
                  label: optionALabel.trim(),
                  imageUrl:
                    optionAImage ||
                    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=80",
                  votesCount: 0,
                },
                optionB: {
                  id: "B",
                  label: optionBLabel.trim(),
                  imageUrl:
                    optionBImage ||
                    "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&auto=format&fit=crop&q=80",
                  votesCount: 0,
                },
              }
            : undefined,
        poll:
          postType === "poll"
            ? {
                question: title.trim(),
                options: pollOptions.map((text, idx) => ({
                  id: `opt-${idx + 1}`,
                  text: text.trim() || `Option ${idx + 1}`,
                  votesCount: 0,
                })),
                totalVotes: 0,
              }
            : undefined,
      });

      // Reset form
      setTitle("");
      setContent("");
      setImages([]);
      setOptionAImage("");
      setOptionBImage("");
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to create post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* 1. FIXED TOP HEADER                                               */}
        {/* ================================================================= */}
        <div className="shrink-0 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09] flex items-center justify-center">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-xl sm:text-2xl font-bold text-[var(--content-primary)]"
                )}
              >
                Create Post
              </h2>
              <p className="text-xs text-[var(--content-secondary)]">
                Share a design question, A/B test, or visual showcase with the community
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. FORM: SCROLLABLE BODY + FIXED FOOTER                           */}
        {/* ================================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Center Content */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-5 overscroll-contain">
            {errorMessage && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {errorMessage}
              </div>
            )}

            {/* Post Format Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Post Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "ab_test", label: "A/B Test", icon: Scale },
                  { id: "poll", label: "Poll", icon: BarChart2 },
                  { id: "image", label: "Visuals", icon: ImageIcon },
                  { id: "text", label: "Discussion", icon: MessageCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = postType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPostType(tab.id as CommunityPostType)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer select-none border",
                        isSelected
                          ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] border-transparent shadow-xs"
                          : "bg-[var(--bg-elevated)] border-[var(--border-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:border-[var(--content-primary)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Title / Question */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Title / Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  postType === "ab_test"
                    ? "e.g. Which checkout layout provides better conversion?"
                    : postType === "poll"
                    ? "e.g. Which primary design tool does your team use in 2026?"
                    : postType === "image"
                    ? "e.g. Arabic & Latin Bi-directional Typography Showcase"
                    : "e.g. Best practices for optimizing 3D spatial models on mobile?"
                }
                className="w-full h-11 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-4 text-sm text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] transition-all placeholder:text-[var(--content-tertiary)] font-medium"
              />
            </div>

            {/* Description & Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Description & Context
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide background context, user persona, or trade-offs..."
                className="w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-4 text-sm text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] transition-all placeholder:text-[var(--content-tertiary)] resize-none"
              />
            </div>

            {/* Format Specific Fields */}
            {postType === "ab_test" && (
              <div className="space-y-4 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)] block">
                  A/B Variant Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option A */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--content-primary)]">
                      Option A
                    </span>
                    <input
                      type="text"
                      value={optionALabel}
                      onChange={(e) => setOptionALabel(e.target.value)}
                      placeholder="Variant A label (e.g. Dark Mode)"
                      className="w-full h-9 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 text-xs text-[var(--content-primary)]"
                    />
                    {optionAImage ? (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[var(--border-neutral)] group">
                        <Image
                          src={optionAImage}
                          alt="Option A Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setOptionAImage("")}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => optionAInputRef.current?.click()}
                        className="border border-dashed border-[var(--border-neutral)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--content-primary)] transition-all bg-[var(--bg-screen)]"
                      >
                        <UploadCloud className="h-5 w-5 mx-auto text-[var(--content-tertiary)]" />
                        <span className="text-xs text-[var(--content-secondary)] mt-1 block">
                          Upload Option A image
                        </span>
                      </div>
                    )}
                    <input
                      ref={optionAInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && handleOptionAFile(e.target.files)
                      }
                    />
                  </div>

                  {/* Option B */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--content-primary)]">
                      Option B
                    </span>
                    <input
                      type="text"
                      value={optionBLabel}
                      onChange={(e) => setOptionBLabel(e.target.value)}
                      placeholder="Variant B label (e.g. Light Mode)"
                      className="w-full h-9 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 text-xs text-[var(--content-primary)]"
                    />
                    {optionBImage ? (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[var(--border-neutral)] group">
                        <Image
                          src={optionBImage}
                          alt="Option B Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setOptionBImage("")}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => optionBInputRef.current?.click()}
                        className="border border-dashed border-[var(--border-neutral)] rounded-xl p-4 text-center cursor-pointer hover:border-[var(--content-primary)] transition-all bg-[var(--bg-screen)]"
                      >
                        <UploadCloud className="h-5 w-5 mx-auto text-[var(--content-tertiary)]" />
                        <span className="text-xs text-[var(--content-secondary)] mt-1 block">
                          Upload Option B image
                        </span>
                      </div>
                    )}
                    <input
                      ref={optionBInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && handleOptionBFile(e.target.files)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {postType === "poll" && (
              <div className="space-y-3 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                    Poll Options ({pollOptions.length}/5)
                  </span>
                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs font-bold text-[var(--primary-forest-green)] dark:text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--content-tertiary)] w-5 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleUpdatePollOption(idx, e.target.value)
                        }
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 h-9 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 text-xs text-[var(--content-primary)]"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePollOption(idx)}
                          className="p-1.5 text-[var(--content-tertiary)] hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {postType === "image" && (
              <div className="space-y-3 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)]">
                    Visual Gallery ({images.length}/4)
                  </span>
                  {images.length < 4 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="text-xs font-bold text-[var(--primary-forest-green)] dark:text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      + Add Image
                    </button>
                  )}
                </div>

                {/* Recommended Dimensions Guide */}
                <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 py-2 text-[11px] text-[var(--content-secondary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] shrink-0" />
                  <span>
                    <strong>Recommended Dimensions:</strong> 1600 × 900 px (16:9) or 1600 × 1000 px (16:10) • PNG, JPG, WebP
                  </span>
                </div>

                {images.length === 0 ? (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border border-dashed border-[var(--border-neutral)] rounded-2xl p-6 text-center cursor-pointer hover:border-[var(--content-primary)] transition-all bg-[var(--bg-screen)] space-y-1"
                  >
                    <UploadCloud className="h-6 w-6 mx-auto text-[var(--content-tertiary)]" />
                    <span className="text-xs text-[var(--content-primary)] block font-bold">
                      Click to upload up to 4 high-resolution visuals
                    </span>
                    <span className="text-[11px] text-[var(--content-tertiary)] block">
                      Ideal for multi-image Instagram-style carousel
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border-neutral)] group"
                      >
                        <Image
                          src={img}
                          alt={`Visual ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleVisualFiles(e.target.files)
                  }
                />
              </div>
            )}

            {/* Category Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="w-full h-11 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-4 pr-10 text-xs text-[var(--content-primary)] appearance-none focus:outline-none focus:border-[var(--primary-forest-green)] transition-all cursor-pointer font-medium"
                >
                  {MASTER_TAXONOMY.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-secondary)]">
                Tags (Up to 6)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-2 min-h-11">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-lg bg-[var(--bg-neutral)] px-2.5 py-1 text-xs font-mono text-[var(--content-primary)]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-[var(--content-tertiary)] hover:text-rose-500 ml-0.5 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 6 && (
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={
                      tags.length === 0
                        ? "Type tag & press Enter..."
                        : "Add tag..."
                    }
                    className="h-7 min-w-[120px] flex-1 bg-transparent px-2 text-xs text-[var(--content-primary)] focus:outline-none placeholder:text-[var(--content-tertiary)] font-mono"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* 3. FIXED BOTTOM FOOTER                                            */}
          {/* ================================================================= */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-6 sm:px-8 py-4.5 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)]">
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={onClose}
              className="rounded-2xl px-5 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="default"
              disabled={isSubmitting || !title.trim()}
              className="rounded-2xl px-6 text-xs font-bold gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Post</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
