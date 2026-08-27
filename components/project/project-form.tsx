"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Project, ProjectCategory, ProjectMedium } from "@/lib/mock";
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
} from "lucide-react";

interface ProjectFormProps {
  initialData?: Project;
  mode: "new" | "edit";
}

const CATEGORIES: ProjectCategory[] = [
  "UI",
  "Brand",
  "Photo",
  "Editorial",
  "3D & Motion",
  "Product",
  "Architecture",
  "Type",
];

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
  const [category, setCategory] = useState<ProjectCategory>(
    initialData?.category || "Brand"
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
    initialData?.tags || ["Brand", "Identity", "Design"]
  );
  const [newTag, setNewTag] = useState("");
  const [tools, setTools] = useState<string[]>(
    initialData?.tools || ["Figma", "InDesign"]
  );
  const [newTool, setNewTool] = useState("");
  const [published, setPublished] = useState(
    initialData ? initialData.published : true
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddTool = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      if (newTool.trim() && !tools.includes(newTool.trim())) {
        setTools([...tools, newTool.trim()]);
        setNewTool("");
      }
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

  // Direct File Upload Handlers (with Supabase Storage + Fast Compression)
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
    const finalCover = coverImage || galleryImages[0];
    if (!finalCover) {
      alert("Please upload a cover image for your project before saving.");
      return;
    }

    await saveProject({
      id: initialData?.id,
      title,
      summary,
      body,
      category,
      medium,
      coverImage: finalCover,
      galleryImages,
      tags,
      tools,
      published,
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push("/explore");
    }, 600);
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

          <Button type="submit" variant="accent" size="default" className="min-w-[140px]">
            {isSaved ? (
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
            <label className="type-title-subsection text-[var(--content-primary)] block mb-2">
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

          {/* Primary Category */}
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-2">
              Primary Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-all ${
                    category === cat
                      ? "bg-[var(--primary-forest-green)] text-[var(--base-contrast)] shadow-sm"
                      : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral-hover)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medium */}
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-2">
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
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Brief Summary (One or two lines)
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-2">
              Shown on cards and the project header.
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
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Project Case Study / Narrative
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-2">
              Supports multi-paragraph descriptions of your research, typography choices, and technical craft.
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
                <label className="type-body-default-bold text-[var(--content-primary)] block">
                  Exhibition Plates & Gallery Images
                </label>
                <p className="type-label text-[var(--content-tertiary)]">
                  Add high-fidelity spreads, closeups, and photography plates (rendered in intrinsic scale).
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
                "relative rounded-[20px] border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group",
                isDraggingGallery
                  ? "border-[var(--primary-forest-green)] bg-[var(--bg-neutral)]/60 scale-[0.99]"
                  : "border-[var(--border-neutral)] bg-[var(--bg-elevated)]/60 hover:bg-[var(--bg-neutral)]/40 hover:border-[var(--primary-forest-green)]/60"
              )}
            >
              {isProcessingFiles ? (
                <div className="flex flex-col items-center py-4 space-y-2 w-full max-w-xs mx-auto">
                  <Loader2 className="h-7 w-7 animate-spin text-[var(--primary-forest-green)] mb-1" />
                  <span className="text-sm font-bold text-[var(--content-primary)]">
                    {uploadProgress
                      ? `Uploading & optimizing ${uploadProgress.current} of ${uploadProgress.total} plates...`
                      : "Processing images..."}
                  </span>
                  {uploadProgress && (
                    <div className="w-full h-1.5 bg-[var(--bg-neutral)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary-forest-green)] transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  <span className="text-[11px] text-[var(--content-tertiary)]">
                    Compressing & storing in Supabase CDN
                  </span>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-neutral)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5 text-[var(--content-primary)]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-[var(--content-primary)]">
                      Drop image files here, or <span className="text-[var(--content-link)] underline">browse from your computer</span>
                    </p>
                    <p className="text-xs text-[var(--content-tertiary)]">
                      Select multiple PNG, JPG, or WebP files at once (automatically optimized)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* URL Input Strip for External CDNs */}
            <div className="flex gap-2 pt-1">
              <Input
                type="url"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGalleryImage();
                  }
                }}
                placeholder="Or paste an image URL (Unsplash, Behance, Cloudinary...)"
                className="text-xs h-11"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAddGalleryImage()}
                className="shrink-0 font-semibold h-11"
              >
                <Plus className="h-4 w-4 mr-1" /> Add URL
              </Button>
            </div>

            {/* Gallery Images Grid Preview */}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-[16px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shadow-xs"
                  >
                    <Image
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                      <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">
                        Plate #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGalleryImage(idx);
                        }}
                        className="rounded-full bg-[var(--negative)] text-white p-1 hover:scale-110 transition-transform cursor-pointer shadow-sm"
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
              <label className="type-body-default-bold text-[var(--content-primary)] block">
                Cover Image (Dominant Visual)
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
            <p className="type-label text-[var(--content-tertiary)] mb-4">
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
                  <span className="type-body-default-bold text-[var(--content-primary)]">
                    Upload Cover Image
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] mt-1 max-w-[220px]">
                    Click to browse or drop high-resolution image
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags & Disciplines */}
          <div className="rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs">
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Disciplines & Tags
            </label>
            <div className="flex gap-2 mt-2 mb-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (Press Enter)..."
                className="h-10 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTag}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-[var(--bg-neutral)] text-[var(--content-primary)] px-2.5 py-1 rounded-full text-xs font-semibold"
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
          </div>

          {/* Tools & Mediums */}
          <div className="rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs">
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Tools & Software
            </label>
            <div className="flex gap-2 mt-2 mb-3">
              <Input
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyDown={handleAddTool}
                placeholder="e.g. Figma, Houdini..."
                className="h-10 text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddTool}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 bg-[var(--accent)] text-[var(--primary-forest-green)] px-2.5 py-1 rounded-full text-xs font-semibold"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool)}
                    className="hover:text-[var(--negative)] ml-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
