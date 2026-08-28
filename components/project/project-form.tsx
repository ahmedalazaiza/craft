"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project, ProjectCategory, ProjectMedium } from "@/lib/types";
import {
  MASTER_TAXONOMY,
  getCategoryTaxonomy,
  getTagsForCategory,
  getToolsForCategory,
  getSubCategoriesForCategory,
  normalizeCategory,
} from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uploadMediaFile, uploadMultipleMediaFiles } from "@/lib/supabase/storage";
import {
  UploadCloud,
  Check,
  ArrowLeft,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Tag,
  Wrench,
  Layers,
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

  const coverFileInputRef = React.useRef<HTMLInputElement>(null);
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

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
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags || ["Design Systems", "Auto-layout", "Figma"]
  );
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>(
    initialData?.tools || ["Figma", "Webflow"]
  );
  const [newTool, setNewTool] = useState("");
  const [published, setPublished] = useState(
    initialData ? initialData.published : true
  );
  const [isSaved, setIsSaved] = useState(false);
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

  const handleAddGalleryImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newGalleryUrl.trim()) {
      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
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
      }
    } catch (err) {
      console.error("Gallery files upload error:", err);
    } finally {
      setIsProcessingFiles(false);
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85";
    const finalCover = coverImage || galleryImages[0] || defaultCover;
    const finalGallery = galleryImages.length > 0 ? galleryImages : [finalCover];

    // Combine subCategory into tags if not already present
    const combinedTags = subCategory && !tags.includes(subCategory)
      ? [subCategory, ...tags]
      : tags;

    setIsSaving(true);
    try {
      await saveProject({
        id: initialData?.id,
        title,
        summary,
        body,
        category,
        subCategory,
        medium,
        coverImage: finalCover,
        galleryImages: finalGallery,
        tags: combinedTags.length > 0 ? combinedTags : ["Design", "Case Study"],
        tools: tools.length > 0 ? tools : ["Figma"],
        published,
      });

      setIsSaved(true);
      setTimeout(() => {
        router.push("/explore");
      }, 500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to publish project.";
      console.warn("Project save notice:", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-20">
      {/* Top action navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-neutral)] pb-6">
        <Link
          href="/me"
          className="flex items-center gap-2 text-sm font-medium text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <span className="type-label text-[var(--content-tertiary)]">Status:</span>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className={`rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-colors ${
                published
                  ? "bg-[var(--primary-forest-green)] text-[var(--base-contrast)]"
                  : "bg-[var(--bg-neutral)] text-[var(--content-secondary)]"
              }`}
            >
              {published ? "Published" : "Draft"}
            </button>
          </div>

          <Button type="submit" variant="accent" size="default" disabled={isSaving} className="min-w-[140px]">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Saving...
              </>
            ) : isSaved ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Saved!
              </>
            ) : mode === "new" ? (
              "Publish Project"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Main Content Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title */}
          <div>
            <label className="type-title-subsection text-[var(--content-primary)] block mb-2 font-bold">
              Project Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sanctuary: Architectural Monograph & Spatial Identity"
              required
              className="text-base h-14"
            />
          </div>

          {/* Primary Category & Sub-Category (Side by Side) */}
          <div className="rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 shadow-xs">
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

          {/* Medium */}
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-2 font-bold">
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

          {/* Summary */}
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1 font-bold">
              Brief Summary (One or two lines)
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-2 text-xs">
              Shown on search result cards and project headers.
            </p>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A tactile spatial monograph celebrating raw timber and poured concrete..."
              required
            />
          </div>

          {/* Body */}
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1 font-bold">
              Project Case Study / Narrative
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-2 text-xs">
              Detail your research, typography choices, optical balance, and creative process.
            </p>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detail the materials, design philosophy, optical weights, and architectural context..."
              rows={10}
              required
            />
          </div>

          {/* Extra Gallery Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="type-body-default-bold text-[var(--content-primary)] block font-bold">
                  Exhibition Plates & Gallery Images
                </label>
                <p className="type-label text-[var(--content-tertiary)] text-xs">
                  Add high-fidelity spreads, closeups, and photography plates (rendered in full resolution).
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-[var(--content-tertiary)]">
                {galleryImages.length} plate{galleryImages.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Multiple Files Drag & Drop Area */}
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
                "rounded-[20px] bg-[var(--bg-neutral)]/40 border-2 border-dashed p-6 text-center group cursor-pointer transition-all",
                isDraggingGallery
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/80 scale-[0.99]"
                  : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)]"
              )}
            >
              {isProcessingFiles ? (
                <div className="flex flex-col items-center py-4">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--primary-forest-green)] mb-2" />
                  <span className="text-xs font-bold text-[var(--content-primary)]">
                    Uploading & optimizing gallery plates ({uploadProgress?.current || 0}/{uploadProgress?.total || 0})...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-2 group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors shadow-xs">
                    <ImageIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="type-body-default-bold text-[var(--content-primary)] text-sm">
                    Drop high-res plates here or click to browse
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] text-xs mt-0.5">
                    PNG, JPG, WebP — multiple uploads supported
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Image Grid */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                {galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)] group"
                  >
                    <Image
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="rounded-full bg-red-600/90 text-white p-2 hover:bg-red-700 transition-colors shadow-sm"
                        title="Remove plate"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Visual Cover Dropzone & Metadata */}
        <div className="space-y-8">
          {/* Dedicated Cover Image Uploader */}
          <div className="rounded-[24px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="type-body-default-bold text-[var(--content-primary)] block font-bold">
                Cover Image (Hero Visual)
              </label>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-xs text-[var(--negative)] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="type-label text-[var(--content-tertiary)] mb-4 text-xs">
              Click dropzone or drag & drop to upload cover visual (PNG, JPG, WebP).
            </p>

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

            {/* Visual Cover Dropzone */}
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
                "relative aspect-[4/3] w-full rounded-[18px] overflow-hidden bg-[var(--bg-neutral)] border-2 border-dashed flex flex-col items-center justify-center p-4 text-center group cursor-pointer transition-all",
                isDraggingCover
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/80 scale-[0.99]"
                  : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)]"
              )}
            >
              {isUploadingCover ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)] mb-2" />
                  <span className="text-xs font-bold text-[var(--content-primary)]">Uploading & optimizing cover...</span>
                </div>
              ) : coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    sizes="360px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <Upload className="h-6 w-6 text-white" />
                    <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                      Click to Replace Cover
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-screen)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-3 group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors shadow-xs">
                    <UploadCloud className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="type-body-default-bold text-[var(--content-primary)] text-sm">
                    Upload Cover Image
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] mt-1 max-w-[220px] text-xs">
                    Click to browse or drop high-resolution image
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags & Disciplines */}
          <div className="rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="type-body-default-bold text-[var(--content-primary)] block font-bold">
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

            {/* Suggested Tags based on chosen Category */}
            {suggestedTags.length > 0 && (
              <div className="pt-3 border-t border-[var(--border-neutral)]">
                <span className="text-[11px] font-mono font-semibold text-[var(--content-tertiary)] uppercase tracking-wider block mb-2">
                  Suggested for {activeTaxonomy?.shortName}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {suggestedTags.slice(0, 12).map((sTag) => {
                    const isAdded = tags.includes(sTag);
                    return (
                      <button
                        key={sTag}
                        type="button"
                        disabled={isAdded}
                        onClick={() => handleQuickAddTag(sTag)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-all cursor-pointer",
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

          {/* Tools & Technologies */}
          <div className="rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="type-body-default-bold text-[var(--content-primary)] block font-bold">
                Tools & Stack
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

            {/* Suggested Tools for Category */}
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
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-all cursor-pointer",
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
      </div>
    </form>
  );
}
