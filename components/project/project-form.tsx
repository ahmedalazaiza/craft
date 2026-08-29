"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project } from "@/lib/types";
import { bricolage } from "@/lib/fonts";
import {
  MASTER_TAXONOMY,
  getCategoryTaxonomy,
  normalizeCategory,
} from "@/lib/taxonomy";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uploadMultipleMediaFiles } from "@/lib/supabase/storage";
import {
  UploadCloud,
  Check,
  Plus,
  X,
  Loader2,
  Sparkles,
  Tag,
  Wrench,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  Save,
  Send,
  ChevronDown,
  Wand2,
} from "lucide-react";

import { DeleteProjectModal } from "@/components/project/delete-project-modal";

interface ProjectFormProps {
  initialData?: Project;
  mode: "new" | "edit";
}

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { saveProject } = useSession();

  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(
    initialData?.body || initialData?.summary || ""
  );
  const [category, setCategory] = useState<string>(
    initialData?.category ? normalizeCategory(initialData.category) : MASTER_TAXONOMY[0].name
  );

  // Multi-Select Specializations
  const [specializations, setSpecializations] = useState<string[]>(() => {
    if (initialData?.subCategory) return [initialData.subCategory];
    if (initialData?.tags) {
      const tax = getCategoryTaxonomy(initialData.category || "UI");
      const matched = initialData.tags.filter((t) => tax?.subCategories.includes(t));
      if (matched.length > 0) return matched;
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
    initialData?.tags || ["Design Systems", "Auto-layout", "Figma"]
  );
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>(
    initialData?.tools || ["Figma", "Webflow"]
  );
  const [newTool, setNewTool] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // AI Visual Auto-Fill State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [isTitleHighlighted, setIsTitleHighlighted] = useState(false);

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
    if (tax) {
      setSpecializations((prev) => prev.filter((s) => tax.subCategories.includes(s)));
    } else {
      setSpecializations([]);
    }
  };

  const handleToggleSpecialization = (sub: string) => {
    setSpecializations((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
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
          setSpecializations((prev) => Array.from(new Set([...prev, aiSubCategory])));
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

        setAiSuccessMessage("✨ AI drafted project details from your spreads! Click any field to edit & customize.");
        setTimeout(() => setAiSuccessMessage(null), 10000);

        // Auto-focus on Title Input so user immediately sees fields are editable
        setTimeout(() => {
          if (titleInputRef.current) {
            titleInputRef.current.focus();
            setIsTitleHighlighted(true);
            setTimeout(() => setIsTitleHighlighted(false), 4000);
          }
        }, 200);
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
      titleInputRef.current?.focus();
      return;
    }

    if (galleryImages.length === 0) {
      alert("Please upload at least one image for your project.");
      return;
    }

    const finalCover = coverImage || galleryImages[0];
    const combinedTags = Array.from(new Set([...specializations, ...tags]));

    setIsSaving(true);
    try {
      const saved = await saveProject({
        id: initialData?.id,
        title: title.trim(),
        summary: body.trim().slice(0, 200) || title.trim(),
        body: body.trim() || "Visual design case study.",
        category,
        subCategory: specializations[0] || undefined,
        medium: "Image",
        coverImage: finalCover,
        galleryImages,
        tags: combinedTags,
        tools,
        published: isPublish,
      });

      const targetSlug = saved?.slug || initialData?.slug;
      if (isPublish && targetSlug) {
        router.push(`/project/${targetSlug}`);
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
    <div className="fixed inset-0 z-50 bg-[var(--bg-screen)] flex flex-col overflow-hidden text-[var(--content-primary)] select-none">
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

      {/* ========================================================================= */}
      {/* TOP HEADER ACTION BAR                                                     */}
      {/* ========================================================================= */}
      <header className="h-16 shrink-0 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30">
        {/* Left: Close/Back & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-[var(--bg-neutral)] hover:bg-[var(--border-neutral)] flex items-center justify-center text-[var(--content-primary)] transition-colors cursor-pointer shrink-0"
            title="Close creator studio"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 truncate">
            <h1 className={cn(bricolage.className, "text-sm sm:text-base font-black text-[var(--content-primary)] truncate")}>
              {mode === "new" ? "Create New Project" : "Edit Case Study"}
            </h1>
            {galleryImages.length > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--content-secondary)]">
                {galleryImages.length} Image{galleryImages.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
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

          {galleryImages.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isAnalyzingAI || isProcessingFiles}
              onClick={() => triggerAIAnalysis(galleryImages, true)}
              className="gap-1.5 font-bold text-xs shadow-xs text-[var(--primary-forest-green)] dark:text-[var(--accent)] border-[var(--primary-forest-green)]/30 hover:bg-[var(--primary-forest-green)]/10"
              title="Re-analyze uploaded visuals and auto-fill fields"
            >
              {isAnalyzingAI ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">AI Analyzing...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Re-Draft with AI</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSaving || galleryImages.length === 0}
            onClick={() => handleSave(false)}
            className="gap-1.5 font-semibold text-xs shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={isSaving || galleryImages.length === 0}
            onClick={() => handleSave(true)}
            className="gap-2 font-bold shadow-xs min-w-[110px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publish Live</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER: EMPTY UPLOADER OR SPLIT-SCREEN WORKSPACE                  */}
      {/* ========================================================================= */}
      {galleryImages.length === 0 ? (
        /* ----------------------------------------------------------------------- */
        /* INITIAL STATE: FULL-SCREEN CENTERED UPLOADER                            */
        /* ----------------------------------------------------------------------- */
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto bg-[var(--bg-screen)]">
          <div className="max-w-2xl w-full text-center space-y-6">
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
                "rounded-[32px] bg-[var(--bg-screen)] border-2 border-dashed p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 shadow-sm flex flex-col items-center justify-center gap-4 group",
                isDraggingGallery
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/70 scale-[0.99] ring-8 ring-[var(--primary-forest-green)]/10"
                  : "border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] hover:shadow-md"
              )}
            >
              {isProcessingFiles ? (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="relative">
                    <Loader2 className="h-14 w-14 animate-spin text-[var(--primary-forest-green)]" />
                    <Sparkles className="h-6 w-6 text-[var(--accent)] absolute -top-1 -right-1 fill-current animate-pulse" />
                  </div>
                  <div className="space-y-1 text-center">
                    <h3 className="text-base font-bold text-[var(--content-primary)]">
                      Uploading & Processing Media ({uploadProgress?.current || 0}/{uploadProgress?.total || 0})...
                    </h3>
                    <p className="text-xs text-[var(--content-secondary)]">
                      Uploading to secure storage and launching AI visual analyzer
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
                  <div className="h-20 w-20 rounded-3xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] group-hover:scale-105 transition-all shadow-sm">
                    <UploadCloud className="h-10 w-10 stroke-[1.5]" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h2 className={cn(bricolage.className, "text-2xl sm:text-3xl font-black text-[var(--content-primary)] tracking-tight")}>
                      Upload your Project Spreads
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--content-secondary)]">
                      Drag and drop your case study images, mockups, or system boards here, or click to browse.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 px-4 py-2 text-xs font-bold text-[var(--content-primary)] shadow-2xs mt-2">
                    <Sparkles className="h-4 w-4 text-[var(--primary-forest-green)] dark:text-[var(--accent)] fill-current shrink-0 animate-pulse" />
                    <span>AI will inspect your images to draft Title, Narrative, Category & Tags</span>
                  </div>

                  <span className="text-[11px] font-mono text-[var(--content-tertiary)] mt-1">
                    Supports PNG, JPG, WebP, GIF • High-resolution supported
                  </span>
                </>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ----------------------------------------------------------------------- */
        /* POST-UPLOAD STATE: DYNAMIC TWO-COLUMN SPLIT SCREEN                      */
        /* ----------------------------------------------------------------------- */
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: EDITORIAL FORM & AI METADATA (SCROLLABLE)                */}
          {/* ===================================================================== */}
          <section className="w-full lg:w-[48%] xl:w-[45%] h-full overflow-y-auto border-r border-[var(--border-neutral)] p-6 sm:p-8 space-y-6 bg-[var(--bg-screen)]">
            {/* AI Analyzing Status Banner */}
            {isAnalyzingAI && (
              <div className="rounded-[20px] bg-[var(--accent)]/15 border border-[var(--accent)]/40 p-4 flex items-center gap-3 animate-pulse shadow-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[#090C09] shrink-0">
                  <Sparkles className="h-4 w-4 fill-current animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--content-primary)]">
                    Layerat Vision AI is inspecting your visual spreads...
                  </h4>
                  <p className="text-[11px] text-[var(--content-secondary)]">
                    Drafting a bespoke title, case study narrative, category, and tags.
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

            {/* 1. Project Title Field (Auto-focused after AI with editable indicator) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1.5">
                  <span>Project Title</span>
                  <span className="text-[10px] text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-bold bg-[var(--primary-forest-green)]/10 dark:bg-[var(--accent)]/10 px-2 py-0.5 rounded-md">
                    ✏️ Editable
                  </span>
                </label>
                {title.trim() && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ Ready
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title (or drop images to auto-generate)..."
                  className={cn(
                    bricolage.className,
                    "w-full text-xl sm:text-2xl font-black text-[var(--content-primary)] bg-[var(--bg-elevated)]/50 rounded-2xl border p-4 transition-all duration-300 focus:outline-none placeholder:text-[var(--content-tertiary)]",
                    isTitleHighlighted
                      ? "border-[var(--accent)] ring-4 ring-[var(--accent)]/30 bg-[var(--accent)]/10"
                      : "border-[var(--border-neutral)] focus:border-[var(--primary-forest-green)] focus:ring-2 focus:ring-[var(--primary-forest-green)]/20"
                  )}
                />
              </div>
              <p className="text-[11px] text-[var(--content-secondary)]">
                You can customize and edit this title anytime.
              </p>
            </div>

            {/* 2. Category & Multi-Select Specialization */}
            <div className="space-y-4 pt-2 border-t border-[var(--border-neutral)]">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-11 rounded-[14px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-3.5 pr-8 text-xs font-bold text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] appearance-none cursor-pointer shadow-2xs"
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

              {/* Multi-Select Specialization Pills */}
              {availableSubCategories.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)]">
                      Specialization ({specializations.length}/{availableSubCategories.length})
                    </label>
                    {specializations.length > 0 && (
                      <span className="text-[10px] font-mono font-bold text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
                        {specializations.length} Selected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-[var(--bg-neutral)]/30 border border-[var(--border-neutral)]">
                    {availableSubCategories.map((sub) => {
                      const isSelected = specializations.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleToggleSpecialization(sub)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all border",
                            isSelected
                              ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-transparent shadow-xs dark:bg-[var(--accent)] dark:text-[#090C09] font-bold scale-[1.02]"
                              : "bg-[var(--bg-elevated)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)]"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 shrink-0" />}
                          <span>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Narrative / Case Study Story */}
            <div className="space-y-1.5 pt-2 border-t border-[var(--border-neutral)]">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-tertiary)] block">
                About the Project & Process
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share the design narrative, creative decisions, materials, or context behind this project..."
                rows={6}
                className="text-sm bg-[var(--bg-elevated)] leading-relaxed rounded-2xl"
              />
            </div>

            {/* 4. Tags & Tools Grid */}
            <div className="space-y-4 pt-2 border-t border-[var(--border-neutral)]">
              {/* Tags Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[var(--accent)]" />
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-primary)]">
                    Tags & Methodology
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-[var(--bg-neutral)]/30 border border-[var(--border-neutral)]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-xs font-medium text-[var(--content-primary)] shadow-2xs"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[var(--content-tertiary)] hover:text-rose-500 cursor-pointer ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ Add tag (Enter)"
                    className="flex-1 min-w-[110px] bg-transparent text-xs text-[var(--content-primary)] focus:outline-none placeholder:text-[var(--content-tertiary)] px-1"
                  />
                </div>
                {suggestedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)] mr-1">Suggestions:</span>
                    {suggestedTags.slice(0, 6).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleQuickAddTag(st)}
                        disabled={tags.includes(st)}
                        className="text-[11px] text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-2 py-0.5 rounded-md disabled:opacity-40 cursor-pointer"
                      >
                        +{st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tools Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[var(--accent)]" />
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-primary)]">
                    Tools & Software
                  </label>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-[var(--bg-neutral)]/30 border border-[var(--border-neutral)]">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-2.5 py-0.5 text-xs font-medium text-[var(--content-primary)] shadow-2xs"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool)}
                        className="text-[var(--content-tertiary)] hover:text-rose-500 cursor-pointer ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={handleAddTool}
                    placeholder="+ Add tool (Enter)"
                    className="flex-1 min-w-[110px] bg-transparent text-xs text-[var(--content-primary)] focus:outline-none placeholder:text-[var(--content-tertiary)] px-1"
                  />
                </div>
                {suggestedTools.length > 0 && (
                  <div className="flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-mono text-[var(--content-tertiary)] mr-1">Suggestions:</span>
                    {suggestedTools.slice(0, 6).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleQuickAddTool(st)}
                        disabled={tools.includes(st)}
                        className="text-[11px] text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-2 py-0.5 rounded-md disabled:opacity-40 cursor-pointer"
                      >
                        +{st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: VISUAL MEDIA FEED / SPREADS CANVAS (SCROLLABLE)         */}
          {/* ===================================================================== */}
          <section className="w-full lg:w-[52%] xl:w-[55%] h-full flex flex-col overflow-hidden bg-[var(--bg-neutral)]/20">
            {/* Media Feed Header */}
            <div className="p-4 sm:px-6 border-b border-[var(--border-neutral)] bg-[var(--bg-screen)]/90 backdrop-blur-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--content-primary)]">
                  Project Visual Spreads ({galleryImages.length})
                </h3>
                <span className="text-[11px] text-[var(--content-tertiary)] hidden md:inline">
                  • Click ⭐ to set as cover
                </span>
              </div>

              <button
                type="button"
                onClick={() => galleryFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] text-xs font-bold text-[var(--content-primary)] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Spreads</span>
              </button>
            </div>

            {/* Continuous Vertical Spreads Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {galleryImages.map((url, idx) => {
                const isCurrentCover = activeCoverUrl === url;

                return (
                  <div
                    key={`${url}-${idx}`}
                    className={cn(
                      "group relative rounded-[24px] overflow-hidden bg-[var(--bg-neutral)] border transition-all duration-200 shadow-sm",
                      isCurrentCover
                        ? "border-[var(--primary-forest-green)] ring-2 ring-[var(--primary-forest-green)]/40"
                        : "border-[var(--border-neutral)] hover:border-[var(--border-neutral-hover)]"
                    )}
                  >
                    <div className="relative w-full aspect-auto max-h-[850px] min-h-[240px] bg-black/5 flex items-center justify-center">
                      <Image
                        src={url}
                        alt={`Project Spread ${idx + 1}`}
                        width={1400}
                        height={1000}
                        className="w-full h-auto object-contain"
                        priority={idx === 0}
                      />
                    </div>

                    {/* Top Left Badge: Spread # & Cover Indicator */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                      <span className="rounded-lg bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 text-xs font-mono font-bold shadow-xs">
                        #{idx + 1}
                      </span>
                      {isCurrentCover && (
                        <span className="rounded-lg bg-[var(--accent)] text-[#090C09] px-2.5 py-1 text-xs font-black shadow-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          <span>Card Cover</span>
                        </span>
                      )}
                    </div>

                    {/* Action Overlay Controls */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-md p-1.5 rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <button
                        type="button"
                        onClick={() => handleSetAsCover(url)}
                        className={cn(
                          "h-8 px-3 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all",
                          isCurrentCover
                            ? "bg-[var(--accent)] text-[#090C09] shadow-xs"
                            : "bg-white/20 hover:bg-white text-white hover:text-black"
                        )}
                        title="Set as feed card cover thumbnail"
                      >
                        <Star className={cn("h-3.5 w-3.5", isCurrentCover && "fill-current")} />
                        <span>{isCurrentCover ? "Active Cover" : "Make Cover"}</span>
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, idx - 1)}
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === galleryImages.length - 1}
                        onClick={() => handleMoveImage(idx, idx + 1)}
                        className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="h-8 w-8 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer ml-0.5"
                        title="Remove spread"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Add Spreads Tile */}
              <div
                onClick={() => galleryFileInputRef.current?.click()}
                className="rounded-[24px] border-2 border-dashed border-[var(--border-neutral)] hover:border-[var(--primary-forest-green)] bg-[var(--bg-screen)]/60 hover:bg-[var(--bg-screen)] p-8 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="h-10 w-10 rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-center text-[var(--content-tertiary)] group-hover:text-[var(--primary-forest-green)] group-hover:border-[var(--primary-forest-green)] transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-[var(--content-primary)]">
                  Add more visual spreads or UI mockups
                </span>
                <span className="text-[11px] text-[var(--content-tertiary)]">
                  Supports PNG, JPG, WebP, GIF
                </span>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Delete Project Modal (In Edit Mode) */}
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
