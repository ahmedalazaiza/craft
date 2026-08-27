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
import {
  UploadCloud,
  Check,
  ArrowLeft,
  Plus,
  X,
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

const SAMPLE_COVERS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&auto=format&fit=crop&q=85",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&auto=format&fit=crop&q=85",
];

export function ProjectForm({ initialData, mode }: ProjectFormProps) {
  const router = useRouter();
  const { saveProject } = useSession();

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
    initialData?.coverImage || SAMPLE_COVERS[0]
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

  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGalleryUrl.trim()) {
      setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProject({
      id: initialData?.id,
      title,
      summary,
      body,
      category,
      medium,
      coverImage,
      galleryImages,
      tags,
      tools,
      published,
    });

    setIsSaved(true);
    setTimeout(() => {
      router.push("/me");
    }, 500);
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
          <div>
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Exhibition Plates & Gallery Images
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-3">
              Add supplementary spreads, closeups, and photography URLs (rendered in intrinsic scale).
            </p>

            <div className="flex gap-2 mb-4">
              <Input
                type="url"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddGalleryImage}
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Plate
              </Button>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-[12px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)]"
                  >
                    <Image
                      src={url}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      sizes="180px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-[var(--negative)] text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Visual Cover Dropzone & Metadata */}
        <div className="space-y-8">
          {/* Cover Dropzone */}
          <div className="rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] p-6 shadow-xs">
            <label className="type-body-default-bold text-[var(--content-primary)] block mb-1">
              Cover Image (Dominant Visual)
            </label>
            <p className="type-label text-[var(--content-tertiary)] mb-4">
              Visual dropzone & curated monograph presets.
            </p>

            {/* Visual Cover Dropzone */}
            <div className="relative aspect-[4/3] w-full rounded-[16px] overflow-hidden bg-[var(--bg-neutral)] border-2 border-dashed border-[var(--border-neutral)] flex flex-col items-center justify-center p-4 text-center group transition-colors hover:border-[var(--accent)]">
              {coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    fill
                    sizes="320px"
                    className="object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-[var(--content-primary)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full">
                      Change Cover Below
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="h-8 w-8 text-[var(--content-tertiary)] mb-2" />
                  <span className="type-body-default-bold text-[var(--content-primary)]">
                    Drag & drop cover file
                  </span>
                  <span className="type-label text-[var(--content-tertiary)] mt-1">
                    PNG, JPG, WebP up to 10MB
                  </span>
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="mt-4">
              <span className="type-label text-[var(--content-tertiary)] block mb-2">
                Or select from architectural presets:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_COVERS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCoverImage(url)}
                    className={`relative aspect-square rounded-[8px] overflow-hidden border-2 cursor-pointer transition-all ${
                      coverImage === url
                        ? "border-[var(--primary-forest-green)] ring-2 ring-[var(--accent)]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Preset ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <Input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Custom image URL..."
                className="text-xs h-10"
              />
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
