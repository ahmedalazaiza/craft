"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project, ProjectMedium } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import {
  MASTER_TAXONOMY,
  getCategoryTaxonomy,
  normalizeCategory,
} from "@/lib/taxonomy";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uploadMediaFile, uploadMultipleMediaFiles } from "@/lib/supabase/storage";
import {
  UploadCloud,
  Check,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Tag,
  Wrench,
  Layers,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
  CheckCircle2,
  FolderKanban,
  Save,
  Send,
} from "lucide-react";

interface ProjectFormProps {
  initialData?: Project;
  mode: "new" | "edit";
}

const MEDIUMS: ProjectMedium[] = [
  "Image",
  "Video",
  "PDF/Case study",
  "Prototype",
  "3D",
];

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { saveProject } = useSession();

  // Wizard Step (1: Media & Cover, 2: Specifications & Customization)
  const [step, setStep] = useState<1 | 2>(1);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [category, setCategory] = useState<string>(
    initialData?.category ? normalizeCategory(initialData.category) : MASTER_TAXONOMY[0].name
  );
  const [subCategory, setSubCategory] = useState<string>(
    initialData?.subCategory || ""
  );
  const [medium, setMedium] = useState<ProjectMedium>(
    initialData?.medium || "Image"
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || ""
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages || []
  );
  const [tags, setTags] = useState<string[]>(
    initialData?.tags || ["Design Systems", "Auto-layout", "Figma"]
  );
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>(
    initialData?.tools || ["Figma", "Webflow"]
  );
  const [newTool, setNewTool] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // Taxonomy helpers for active category
  const activeTaxonomy = useMemo(() => {
    return getCategoryTaxonomy(category);
  }, [category]);

  const availableSubCategories = useMemo(() => {
    return activeTaxonomy?.subCategories || [];
  }, [activeTaxonomy]);

  const suggestedTags = useMemo(() => {
    return activeTaxonomy?.tags || [];
  }, [activeTaxonomy]);

  const suggestedTools = useMemo(() => {
    return activeTaxonomy?.tools || [];
  }, [activeTaxonomy]);

  const handleCategorySelect = (catName: string) => {
    setCategory(catName);
    const tax = getCategoryTaxonomy(catName);
    if (tax && tax.subCategories.length > 0) {
      setSubCategory(tax.subCategories[0]);
    } else {
      setSubCategory("");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const cleaned = newTag.trim().replace(/^#/, "");
      if (tags.length >= 20) {
        alert("You can add a maximum of 20 tags.");
        return;
      }
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setNewTag("");
      }
    }
  };

  const handleQuickAddTag = (tagToAdd: string) => {
    if (tags.length >= 20) {
      alert("You can add a maximum of 20 tags.");
      return;
    }
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
        alert("You can add a maximum of 10 tools & technologies.");
        return;
      }
      if (cleaned && !tools.includes(cleaned)) {
        setTools([...tools, cleaned]);
        setNewTool("");
      }
    }
  };

  const handleQuickAddTool = (toolToAdd: string) => {
    if (tools.length >= 10) {
      alert("You can add a maximum of 10 tools & technologies.");
      return;
    }
    if (!tools.includes(toolToAdd)) {
      setTools([...tools, toolToAdd]);
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setTools(tools.filter((t) => t !== toolToRemove));
  };

  // Reorder & Manipulate Gallery Spreads
  const handleMoveGalleryImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    setGalleryImages(updated);
  };

  const handleSetAsCover = (url: string) => {
    setCoverImage(url);
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Direct File Upload Handlers
  const handleCoverFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    setIsUploadingCover(true);
    try {
      const cdnUrl = await uploadMediaFile(file, "project-media", "covers");
      setCoverImage(cdnUrl);
    } catch (err) {
      console.error("Cover upload error:", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

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
        setGalleryImages((prev) => [...prev, ...cdnUrls]);
        // If no cover image exists yet, auto-assign first uploaded plate
        if (!coverImage) {
          setCoverImage(cdnUrls[0]);
        }
      }
    } catch (err) {
      console.error("Gallery files upload error:", err);
    } finally {
      setIsProcessingFiles(false);
      setUploadProgress(null);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = () => {
    if (!coverImage && galleryImages.length === 0) {
      alert("Please upload at least a Cover Image or one Gallery Plate to proceed.");
      return;
    }
    if (!coverImage && galleryImages.length > 0) {
      setCoverImage(galleryImages[0]);
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Handler (Draft vs Publish)
  const handleSave = async (isPublish: boolean) => {
    if (!title.trim()) {
      alert("Please provide a Project Title.");
      setStep(2);
      return;
    }

    const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85";
    const finalCover = coverImage || galleryImages[0] || defaultCover;
    const finalGallery = galleryImages.length > 0 ? galleryImages : [finalCover];

    const combinedTags = subCategory && !tags.includes(subCategory)
      ? [subCategory, ...tags]
      : tags;

    setIsSaving(true);
    try {
      await saveProject({
        id: initialData?.id,
        title: title.trim(),
        summary: summary.trim() || title.trim(),
        body: body.trim() || "Visual case study monograph.",
        category,
        subCategory: subCategory || undefined,
        medium,
        coverImage: finalCover,
        galleryImages: finalGallery,
        tags: combinedTags,
        tools,
        published: isPublish,
      });

      if (initialData) {
        router.push(isPublish ? `/project/${initialData.slug}` : "/me");
      } else {
        router.push("/me");
      }
    } catch (err) {
      console.error("Failed to save project:", err);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 2-STEP STUDIO WIZARD NAVIGATION BAR                                       */}
      {/* ========================================================================= */}
      <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Step Switcher Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer",
              step === 1
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[#090C09] text-[10px] font-black">
              1
            </span>
            <span>1. Visual Media & Spreads</span>
            {(coverImage || galleryImages.length > 0) && (
              <Check className="h-3.5 w-3.5 text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (coverImage || galleryImages.length > 0) {
                setStep(2);
              } else {
                alert("Please upload visual media in Step 1 first.");
              }
            }}
            className={cn(
              "flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer",
              step === 2
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] border border-[var(--border-neutral)]"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-neutral)] text-[var(--content-primary)] text-[10px] font-black">
              2
            </span>
            <span>2. Details & Specifications</span>
          </button>
        </div>

        {/* Global Status & Quick Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {step === 1 ? (
            <Button
              type="button"
              variant="accent"
              size="default"
              onClick={handleProceedToStep2}
              className="gap-2 font-bold shadow-xs"
            >
              <span>Next: Project Details</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => setStep(1)}
                className="gap-1.5 font-semibold text-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Media</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="default"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                className="gap-1.5 font-semibold text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Draft</span>
              </Button>

              <Button
                type="button"
                variant="accent"
                size="default"
                disabled={isSaving}
                onClick={() => handleSave(true)}
                className="gap-2 font-bold shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish Live</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: VISUAL MEDIA & COVER UPLOADER (Stacked Vertical List)             */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-8 animate-scale-in">
          {/* Header Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-neutral)]">
            <div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                Upload Project Media & Spreads
              </h2>
              <p className="text-xs text-[var(--content-secondary)] mt-0.5">
                Upload your hero cover image and exhibition plates. All images are rendered in crystal clear, uncompressed quality.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--content-tertiary)] uppercase tracking-wider">
              Step 1 of 2
            </span>
          </div>

          {/* Section 1: Hero Cover Dropzone */}
          <div className="rounded-[28px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#090C09]">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                    Hero Cover Visual
                  </label>
                  <p className="type-label text-[var(--content-tertiary)] text-xs">
                    Primary visual displayed across explore grids, hero showcase, and project cards.
                  </p>
                </div>
              </div>

              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  <span>Remove Cover</span>
                </button>
              )}
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={coverFileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleCoverFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {/* Visual Cover Dropzone Preview */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCover(true);
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingCover(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleCoverFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => coverFileInputRef.current?.click()}
              className={cn(
                "relative aspect-[16/9] max-h-[420px] w-full rounded-[22px] overflow-hidden bg-[var(--bg-neutral)]/40 border-2 border-dashed flex flex-col items-center justify-center p-6 text-center group cursor-pointer transition-all",
                isDraggingCover
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/80 scale-[0.99]"
                  : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)]"
              )}
            >
              {isUploadingCover ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-10 w-10 animate-spin text-[var(--primary-forest-green)] mb-3" />
                  <span className="text-sm font-bold text-[var(--content-primary)]">
                    Uploading & optimizing cover image...
                  </span>
                </div>
              ) : coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    sizes="1200px"
                    priority
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <Upload className="h-8 w-8 text-white" />
                    <span className="text-xs font-bold text-white bg-black/60 px-4 py-2 rounded-full backdrop-blur-xs shadow-md">
                      Click or drop new file to replace cover
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-10">
                  <div className="h-14 w-14 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-3 group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors shadow-xs">
                    <UploadCloud className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="type-body-default-bold text-[var(--content-primary)] text-base font-bold">
                    Upload Hero Cover Image
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] mt-1 max-w-sm text-xs">
                    Drag and drop your hero visual here, or click to browse (PNG, JPG, WebP up to 15MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Exhibition Plates / Gallery Spreads (Stacked Vertical List) */}
          <div className="rounded-[28px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)]">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                    Project Plates & Spreads ({galleryImages.length})
                  </label>
                  <p className="type-label text-[var(--content-tertiary)] text-xs">
                    Detailed spreads, design breakdowns, and gallery plates rendered vertically stacked below.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => galleryFileInputRef.current?.click()}
                className="gap-1.5 text-xs font-semibold shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add More Plates</span>
              </Button>
            </div>

            {/* Multiple Files Upload Dropzone */}
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
                "rounded-[22px] bg-[var(--bg-neutral)]/30 border-2 border-dashed p-8 text-center group cursor-pointer transition-all",
                isDraggingGallery
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/80 scale-[0.99]"
                  : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)]"
              )}
            >
              {isProcessingFiles ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)] mb-3" />
                  <span className="text-sm font-bold text-[var(--content-primary)]">
                    Uploading & optimizing gallery plates ({uploadProgress?.current || 0}/{uploadProgress?.total || 0})...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-2 group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors shadow-xs">
                    <ImageIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="type-body-default-bold text-[var(--content-primary)] text-sm font-bold">
                    Drop exhibition plates here or click to batch upload
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] text-xs mt-0.5">
                    Select multiple high-resolution images to form the full project case study story
                  </span>
                </div>
              )}
            </div>

            {/* Vertical Stacked Exhibition Spreads List */}
            {galleryImages.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-[var(--border-neutral)]">
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-[var(--content-secondary)]">
                  <span>EXHIBITION SPREADS STACK ({galleryImages.length})</span>
                  <span>Drag or use arrows to reorder sequence</span>
                </div>

                <div className="space-y-6">
                  {galleryImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="rounded-[22px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-4 sm:p-5 shadow-xs space-y-3 transition-all hover:border-[var(--border-neutral-hover)]"
                    >
                      {/* Plate Controls Header */}
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-lg bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-1 text-xs font-mono font-bold">
                            Plate {String(idx + 1).padStart(2, "0")}
                          </span>
                          {coverImage === url && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-[#090C09] px-2.5 py-0.5 text-[10px] font-bold">
                              <Star className="h-3 w-3 fill-current" />
                              Active Cover
                            </span>
                          )}
                        </div>

                        {/* Actions: Reorder, Set as Cover, Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveGalleryImage(idx, idx - 1)}
                            className="h-8 w-8 rounded-lg bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-secondary)] hover:text-[var(--content-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={idx === galleryImages.length - 1}
                            onClick={() => handleMoveGalleryImage(idx, idx + 1)}
                            className="h-8 w-8 rounded-lg bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-secondary)] hover:text-[var(--content-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetAsCover(url)}
                            className={cn(
                              "h-8 px-2.5 rounded-lg border flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer",
                              coverImage === url
                                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent"
                                : "bg-[var(--bg-screen)] border-[var(--border-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                            )}
                            title="Set as Hero Cover"
                          >
                            <Star className="h-3 w-3" />
                            <span>Set Cover</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer ml-1"
                            title="Remove Plate"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Full-Width Spread Image Display */}
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[16px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)]">
                        <Image
                          src={url}
                          alt={`Plate ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 1200px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action to Step 2 */}
          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-[var(--content-tertiary)]">
              Images uploaded here will be preserved while you edit project specifications.
            </span>
            <Button
              type="button"
              variant="accent"
              size="lg"
              onClick={handleProceedToStep2}
              className="gap-2 font-bold shadow-md px-8"
            >
              <span>Continue to Specifications</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: PROJECT SPECIFICATIONS, STORY, TAXONOMY & METADATA               */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-8 animate-scale-in">
          {/* Header Note */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-neutral)]">
            <div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                Project Specifications & Narrative
              </h2>
              <p className="text-xs text-[var(--content-secondary)] mt-0.5">
                Provide the design title, category focus, project narrative, tags, and tools stack.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--content-tertiary)] uppercase tracking-wider">
              Step 2 of 2
            </span>
          </div>

          {/* Title */}
          <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-2">
            <label className="type-title-subsection text-[var(--content-primary)] block font-bold text-base">
              Project Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sanctuary: Architectural Monograph & Spatial Identity"
              required
              className="text-base h-14 font-semibold"
            />
            <p className="text-[11px] text-[var(--content-tertiary)] font-mono">
              Direct permanent link: craft.design/project/
              {title ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "project-slug"}
            </p>
          </div>

          {/* Primary Category & Sub-Category (Side by Side) */}
          <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Primary Category (13 Master Categories) */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                      Primary Category ({MASTER_TAXONOMY.length})
                    </label>
                    <p className="type-label text-[var(--content-tertiary)] text-xs mt-0.5">
                      Select the main creative discipline that best represents this project.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] shrink-0">
                    {activeTaxonomy?.shortName || "UI"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {MASTER_TAXONOMY.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.name)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-left transition-all cursor-pointer border",
                          isSelected
                            ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs"
                            : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)]"
                        )}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[var(--chip-fg)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Sub-Category Selection */}
              <div className="md:col-span-5 space-y-3.5 md:border-l md:border-[var(--border-neutral)] md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--border-neutral)]">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                      Sub-Category ({availableSubCategories.length})
                    </label>
                    {subCategory && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="type-label text-[var(--content-tertiary)] text-xs mt-0.5">
                    Refine discipline focus in {activeTaxonomy?.shortName || "category"}.
                  </p>
                </div>

                {availableSubCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableSubCategories.map((sub) => {
                      const isSelected = subCategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSubCategory(sub)}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all border text-left",
                            isSelected
                              ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] border-transparent shadow-xs"
                              : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)]"
                          )}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--bg-neutral)]/40 border border-dashed border-[var(--border-neutral)] text-center text-xs text-[var(--content-tertiary)]">
                    No sub-categories available for this discipline.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medium / Format */}
          <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-3">
            <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
              Medium / Artifact Format
            </label>
            <div className="flex flex-wrap gap-2">
              {MEDIUMS.map((med) => (
                <button
                  key={med}
                  type="button"
                  onClick={() => setMedium(med)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-all ${
                    medium === med
                      ? "bg-[var(--primary-forest-green)] text-[var(--base-contrast)] shadow-sm"
                      : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral-hover)]"
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Narrative Body */}
          <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <label className="type-body-default-bold text-[var(--content-primary)] block mb-1 font-bold text-sm">
                Brief Summary (One or two lines)
              </label>
              <p className="type-label text-[var(--content-tertiary)] mb-2 text-xs">
                Shown on search result cards, discover feeds, and project headers.
              </p>
              <Input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A tactile spatial monograph celebrating raw timber and poured concrete..."
                required
              />
            </div>

            <div>
              <label className="type-body-default-bold text-[var(--content-primary)] block mb-1 font-bold text-sm">
                Project Case Study / Narrative
              </label>
              <p className="type-label text-[var(--content-tertiary)] mb-2 text-xs">
                Detail your creative methodology, typography scale, visual tension, and artistic rationale.
              </p>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Detail the materials, design philosophy, optical weights, and architectural context..."
                rows={8}
                required
              />
            </div>
          </div>

          {/* Tags & Stack (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags & Methodology */}
            <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                  Tags & Methodology
                </label>
                <span className={cn(
                  "text-xs font-mono font-semibold",
                  tags.length >= 20 ? "text-[var(--negative)]" : "text-[var(--content-tertiary)]"
                )}>
                  {tags.length}/20 max
                </span>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length >= 20 ? "Maximum tags reached" : "Add custom tag (Press Enter)..."}
                  disabled={tags.length >= 20}
                  className="h-10 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={tags.length >= 20}
                >
                  Add
                </Button>
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-1 rounded-full text-xs font-semibold"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-[var(--negative)] ml-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-neutral)]">
                  <span className="text-[11px] font-mono font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2">
                    Suggested for {activeTaxonomy?.shortName}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags.slice(0, 10).map((sTag) => {
                      const isAdded = tags.includes(sTag);
                      return (
                        <button
                          key={sTag}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleQuickAddTag(sTag)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all cursor-pointer",
                            isAdded
                              ? "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] opacity-60 cursor-not-allowed"
                              : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--accent)] hover:text-[#090C09]"
                          )}
                        >
                          {!isAdded && <Plus className="h-2.5 w-2.5" />}
                          <span>{sTag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tools & Tech Stack */}
            <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="type-body-default-bold text-[var(--content-primary)] block font-bold text-sm">
                  Tools & Technologies
                </label>
                <span className={cn(
                  "text-xs font-mono font-semibold",
                  tools.length >= 10 ? "text-[var(--negative)]" : "text-[var(--content-tertiary)]"
                )}>
                  {tools.length}/10 max
                </span>
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <Input
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyDown={handleAddTool}
                  placeholder={tools.length >= 10 ? "Maximum tools reached" : "e.g. Figma, Blender, Unity..."}
                  disabled={tools.length >= 10}
                  className="h-10 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTool}
                  disabled={tools.length >= 10}
                >
                  Add
                </Button>
              </div>

              {/* Selected Tools */}
              {tools.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 bg-[var(--accent)] text-[#090C09] px-2.5 py-1 rounded-full text-xs font-bold"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool)}
                        className="hover:text-red-700 ml-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Tools */}
              {suggestedTools.length > 0 && (
                <div className="pt-3 border-t border-[var(--border-neutral)]">
                  <span className="text-[11px] font-mono font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2">
                    Common Tools for {activeTaxonomy?.shortName}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTools.map((sTool) => {
                      const isAdded = tools.includes(sTool);
                      return (
                        <button
                          key={sTool}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleQuickAddTool(sTool)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all cursor-pointer",
                            isAdded
                              ? "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] opacity-60 cursor-not-allowed"
                              : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--accent)] hover:text-[#090C09]"
                          )}
                        >
                          {!isAdded && <Plus className="h-2.5 w-2.5" />}
                          <span>{sTool}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer for Step 2 */}
          <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="gap-2 font-semibold w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Visual Media</span>
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                className="gap-2 font-semibold shadow-xs w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                <span>Save as Draft</span>
              </Button>

              <Button
                type="button"
                variant="accent"
                size="lg"
                disabled={isSaving}
                onClick={() => handleSave(true)}
                className="gap-2 font-bold shadow-md w-full sm:w-auto px-8"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing Project...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish Project Live</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
