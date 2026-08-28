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
import { uploadMultipleMediaFiles } from "@/lib/supabase/storage";
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
  FileText,
  Trash2,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Star,
  Eye,
  CheckCircle2,
  Save,
  Send,
  ChevronDown,
  Wand2,
} from "lucide-react";

interface ProjectFormProps {
  initialData?: Project;
  mode: "new" | "edit";
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { saveProject } = useSession();

  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(
    initialData?.body || initialData?.summary || ""
  );
  const [category, setCategory] = useState<string>(
    initialData?.category ? normalizeCategory(initialData.category) : MASTER_TAXONOMY[0].name
  );
  const [subCategory, setSubCategory] = useState<string>(
    initialData?.subCategory || ""
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages || (initialData?.coverImage ? [initialData.coverImage] : [])
  );
  const [coverImage, setCoverImage] = useState(
    initialData?.coverImage || (initialData?.galleryImages?.[0] || "")
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
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // AI Visual Auto-Fill State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Active Taxonomy
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

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const tax = getCategoryTaxonomy(catName);
    if (tax && tax.subCategories.length > 0) {
      setSubCategory(tax.subCategories[0]);
    } else {
      setSubCategory("");
    }
  };

  // Reorder & Manipulate Gallery Spreads
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
  };

  // AI Visual Analysis & Auto-Drafting Engine
  const triggerAIAnalysis = async (imagesToAnalyze: string[], forceOverwrite = false) => {
    if (imagesToAnalyze.length === 0) return;

    setIsAnalyzingAI(true);
    setAiSuccessMessage(null);

    try {
      const res = await fetch("/api/ai/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: imagesToAnalyze }),
      });

      if (!res.ok) throw new Error("AI analysis response was not ok");

      const json = await res.json();
      if (json.success && json.data) {
        const { title: aiTitle, category: aiCategory, subCategory: aiSubCategory, body: aiBody, tags: aiTags, tools: aiTools } = json.data;

        if (forceOverwrite || !title.trim()) {
          setTitle(aiTitle);
        }
        if (aiCategory) {
          setCategory(aiCategory);
        }
        if (aiSubCategory) {
          setSubCategory(aiSubCategory);
        }
        if (forceOverwrite || !body.trim()) {
          setBody(aiBody);
        }
        if (Array.isArray(aiTags) && aiTags.length > 0) {
          setTags(aiTags);
        }
        if (Array.isArray(aiTools) && aiTools.length > 0) {
          setTools(aiTools);
        }

        setAiSuccessMessage("✨ AI analyzed your images and drafted project details! Feel free to customize anything.");
        setTimeout(() => setAiSuccessMessage(null), 8000);
      }
    } catch (err) {
      console.warn("AI Visual Analysis error:", err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Batch Media Upload Handler
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

        // Trigger AI Auto-Fill based on newly uploaded visual spreads
        triggerAIAnalysis(nextGallery, mode === "new" && !title.trim());
      }
    } catch (err) {
      console.error("Gallery files upload error:", err);
    } finally {
      setIsProcessingFiles(false);
      setUploadProgress(null);
    }
  };

  // Tags & Tools handlers
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const cleaned = newTag.trim().replace(/^#/, "");
      if (tags.length >= 20) {
        alert("Maximum 20 tags allowed.");
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
        alert("Maximum 10 tools allowed.");
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

  // Submit Handler
  const handleSave = async (isPublish: boolean) => {
    if (!title.trim()) {
      alert("Please provide a project title.");
      return;
    }

    if (galleryImages.length === 0) {
      alert("Please upload at least one image for your project.");
      return;
    }

    const finalCover = coverImage || galleryImages[0];
    const combinedTags = subCategory && !tags.includes(subCategory)
      ? [subCategory, ...tags]
      : tags;

    setIsSaving(true);
    try {
      await saveProject({
        id: initialData?.id,
        title: title.trim(),
        summary: body.trim().slice(0, 200) || title.trim(),
        body: body.trim() || "Visual design case study.",
        category,
        subCategory: subCategory || undefined,
        medium: "Image",
        coverImage: finalCover,
        galleryImages,
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

  const activeCoverUrl = coverImage || galleryImages[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header & Sticky Publishing Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-neutral)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={cn(bricolage.className, "text-2xl sm:text-3xl font-black text-[var(--content-primary)] tracking-tight")}>
              {mode === "new" ? "New Project" : "Edit Project"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-[#090C09] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Sparkles className="h-3 w-3 fill-current" />
              AI Vision Enabled
            </span>
          </div>
          <p className="text-xs text-[var(--content-secondary)] mt-0.5">
            Upload images, let Craft AI draft the story, and publish live in seconds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {galleryImages.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="default"
              disabled={isAnalyzingAI || isProcessingFiles}
              onClick={() => triggerAIAnalysis(galleryImages, true)}
              className="gap-1.5 font-bold text-xs shadow-xs text-[var(--primary-forest-green)] dark:text-[var(--accent)] border-[var(--primary-forest-green)]/30 hover:bg-[var(--primary-forest-green)]/10"
              title="Re-analyze uploaded visuals and auto-fill fields"
            >
              {isAnalyzingAI ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Auto-Fill with AI</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="default"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="gap-1.5 font-semibold text-xs shadow-xs"
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
            className="gap-2 font-bold shadow-xs min-w-[130px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publish Project</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Analyzing Status Banner */}
      {isAnalyzingAI && (
        <div className="rounded-[20px] bg-[var(--accent)]/15 border border-[var(--accent)]/40 p-4 flex items-center gap-3 animate-pulse shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#090C09] shrink-0">
            <Sparkles className="h-4 w-4 fill-current animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--content-primary)]">
              Craft Vision AI is inspecting your visual spreads...
            </h4>
            <p className="text-[11px] text-[var(--content-secondary)]">
              Detecting design discipline, typography scale, palette, and drafting a bespoke case study narrative.
            </p>
          </div>
        </div>
      )}

      {/* AI Success Toast Banner */}
      {aiSuccessMessage && (
        <div className="rounded-[20px] bg-emerald-500/10 border border-emerald-500/30 p-3.5 flex items-center justify-between gap-3 animate-scale-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              {aiSuccessMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAiSuccessMessage(null)}
            className="text-xs text-[var(--content-tertiary)] hover:text-[var(--content-primary)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VISUAL MEDIA DROPZONE & SPREADS STRIP                                  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Hidden File Input */}
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

        {/* Upload Dropzone */}
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
            "rounded-[24px] bg-[var(--bg-screen)] border-2 border-dashed p-8 text-center group cursor-pointer transition-all",
            isDraggingGallery
              ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/60 scale-[0.99]"
              : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)]"
          )}
        >
          {isProcessingFiles ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)] mb-2" />
              <span className="text-xs font-bold text-[var(--content-primary)]">
                Uploading images ({uploadProgress?.current || 0}/{uploadProgress?.total || 0})...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-3">
              <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] mb-2.5 group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors shadow-xs">
                <UploadCloud className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </div>
              <span className="type-body-default-bold text-[var(--content-primary)] text-sm font-bold">
                Drop project images here, or browse files
              </span>
              <span className="type-label text-[var(--content-tertiary)] text-xs mt-0.5">
                PNG, JPG, WebP — AI will inspect images and auto-fill project details
              </span>
            </div>
          )}
        </div>

        {/* Uploaded Images Horizontal / Grid Tiles Strip */}
        {galleryImages.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--content-secondary)]">
              <span>{galleryImages.length} Image{galleryImages.length === 1 ? "" : "s"} uploaded</span>
              <span>Click ⭐ on any tile to set as cover</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryImages.map((url, idx) => {
                const isCurrentCover = activeCoverUrl === url;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative aspect-[16/10] rounded-[16px] overflow-hidden bg-[var(--bg-neutral)] border transition-all",
                      isCurrentCover
                        ? "border-[var(--primary-forest-green)] ring-2 ring-[var(--primary-forest-green)]/30"
                        : "border-[var(--border-neutral)] hover:border-[var(--border-neutral-hover)]"
                    )}
                  >
                    <Image
                      src={url}
                      alt={`Image ${idx + 1}`}
                      fill
                      sizes="280px"
                      className="object-cover"
                    />

                    {/* Top Plate & Cover Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                      <span className="rounded-md bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                      {isCurrentCover && (
                        <span className="rounded-md bg-[var(--accent)] text-[#090C09] px-2 py-0.5 text-[10px] font-bold shadow-xs">
                          Cover
                        </span>
                      )}
                    </div>

                    {/* Hover Overlay Controls */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                        title="Move left"
                      >
                        <ArrowLeftIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSetAsCover(url)}
                        className={cn(
                          "h-7 px-2.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105",
                          isCurrentCover
                            ? "bg-[var(--accent)] text-[#090C09]"
                            : "bg-white text-black"
                        )}
                        title="Set as Project Cover"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        <span>{isCurrentCover ? "Cover" : "Set Cover"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={idx === galleryImages.length - 1}
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                        title="Move right"
                      >
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="h-7 w-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 cursor-pointer ml-1"
                        title="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add More Tile */}
              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="aspect-[16/10] rounded-[16px] border-2 border-dashed border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/30 flex flex-col items-center justify-center gap-1 text-[var(--content-tertiary)] hover:text-[var(--primary-forest-green)] transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span className="text-[11px] font-bold">Add More</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. PROJECT TITLE & STORY (Expressive Clean Inputs)                         */}
      {/* ========================================================================= */}
      <div className="rounded-[28px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Title Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
              Project Title
            </label>
            {title && (
              <span className="text-[10px] font-mono text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-bold">
                ✓ Ready
              </span>
            )}
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your project a title (or drop images to auto-generate)..."
            className={cn(
              bricolage.className,
              "w-full text-2xl sm:text-3xl font-black text-[var(--content-primary)] bg-transparent border-0 border-b border-[var(--border-neutral)] pb-3 focus:outline-none focus:border-[var(--primary-forest-green)] transition-colors placeholder:text-[var(--content-tertiary)]"
            )}
          />
        </div>

        {/* Category & Subcategory Selectors (Compact Dropdown + Chips) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Category Dropdown */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-11 rounded-[14px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-3.5 pr-8 text-xs font-bold text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] appearance-none cursor-pointer"
              >
                {MASTER_TAXONOMY.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-[var(--content-tertiary)] pointer-events-none" />
            </div>
          </div>

          {/* Subcategory Pills */}
          {availableSubCategories.length > 0 && (
            <div>
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block mb-1.5">
                Specialization ({availableSubCategories.length})
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-0.5">
                {availableSubCategories.map((sub) => {
                  const isSelected = subCategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubCategory(sub)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all border",
                        isSelected
                          ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] border-transparent shadow-xs"
                          : "bg-[var(--bg-elevated)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]"
                      )}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Narrative / Case Study Story */}
        <div>
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block mb-1.5">
            About the Project & Process
          </label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share the design narrative, creative decisions, materials, or context behind this project..."
            rows={5}
            className="text-sm bg-[var(--bg-elevated)] leading-relaxed"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAGS & TOOLS (1-Click Suggestions)                                     */}
      {/* ========================================================================= */}
      <div className="rounded-[28px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tags */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
              Tags ({tags.length}/20)
            </label>
          </div>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag (Press Enter)..."
              disabled={tags.length >= 20}
              className="h-9 text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              disabled={tags.length >= 20}
              className="h-9 text-xs"
            >
              Add
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2.5 py-0.5 rounded-full text-xs font-semibold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[var(--content-tertiary)] uppercase block mb-1.5">
                Suggested tags:
              </span>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.slice(0, 8).map((sTag) => {
                  const isAdded = tags.includes(sTag);
                  return (
                    <button
                      key={sTag}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleQuickAddTag(sTag)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] transition-all cursor-pointer",
                        isAdded
                          ? "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] opacity-40 cursor-not-allowed"
                          : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--accent)] hover:text-[#090C09]"
                      )}
                    >
                      +{sTag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tools */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
              Tools Stack ({tools.length}/10)
            </label>
          </div>

          <div className="flex gap-2">
            <Input
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyDown={handleAddTool}
              placeholder="e.g. Figma, Blender..."
              disabled={tools.length >= 10}
              className="h-9 text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTool}
              disabled={tools.length >= 10}
              className="h-9 text-xs"
            >
              Add
            </Button>
          </div>

          {tools.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 bg-[var(--accent)] text-[#090C09] px-2.5 py-0.5 rounded-full text-xs font-bold"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool)}
                    className="hover:text-rose-700 ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {suggestedTools.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono text-[var(--content-tertiary)] uppercase block mb-1.5">
                Suggested tools:
              </span>
              <div className="flex flex-wrap gap-1">
                {suggestedTools.slice(0, 8).map((sTool) => {
                  const isAdded = tools.includes(sTool);
                  return (
                    <button
                      key={sTool}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleQuickAddTool(sTool)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] transition-all cursor-pointer",
                        isAdded
                          ? "bg-[var(--bg-neutral)] text-[var(--content-tertiary)] opacity-40 cursor-not-allowed"
                          : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--accent)] hover:text-[#090C09]"
                      )}
                    >
                      +{sTool}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-neutral)]">
        <Link
          href="/me"
          className="text-xs font-semibold text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors"
        >
          Cancel & Return to Studio
        </Link>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="gap-2 font-semibold text-xs shadow-xs"
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
            className="gap-2 font-bold shadow-md px-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
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
  );
}
