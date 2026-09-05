"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { ProjectCard } from "@/components/project/project-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { toast } from "@/components/ui/toast";
import {
  Lock,
  Globe,
  Share2,
  Edit3,
  Trash2,
  FolderPlus,
  Compass,
  X,
  Loader2,
  User,
} from "lucide-react";
import { Board, Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getValidAvatarUrl } from "@/lib/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { motion, AnimatePresence } from "framer-motion";

interface BoardDetailClientProps {
  initialBoard: Board;
  initialProjects: Project[];
}

export function BoardDetailClient({
  initialBoard,
  initialProjects,
}: BoardDetailClientProps) {
  const router = useRouter();
  const {
    user,
    updateBoard,
    deleteBoard,
    toggleProjectInBoard,
  } = useSession();

  const [board, setBoard] = useState<Board>(initialBoard);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const isOwner = user && user.id === board.userId;

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [editDescription, setEditDescription] = useState(board.description || "");
  const [editIsPrivate, setEditIsPrivate] = useState(board.isPrivate);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAnyModalOpen = isEditOpen || isDeleteOpen;

  // ESC key and body scroll lock
  React.useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (!isUpdating && isEditOpen) setIsEditOpen(false);
          if (!isDeleting && isDeleteOpen) setIsDeleteOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isAnyModalOpen, isUpdating, isEditOpen, isDeleting, isDeleteOpen]);

  // Share Board
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Board URL copied to clipboard.", "Link copied!");
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      setIsUpdating(true);
      const updated = await updateBoard(board.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        isPrivate: editIsPrivate,
      });

      if (updated) {
        setBoard((prev) => ({
          ...prev,
          title: editTitle.trim(),
          description: editDescription.trim(),
          isPrivate: editIsPrivate,
        }));
        toast.success("Your board changes have been saved.", "Board Updated");
        setIsEditOpen(false);
      } else {
        toast.error("Could not save board changes.", "Update failed");
      }
    } catch {
      toast.error("Failed to update board.", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit Delete
  const handleDeleteSubmit = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteBoard(board.id);
      if (success) {
        toast.success("Board has been permanently removed.", "Board Deleted");
        router.push("/boards");
      } else {
        toast.error("Could not delete this board.", "Delete failed");
      }
    } catch {
      toast.error("An error occurred while deleting the board.", "Error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Remove Project from Board
  const handleRemoveProject = async (projectId: string) => {
    const success = await toggleProjectInBoard(board.id, projectId);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.info("Item removed from this board.", "Project Removed");
    }
  };

  const creatorName =
    board.creator?.displayName ||
    (isOwner ? user?.displayName : null) ||
    "Craft Creator";
  const creatorAvatar =
    board.creator?.avatarUrl ||
    (isOwner ? user?.avatarUrl : null);

  return (
    <div className="min-h-screen bg-[var(--bg-screen)] pb-24">
      {/* Top Header Section */}
      <div className="border-b border-[var(--border-neutral)] bg-[var(--bg-elevated)]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "My Boards", href: "/boards" },
              { label: board.title, href: `/boards/${board.id}` },
            ]}
          />

          <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-2xl">
              {/* Privacy & Scope Badges */}
              <div className="flex items-center gap-2 mb-3">
                {board.isPrivate ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Private Board</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Globe className="h-3.5 w-3.5" />
                    <span>Public Board</span>
                  </span>
                )}
                <span className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3 py-1 text-xs font-bold text-[var(--content-primary)]">
                  {projects.length} {projects.length === 1 ? "project" : "projects"}
                </span>
              </div>

              {/* Board Title */}
              <h1
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--content-primary)]"
                )}
              >
                {board.title}
              </h1>

              {/* Description */}
              {board.description && (
                <p className="mt-3 text-sm sm:text-base text-[var(--content-secondary)] leading-relaxed">
                  {board.description}
                </p>
              )}

              {/* Creator Attribution */}
              <div className="mt-5 flex items-center gap-2.5">
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)]">
                  <Image
                    src={getValidAvatarUrl(creatorAvatar)}
                    alt={creatorName}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--content-primary)]">
                  <span>Curated by {creatorName}</span>
                  {board.creator?.isVerified !== false && <VerifiedBadge size="sm" />}
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-4 py-2 text-xs font-semibold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTitle(board.title);
                      setEditDescription(board.description || "");
                      setEditIsPrivate(board.isPrivate);
                      setIsEditOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-4 py-2 text-xs font-semibold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Board</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {projects.length === 0 ? (
          // Empty Board State
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 sm:p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--content-tertiary)] mb-5 border border-[var(--border-neutral)]">
                <FolderPlus className="h-8 w-8" />
              </div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                This board is empty
              </h2>
              <p className="mt-2 text-sm text-[var(--content-secondary)] max-w-md">
                Browse our curated directory of creative case studies, click the Bookmark icon, and add work to &ldquo;{board.title}&rdquo;.
              </p>
              <div className="mt-6">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] px-6 py-2.5 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <Compass className="h-4 w-4" />
                  <span>Explore Design Showcase</span>
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : (
          // Projects Grid with Owner Quick-Remove Option
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project, idx) => (
              <StaggerGridItem key={project.id} index={idx}>
                <div className="relative group/boarditem">
                  <ProjectCard project={project} />

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(project.id)}
                      className="absolute top-3 left-3 z-30 opacity-0 group-hover/boarditem:opacity-100 transition-opacity flex h-8 w-8 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white/90 hover:text-white hover:bg-red-600 border border-white/20 shadow-md cursor-pointer"
                      title="Remove from this board"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </StaggerGridItem>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isUpdating && setIsEditOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className="relative w-full max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] shadow-[0_24px_60px_rgba(0,0,0,0.25)] overflow-hidden z-10 flex flex-col pb-safe sm:pb-0"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-2.5 pb-1 shrink-0 bg-[var(--bg-elevated)]">
                <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
              </div>

              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border-neutral)] flex items-start justify-between gap-3 bg-[var(--bg-neutral)]/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-primary)] shrink-0 shadow-xs">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={cn(bricolage.className, "text-base sm:text-lg font-bold text-[var(--content-primary)] truncate")}>
                      Edit Board
                    </h3>
                    <p className="text-xs text-[var(--content-secondary)] truncate">
                      Update title, description, or privacy settings
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                    Board Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-2.5 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:outline-none focus:border-[var(--content-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                    Description <span className="text-[var(--content-tertiary)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-2 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:outline-none focus:border-[var(--content-primary)] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-neutral)] p-3 border border-[var(--border-neutral)]">
                  <div className="flex items-center gap-2.5">
                    {editIsPrivate ? (
                      <Lock className="h-4 w-4 text-[var(--content-secondary)]" />
                    ) : (
                      <Globe className="h-4 w-4 text-[var(--content-secondary)]" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-[var(--content-primary)]">
                        {editIsPrivate ? "Private Board" : "Public Board"}
                      </div>
                      <div className="text-[11px] text-[var(--content-tertiary)]">
                        {editIsPrivate
                          ? "Only you can see this board"
                          : "Visible on your public studio profile"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditIsPrivate(!editIsPrivate)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      editIsPrivate ? "bg-[var(--content-primary)]" : "bg-gray-300 dark:bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        editIsPrivate ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-neutral)]">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isUpdating}
                    className="h-9 px-4 rounded-full text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isUpdating || !editTitle.trim()}
                    className="h-9 px-5 rounded-full text-xs font-bold"
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isDeleting && setIsDeleteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className="relative w-full max-w-sm rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)] z-10 text-center pb-safe sm:pb-7"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-1 pb-3 -mt-2 shrink-0">
                <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
              </div>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20 shadow-xs">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
                Delete &ldquo;{board.title}&rdquo;?
              </h3>
              <p className="mt-2 text-xs text-[var(--content-secondary)] leading-relaxed">
                This board collage and its list of items will be permanently removed.
              </p>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isDeleting}
                  className="w-full sm:w-auto h-10 px-5 rounded-full text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral)]/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="w-full sm:w-auto h-10 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Board"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
