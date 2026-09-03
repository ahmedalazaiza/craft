"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import {
  CategoryTaxonomyItem,
  getCategoryTaxonomy,
  normalizeCategory,
} from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { uploadMultipleMediaFiles, deleteStorageFiles } from "@/lib/supabase/storage";
import {
  UploadCloud,
  Check,
  Plus,
  X,
  Loader2,
  Tag,
  Wrench,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  Save,
  Send,
  WifiOff,
  Sparkles,
  FileText,
  ImageIcon,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/project/delete-project-modal";

interface ProjectFormProps {
  initialData?: Project;
  mode: "new" | "edit";
}

const MAX_CATEGORIES = 3;
const MAX_SPECIALIZATIONS = 9;

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { saveProject, taxonomy } = useSession();

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Workflow Step: 1 = Image Uploader & Stacks, 2 = Project Details & Publishing
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(
    initialData?.body || initialData?.summary || ""
  );

  // Multi-Category State (up to 3 categories)
  const [categories, setCategories] = useState<string[]>(() => {
    if (initialData?.categories && Array.isArray(initialData.categories) && initialData.categories.length > 0) {
      return initialData.categories.map((c) => normalizeCategory(c, taxonomy)).slice(0, MAX_CATEGORIES);
    }
    if (initialData?.category) {
      return [normalizeCategory(initialData.category, taxonomy)];
    }
    return [taxonomy[0]?.name || "User Interface Design (UI)"];
  });

  // Multi-Select Specializations (up to 9 total across all selected categories)
  const [specializations, setSpecializations] = useState<string[]>(() => {
    if (initialData?.subCategories && Array.isArray(initialData.subCategories) && initialData.subCategories.length > 0) {
      return initialData.subCategories.slice(0, MAX_SPECIALIZATIONS);
    }
    if (initialData?.subCategory) return [initialData.subCategory];
    if (initialData?.tags) {
      const allowedSubs = (initialData.categories || [initialData.category || "UI"])
        .map((c) => getCategoryTaxonomy(c)?.subCategories || [])
        .flat();
      const matched = initialData.tags.filter((t) => allowedSubs.includes(t));
      if (matched.length > 0) return matched.slice(0, MAX_SPECIALIZATIONS);
    }
    return [];
  });

  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages || (initialData?.coverImage ? [initialData.coverImage] : [])
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || (initialData?.galleryImages?.[0] || "")
  );

  const [tags, setTags] = useState<string[]>(
    initialData?.tags || []
  );
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>(
    initialData?.tools || []
  );
  const [newTool, setNewTool] = useState("");

  // Storage / Draft tracking ID in DB (if already saved once as draft)
  const [dbDraftId, setDbDraftId] = useState<string | undefined>(initialData?.id);

  // Statuses & Indicators
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [draftSaveFeedback, setDraftSaveFeedback] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // LOCK BODY SCROLL FOR FULL-SCREEN POPUP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ---------------------------------------------------------------------------
  // ONLINE / OFFLINE RESILIENCE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // WARN BEFORE CLOSING TAB IF UNSAVED CONTENT EXISTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title.trim() || galleryImages.length > 0 || body.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [title, galleryImages, body]);

  // ---------------------------------------------------------------------------
  // TAXONOMY MEMOS (SUGGESTIONS)
  // ---------------------------------------------------------------------------
  const activeTaxonomies = useMemo(() => {
    return categories
      .map((c) => getCategoryTaxonomy(c, taxonomy))
      .filter(Boolean) as CategoryTaxonomyItem[];
  }, [categories, taxonomy]);

  const availableSubCategories = useMemo(() => {
    const subs = categories
      .map((c) => getCategoryTaxonomy(c, taxonomy)?.subCategories || [])
      .flat();
    return Array.from(new Set(subs));
  }, [categories, taxonomy]);

  const handleToggleCategory = (catName: string) => {
    if (categories.includes(catName)) {
      if (categories.length === 1) {
        toast.warning("At least one primary category is required.", "Category Required");
        return;
      }
      setCategories(categories.filter((c) => c !== catName));
    } else {
      if (categories.length >= MAX_CATEGORIES) {
        toast.warning(`Maximum ${MAX_CATEGORIES} categories allowed.`, "Category Limit");
        return;
      }
      setCategories([...categories, catName]);
    }
  };

  const handleToggleSpecialization = (subName: string) => {
    if (specializations.includes(subName)) {
      setSpecializations(specializations.filter((s) => s !== subName));
    } else {
      if (specializations.length >= MAX_SPECIALIZATIONS) {
        toast.warning(`Maximum ${MAX_SPECIALIZATIONS} specializations allowed.`, "Limit Reached");
        return;
      }
      setSpecializations([...specializations, subName]);
    }
  };

  const suggestedTags = useMemo(() => {
    return Array.from(new Set(activeTaxonomies.map((t) => t.tags).flat())).slice(0, 15);
  }, [activeTaxonomies]);

  const suggestedTools = useMemo(() => {
    return Array.from(new Set(activeTaxonomies.map((t) => t.tools).flat())).slice(0, 12);
  }, [activeTaxonomies]);

  // ---------------------------------------------------------------------------
  // GALLERY SPREAD MANIPULATION & UPLOADS
  // ---------------------------------------------------------------------------
  const handleGalleryFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setIsProcessingFiles(true);
    setUploadProgress({ current: 0, total: fileList.length });
    try {
      const cdnUrls = await uploadMultipleMediaFiles(
        fileList,
        "project-media",
        (current, total) => setUploadProgress({ current, total })
      );

      if (cdnUrls.length > 0) {
        const nextGallery = [...galleryImages, ...cdnUrls];
        setGalleryImages(nextGallery);
        if (!coverImage && nextGallery.length > 0) {
          setCoverImage(nextGallery[0]);
        }
      }
    } catch (err) {
      console.error("Gallery files upload error:", err);
      toast.error("Failed to upload some images. Please try again.", "Upload Error");
    } finally {
      setIsProcessingFiles(false);
      setUploadProgress(null);
    }
  };

  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setGalleryImages(updated);
  };

  const handleSetAsCover = (url: string) => {
    setCoverImage(url);
  };

  const handleRemoveImage = (idxToRemove: number) => {
    const removedUrl = galleryImages[idxToRemove];
    const updated = galleryImages.filter((_, idx) => idx !== idxToRemove);
    setGalleryImages(updated);
    if (coverImage === removedUrl) {
      setCoverImage(updated[0] || "");
    }
    if (removedUrl) {
      deleteStorageFiles([removedUrl], "project-media").catch((err) =>
        console.warn("Storage hard delete warning:", err)
      );
    }
  };

  // ---------------------------------------------------------------------------
  // TAGS & TOOLS HANDLERS
  // ---------------------------------------------------------------------------
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const cleaned = newTag.trim().replace(/^#/, "");
      if (tags.length >= 20) {
        toast.warning("Maximum 20 tags allowed per project.", "Tag Limit");
        return;
      }
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setNewTag("");
      }
    }
  };

  const handleQuickAddTag = (tagToAdd: string) => {
    if (tags.length >= 20) return;
    if (!tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTool = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const cleaned = newTool.trim();
      if (tools.length >= 10) {
        toast.warning("Maximum 10 creative tools allowed.", "Tool Limit");
        return;
      }
      if (cleaned && !tools.includes(cleaned)) {
        setTools([...tools, cleaned]);
        setNewTool("");
      }
    }
  };

  const handleQuickAddTool = (toolToAdd: string) => {
    if (tools.length >= 10) return;
    if (!tools.includes(toolToAdd)) {
      setTools([...tools, toolToAdd]);
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setTools(tools.filter((t) => t !== toolToRemove));
  };

  // ---------------------------------------------------------------------------
  // STEP TRANSITIONS & NAVIGATION
  // ---------------------------------------------------------------------------
  const handleProceedToDetails = () => {
    if (galleryImages.length === 0) {
      toast.warning("Please upload at least one image spread before proceeding.", "Images Required");
      return;
    }
    setCurrentStep(2);
  };

  // ---------------------------------------------------------------------------
  // SAVE / PUBLISH DISPATCHER
  // ---------------------------------------------------------------------------
  const handleSave = async (isPublish: boolean) => {
    if (galleryImages.length === 0) {
      toast.warning("Please upload at least one image for your project.", "Images Required");
      setCurrentStep(1);
      return;
    }

    if (isPublish) {
      if (!title.trim()) {
        toast.error("Please enter a title for your project.", "Title Required");
        setCurrentStep(2);
        setTimeout(() => titleInputRef.current?.focus(), 100);
        return;
      }
    }

    const finalCover = coverImage || galleryImages[0];
    const finalCategories = categories.length > 0 ? categories : [taxonomy[0]?.name || "User Interface Design (UI)"];
    const finalSubCategories = specializations.slice(0, MAX_SPECIALIZATIONS);
    const combinedTags = Array.from(new Set([...finalSubCategories, ...tags]));

    if (isPublish) {
      setIsSaving(true);
    } else {
      setIsDraftSaving(true);
    }

    try {
      // Clean up orphaned images if in edit mode
      if (initialData) {
        const previousImages = [
          initialData.coverImage,
          ...(initialData.galleryImages || []),
        ].filter(Boolean);
        const currentImageSet = new Set([finalCover, ...galleryImages]);
        const orphanedImages = previousImages.filter((url) => !currentImageSet.has(url));
        if (orphanedImages.length > 0) {
          deleteStorageFiles(orphanedImages, "project-media").catch((e) =>
            console.warn("Storage hard delete orphaned warning:", e)
          );
        }
      }

      const effectiveId = initialData?.id || dbDraftId;

      const saved = await saveProject({
        id: effectiveId,
        title: title.trim() || "Untitled Project",
        summary: body.trim().slice(0, 200) || title.trim() || "Visual design case study.",
        body: body.trim() || "Visual design case study.",
        category: finalCategories[0],
        categories: finalCategories,
        subCategory: finalSubCategories[0] || undefined,
        subCategories: finalSubCategories,
        medium: "Image",
        coverImage: finalCover,
        galleryImages,
        tags: combinedTags,
        tools,
        published: isPublish,
      });

      if (saved?.id) {
        setDbDraftId(saved.id);
      }

      if (isPublish) {
        toast.success("Project published successfully!", "Live on Directory");
        const targetSlug = saved?.slug || initialData?.slug;
        if (targetSlug) {
          router.push(`/project/${targetSlug}`);
        } else {
          router.push("/me");
        }
      } else {
        toast.success("Project draft saved smoothly!", "Draft Saved");
        setDraftSaveFeedback("✓ Project saved to drafts!");
        setTimeout(() => setDraftSaveFeedback(null), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("verification")) {
        console.error("Failed to save project:", err);
        toast.error("Failed to save project. Please check your connection and try again.", "Save Failed");
      }
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  const activeCoverUrl = coverImage || galleryImages[0];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-screen)] text-[var(--content-primary)] flex flex-col overflow-hidden animate-fade-in">
      {/* Hidden File Inputs */}
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        ref={galleryFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleGalleryFiles(e.target.files);
          }
        }}
        className="hidden"
      />
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        ref={additionalFileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleGalleryFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* ===================================================================== */}
      {/* TOP STICKY HEADER (NAVIGATION & STEP TRACKER)                         */}
      {/* ===================================================================== */}
      <header className="shrink-0 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="flex w-full items-center justify-between px-4 sm:px-8 lg:px-[140px] py-3.5 gap-4">
          {/* Left: Close X Button */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/me"
              className="h-9 w-9 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer shadow-xs shrink-0"
              title="Close & Exit"
            >
              <X className="h-4 w-4" />
            </Link>

            <span className="h-4 w-[1px] bg-[var(--border-neutral)] shrink-0 hidden sm:inline-block" />

            {/* Step Indicator & Project Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-black text-[var(--content-primary)] truncate max-w-[180px] sm:max-w-[320px]">
                {currentStep === 1 ? "Step 1: Upload Images" : title.trim() || "Step 2: Project Details"}
              </span>

              {mode === "edit" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Check className="h-2.5 w-2.5" />
                  <span>Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  <span>Draft</span>
                </span>
              )}

              {isOffline && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                  <WifiOff className="h-2.5 w-2.5" />
                  <span className="hidden md:inline">Offline</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: Step Switcher & Edit Delete */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Step Navigator Pills */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={cn(
                  "px-3 py-1 rounded-full transition-all cursor-pointer",
                  currentStep === 1
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                1. Upload Images ({galleryImages.length})
              </button>
              <button
                type="button"
                onClick={handleProceedToDetails}
                disabled={galleryImages.length === 0}
                className={cn(
                  "px-3 py-1 rounded-full transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                  currentStep === 2
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                2. Project Details
              </button>
            </div>

            {mode === "edit" && initialData?.id && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 font-bold text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* SCROLLABLE POPUP CANVAS BODY                                          */}
      {/* ===================================================================== */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="w-full px-4 sm:px-8 lg:px-[140px] py-8 sm:py-12">
          {/* Draft Save Feedback Banner */}
          {draftSaveFeedback && (
            <div className="mb-8 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{draftSaveFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftSaveFeedback(null)}
                className="p-1 hover:opacity-75 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 1: PROJECT TITLE & IMAGE SPREADS                            */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              {/* Project Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block">
                  Project Title *
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your project a title..."
                  className={cn(
                    bricolage.className,
                    "w-full text-3xl sm:text-5xl font-black text-[var(--content-primary)] bg-transparent border-b-2 border-transparent hover:border-[var(--border-neutral)] focus:border-[var(--primary-forest-green)] pb-3 transition-all focus:outline-none placeholder:text-[var(--content-tertiary)]/60 tracking-tight"
                  )}
                />
              </div>

              {/* Upload Dropzone (When Empty) */}
              {galleryImages.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(true);
                  }}
                  onDragLeave={() => setIsDraggingGallery(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingGallery(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleGalleryFiles(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className={cn(
                    "rounded-[32px] bg-[var(--bg-elevated)] border-2 border-dashed p-16 sm:p-28 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-5 group shadow-xs",
                    isDraggingGallery
                      ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)] scale-[0.99] ring-8 ring-[var(--primary-forest-green)]/10"
                      : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] hover:shadow-sm"
                  )}
                >
                  {isProcessingFiles ? (
                    <div className="flex flex-col items-center py-6 space-y-4">
                      <Loader2 className="h-14 w-14 animate-spin text-[var(--primary-forest-green)]" />
                      <div className="space-y-1 text-center">
                        <h3 className="text-base font-bold text-[var(--content-primary)]">
                          Uploading Images ({uploadProgress?.current || 0}/{uploadProgress?.total || 0})...
                        </h3>
                        <p className="text-xs text-[var(--content-secondary)]">
                          Optimizing and saving to CDN storage
                        </p>
                      </div>
                      {uploadProgress && (
                        <div className="w-64 h-2 rounded-full bg-[var(--bg-neutral)] overflow-hidden border border-[var(--border-neutral)]">
                          <div
                            className="h-full bg-[var(--primary-forest-green)] transition-all duration-300 rounded-full"
                            style={{
                              width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="h-24 w-24 rounded-3xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] group-hover:scale-105 transition-all shadow-2xs">
                        <UploadCloud className="h-12 w-12 stroke-[1.5]" />
                      </div>

                      <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-black text-[var(--content-primary)]">
                          Drag & drop your images here, or Browse
                        </h3>
                        <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                          PNG, JPG, WebP, GIF up to 25MB each. Upload all your project case study slides at once.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Images Stacked Vertically Underneath Each Other (تحت بعضها) */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[var(--primary-forest-green)]" />
                      <span>{galleryImages.length} Images Uploaded (Stacked Order)</span>
                    </span>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => additionalFileInputRef.current?.click()}
                      className="gap-1.5 font-bold text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add More Images</span>
                    </Button>
                  </div>

                  {/* Vertical Image Stack */}
                  <div className="space-y-6">
                    {galleryImages.map((url, idx) => {
                      const isCover = (coverImage || galleryImages[0]) === url;

                      return (
                        <div
                          key={url + idx}
                          className={cn(
                            "group rounded-3xl border bg-[var(--bg-elevated)] overflow-hidden shadow-sm transition-all duration-200",
                            isCover
                              ? "border-[var(--primary-forest-green)] ring-2 ring-[var(--primary-forest-green)]/30"
                              : "border-[var(--border-neutral)] hover:border-[var(--content-secondary)]"
                          )}
                        >
                          {/* Image Card Top Toolbar */}
                          <div className="p-3.5 bg-[var(--bg-elevated)] border-b border-[var(--border-neutral)] flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="rounded-lg bg-black/80 dark:bg-white/15 text-white font-mono font-bold px-2 py-0.5 text-xs">
                                #{idx + 1}
                              </span>

                              {isCover ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-forest-green)] text-white px-2.5 py-0.5 text-[11px] font-mono font-bold shadow-2xs">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>Hero Cover</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetAsCover(url)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] transition-colors cursor-pointer"
                                >
                                  <Star className="h-3.5 w-3.5" />
                                  <span>Set as Cover</span>
                                </button>
                              )}
                            </div>

                            {/* Move & Delete Controls */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveImage(idx, idx - 1)}
                                className="h-8 px-2.5 rounded-xl bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-[var(--content-primary)] text-xs font-semibold transition-colors cursor-pointer"
                                title="Move image up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Up</span>
                              </button>

                              <button
                                type="button"
                                disabled={idx === galleryImages.length - 1}
                                onClick={() => handleMoveImage(idx, idx + 1)}
                                className="h-8 px-2.5 rounded-xl bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-[var(--content-primary)] text-xs font-semibold transition-colors cursor-pointer"
                                title="Move image down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Down</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="h-8 w-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 flex items-center justify-center transition-colors cursor-pointer ml-1"
                                title="Delete image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Large Image Preview */}
                          <div className="relative w-full bg-[var(--bg-neutral)] overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[440px]">
                            <Image
                              src={url}
                              alt={`Project Spread ${idx + 1}`}
                              width={1200}
                              height={800}
                              className="w-full h-auto object-contain max-h-[800px]"
                              sizes="(max-width: 1024px) 100vw, 900px"
                              priority={idx === 0}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Another Image Box at bottom */}
                  <div
                    onClick={() => additionalFileInputRef.current?.click()}
                    className="rounded-3xl border-2 border-dashed border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-neutral)]/40 p-8 text-center flex flex-col items-center justify-center gap-2 text-[var(--content-tertiary)] hover:text-[var(--primary-forest-green)] transition-all cursor-pointer group"
                  >
                    <div className="h-12 w-12 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] group-hover:border-[var(--primary-forest-green)] flex items-center justify-center">
                      <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold">Add Another Image Spread</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ALL PROJECT DETAILS & PUBLISHING (باقي التفاصيل)           */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
              {/* 1. Project Title */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[var(--brand-secondary)]" />
                    <span>Project Title *</span>
                  </label>
                  <span className="text-[11px] text-[var(--content-secondary)]">
                    Keep it clear and descriptive
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your project a title..."
                  className={cn(
                    bricolage.className,
                    "w-full text-xl sm:text-2xl font-black text-[var(--content-primary)] bg-[var(--bg-screen)] border border-[var(--border-neutral)] focus:border-[var(--brand-secondary)] rounded-2xl px-4 py-3 transition-all focus:outline-none placeholder:text-[var(--content-tertiary)]/60"
                  )}
                />
              </div>

              {/* 2. Cover / Thumbnail Preview & Picker */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-[var(--primary-forest-green)]" />
                    <span>Project Hero Cover</span>
                  </span>
                  <span className="text-[11px] text-[var(--content-secondary)]">
                    Click any thumbnail below to select it as the main cover
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Active Cover Preview */}
                  <div className="md:col-span-6">
                    <div className="relative aspect-[16/10] w-full rounded-2xl bg-[var(--bg-neutral)] overflow-hidden border border-[var(--border-neutral)] shadow-sm">
                      {activeCoverUrl ? (
                        <Image
                          src={activeCoverUrl}
                          alt="Hero cover thumbnail"
                          fill
                          className="object-cover"
                          sizes="400px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-[var(--content-tertiary)]">
                          No cover image
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-[var(--primary-forest-green)] px-2.5 py-0.5 text-[10px] font-mono font-bold text-white shadow-xs flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>Cover</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pick from uploaded images */}
                  <div className="md:col-span-6 space-y-2">
                    <span className="text-xs font-bold text-[var(--content-primary)] block">
                      Choose from your {galleryImages.length} uploaded images:
                    </span>
                    <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-1">
                      {galleryImages.map((url, i) => {
                        const isSelected = activeCoverUrl === url;
                        return (
                          <div
                            key={url + i}
                            onClick={() => handleSetAsCover(url)}
                            className={cn(
                              "relative h-16 w-24 rounded-xl overflow-hidden shrink-0 cursor-pointer border-2 transition-all",
                              isSelected
                                ? "border-[var(--primary-forest-green)] ring-4 ring-[var(--primary-forest-green)]/20 scale-105"
                                : "border-[var(--border-neutral)] opacity-70 hover:opacity-100"
                            )}
                            title={`Set image #${i + 1} as cover`}
                          >
                            <Image src={url} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="96px" />
                            <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-mono px-1 rounded">
                              #{i + 1}
                            </span>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-[var(--primary-forest-green)] text-white p-0.5 rounded-full">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Design Disciplines & Specializations (Categories & Subcategories) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] space-y-6 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[var(--brand-secondary)]" />
                      <span>Primary Creative Disciplines ({categories.length}/{MAX_CATEGORIES})</span>
                    </span>
                    <span className="text-[11px] text-[var(--content-secondary)]">
                      Select up to {MAX_CATEGORIES} fields
                    </span>
                  </div>
                  <p className="text-xs text-[var(--content-secondary)]">
                    Categorize your project so curators, studios, and visitors discover your work in the right directories.
                  </p>
                </div>

                {/* Category Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {taxonomy.map((cat) => {
                    const isSelected = categories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.name)}
                        className={cn(
                          "flex items-center justify-between gap-2 p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer text-xs font-bold shadow-2xs select-none",
                          isSelected
                            ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs scale-[1.02]"
                            : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:text-[var(--content-primary)] hover:border-[var(--content-secondary)]/40"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory / Specializations Chips */}
                {availableSubCategories.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-[var(--border-neutral)]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-[var(--brand-secondary)]" />
                        <span>Specializations & Sub-disciplines ({specializations.length}/{MAX_SPECIALIZATIONS})</span>
                      </label>
                      <span className="text-[10px] text-[var(--content-tertiary)] font-mono">
                        Optional
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-0.5">
                      {availableSubCategories.map((sub) => {
                        const isSubSelected = specializations.includes(sub);
                        return (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleToggleSpecialization(sub)}
                            className={cn(
                              "rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer select-none",
                              isSubSelected
                                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-2xs"
                                : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                            )}
                          >
                            {isSubSelected ? "✓ " : "+ "}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Project Story & Narrative */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--primary-forest-green)]" />
                    <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-black text-[var(--content-primary)]")}>
                      Project Story & Case Study Details
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--content-secondary)]">
                    Tell the story behind your craft: the problem, design decisions, challenges solved, and visual outcomes.
                  </p>
                </div>

                <div className="relative">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={1000}
                    placeholder="Write your case study story, overview, or design notes here..."
                    rows={6}
                    className="text-base bg-[var(--bg-elevated)] leading-relaxed rounded-3xl border-[var(--border-neutral)] p-5 pb-9 focus:border-[var(--primary-forest-green)] shadow-2xs w-full resize-y"
                  />
                  <div className="absolute bottom-3.5 right-5 pointer-events-none select-none flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[11px] font-mono font-bold transition-colors px-2 py-0.5 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] shadow-2xs",
                        body.length >= 1000
                          ? "text-rose-600 dark:text-rose-400 border-rose-500/40 bg-rose-500/10"
                          : body.length >= 900
                          ? "text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10"
                          : "text-[var(--content-tertiary)]"
                      )}
                    >
                      {body.length} / 1,000
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Discovery Deck (Tools & Tags) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[var(--border-neutral)]">
                {/* Tools */}
                <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-[var(--primary-forest-green)]" />
                      <span>Tools & Software ({tools.length}/10)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)]">
                      Press Enter to add
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTool}
                      onChange={(e) => setNewTool(e.target.value)}
                      onKeyDown={handleAddTool}
                      placeholder="e.g. Figma, Illustrator, Blender..."
                      className="flex-1 h-10 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3.5 text-xs text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTool}
                      disabled={!newTool.trim()}
                      className="px-4 text-xs font-bold"
                    >
                      Add
                    </Button>
                  </div>

                  {tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tools.map((tool) => (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-bold text-[var(--content-primary)] shadow-2xs"
                        >
                          <span>{tool}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTool(tool)}
                            className="hover:text-rose-500 cursor-pointer ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {suggestedTools.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-neutral)]">
                      <p className="text-[11px] text-[var(--content-tertiary)] font-medium">
                        Quick add:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedTools
                          .filter((t) => !tools.includes(t))
                          .slice(0, 8)
                          .map((tool) => (
                            <button
                              key={tool}
                              type="button"
                              onClick={() => handleQuickAddTool(tool)}
                              className="rounded-full bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[11px] text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
                            >
                              + {tool}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                      <Tag className="h-4 w-4 text-[var(--primary-forest-green)]" />
                      <span>Tags & Keywords ({tags.length}/20)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)]">
                      Press Enter to add
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="e.g. mobile, design-system, dark-mode..."
                      className="flex-1 h-10 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3.5 text-xs text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      className="px-4 text-xs font-bold"
                    >
                      Add
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-bold text-[var(--content-primary)] shadow-2xs"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-rose-500 cursor-pointer ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {suggestedTags.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-neutral)]">
                      <p className="text-[11px] text-[var(--content-tertiary)] font-medium">
                        Suggested tags:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedTags
                          .filter((tg) => !tags.includes(tg))
                          .slice(0, 8)
                          .map((tg) => (
                            <button
                              key={tg}
                              type="button"
                              onClick={() => handleQuickAddTag(tg)}
                              className="rounded-full bg-[var(--bg-screen)] hover:bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[11px] text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer"
                            >
                              + #{tg}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================== */}
      {/* STICKY BOTTOM FOOTER                                                  */}
      {/* ===================================================================== */}
      <footer className="shrink-0 border-t border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md sticky bottom-0 z-30">
        <div className="flex w-full items-center justify-between px-4 sm:px-8 lg:px-[140px] py-3.5 gap-4">
          {/* Left: Close/Back Actions */}
          <div className="flex items-center gap-3">
            {currentStep === 1 ? (
              <Link
                href="/me"
                className="text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors py-1.5 px-3 rounded-xl hover:bg-[var(--bg-neutral)]"
              >
                Cancel
              </Link>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5 font-semibold text-xs shadow-xs px-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Images</span>
              </Button>
            )}
          </div>

          {/* Right: Actions depending on currentStep */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Step 1: Save Draft or Continue to Details */}
            {currentStep === 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDraftSaving || isSaving || galleryImages.length === 0}
                  onClick={() => handleSave(false)}
                  className="gap-1.5 font-semibold text-xs shadow-xs px-4"
                >
                  {isDraftSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save Draft</span>
                </Button>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={galleryImages.length === 0}
                  onClick={handleProceedToDetails}
                  className="gap-2 font-black shadow-sm px-6 min-w-[140px]"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              /* Step 2: Save Draft or Publish */
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isDraftSaving || isSaving || galleryImages.length === 0}
                  onClick={() => handleSave(false)}
                  className="gap-1.5 font-semibold text-xs shadow-xs px-4"
                >
                  {isDraftSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Save Draft</span>
                </Button>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={isSaving || isDraftSaving || galleryImages.length === 0}
                  onClick={() => handleSave(true)}
                  className="gap-2 font-black shadow-sm px-6 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{mode === "edit" ? "Save Changes" : "Publish Project"}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Delete Project Modal for Edit Mode */}
      {mode === "edit" && initialData?.id && (
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          projectId={initialData.id}
          projectTitle={initialData.title}
        />
      )}
    </div>
  );
}
