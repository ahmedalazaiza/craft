"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { BoardCard } from "@/components/board/board-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerGridItem } from "@/components/ui/motion-wrapper";
import { toast } from "@/components/ui/toast";
import {
  LayoutGrid,
  Plus,
  Lock,
  Globe,
  X,
  Loader2,
  FolderPlus,
  Trash2,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Board } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BoardsClient() {
  const router = useRouter();
  const {
    user,
    boards,
    isBoardsLoading,
    createBoard,
    updateBoard,
    deleteBoard,
    openVerificationModal,
  } = useSession();

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal state
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirm state
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAnyModalOpen = isCreateOpen || !!editingBoard || !!deletingBoardId;

  // ESC key and body scroll lock
  React.useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (!isCreating && isCreateOpen) setIsCreateOpen(false);
          if (!isUpdating && editingBoard) setEditingBoard(null);
          if (!isDeleting && deletingBoardId) setDeletingBoardId(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isAnyModalOpen, isCreating, isCreateOpen, isUpdating, editingBoard, isDeleting, deletingBoardId]);

  // Handler: Open Create Modal
  const handleOpenCreate = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.isVerified === false) {
      openVerificationModal("board", "new board");
      return;
    }
    setNewTitle("");
    setNewDescription("");
    setNewIsPrivate(false);
    setIsCreateOpen(true);
  };

  // Handler: Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsCreating(true);
      const created = await createBoard(
        newTitle.trim(),
        newDescription.trim() || undefined,
        newIsPrivate
      );
      if (created) {
        toast.success(`"${created.title}" is ready for projects!`, "Board Created");
        setIsCreateOpen(false);
      } else {
        toast.error("Please check your network and try again.", "Failed to create board");
      }
    } catch {
      toast.error("An unexpected error occurred while creating the board.", "Error");
    } finally {
      setIsCreating(false);
    }
  };

  // Handler: Open Edit Modal
  const handleOpenEdit = (board: Board) => {
    setEditingBoard(board);
    setEditTitle(board.title);
    setEditDescription(board.description || "");
    setEditIsPrivate(board.isPrivate);
  };

  // Handler: Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editTitle.trim()) return;

    try {
      setIsUpdating(true);
      const updated = await updateBoard(editingBoard.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        isPrivate: editIsPrivate,
      });

      if (updated) {
        toast.success("Your board changes have been saved.", "Board Updated");
        setEditingBoard(null);
      } else {
        toast.error("Could not save board changes.", "Update failed");
      }
    } catch {
      toast.error("Failed to update board.", "Error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler: Confirm & Delete
  const handleConfirmDelete = async () => {
    if (!deletingBoardId) return;
    try {
      setIsDeleting(true);
      const success = await deleteBoard(deletingBoardId);
      if (success) {
        toast.success("The board and its collection items have been removed.", "Board Deleted");
        setDeletingBoardId(null);
      } else {
        toast.error("Please try again later.", "Failed to delete board");
      }
    } catch {
      toast.error("An error occurred while deleting the board.", "Error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-screen)] pb-24">
      {/* Top Header Section */}
      <div className="border-b border-[var(--border-neutral)] bg-[var(--bg-elevated)]/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "My Boards", href: "/boards" },
            ]}
          />

          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-3 border border-[var(--border-neutral)]">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Visual Moodboards & Collections</span>
              </div>
              <h1
                className={cn(
                  bricolage.className,
                  "text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--content-primary)]"
                )}
              >
                My Boards
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--content-secondary)] max-w-2xl">
                Curate design inspirations, assemble creative moodboards, and organize monographs into customized visual collections.
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-1.5 text-xs font-bold text-[var(--content-primary)]">
                  {boards.length} {boards.length === 1 ? "board" : "boards"}
                </div>
                <Button
                  onClick={handleOpenCreate}
                  className="rounded-full px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Board</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Boards Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {isBoardsLoading ? (
          // Skeletons
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-[24px] bg-[var(--bg-neutral)] animate-pulse border border-[var(--border-neutral)]"
              />
            ))}
          </div>
        ) : !user ? (
          // Logged Out State
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 sm:p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--content-tertiary)] mb-5 border border-[var(--border-neutral)]">
                <LayoutGrid className="h-8 w-8" />
              </div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                Sign in to manage your boards
              </h2>
              <p className="mt-2 text-sm text-[var(--content-secondary)] max-w-md">
                Create visual collages, moodboards, and customized design project sets saved directly to your profile.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--content-primary)] text-[var(--bg-screen)] px-6 py-2.5 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity inline-block"
                >
                  Sign in to Craft
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : boards.length === 0 ? (
          // Empty State
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 sm:p-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--content-tertiary)] mb-5 border border-[var(--border-neutral)]">
                <FolderPlus className="h-8 w-8" />
              </div>
              <h2 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
                You haven&apos;t created any boards yet
              </h2>
              <p className="mt-2 text-sm text-[var(--content-secondary)] max-w-md">
                Boards let you group case studies into 2x2 visual collages for client presentations, design sprints, or personal inspiration.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={handleOpenCreate}
                  className="rounded-full px-6 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Board</span>
                </Button>
                <Link
                  href="/explore"
                  className="rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-6 py-2.5 text-xs font-semibold text-[var(--content-primary)] hover:border-[var(--content-primary)] transition-colors"
                >
                  Explore Projects
                </Link>
              </div>
            </div>
          </FadeIn>
        ) : (
          // Boards Grid
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board, idx) => (
              <StaggerGridItem key={board.id} index={idx}>
                <BoardCard
                  board={board}
                  creatorName={user.displayName}
                  onDelete={(id) => setDeletingBoardId(id)}
                  onEdit={(b) => handleOpenEdit(b)}
                />
              </StaggerGridItem>
            ))}
          </div>
        )}
      </div>

      {/* CREATE BOARD MODAL */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isCreating && setIsCreateOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className="relative w-full max-w-md rounded-t-[32px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] shadow-[0_24px_60px_rgba(0,0,0,0.25)] overflow-hidden z-10 flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-0"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-3 pb-2 shrink-0 bg-[var(--bg-elevated)]">
                <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
              </div>

              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border-neutral)] flex items-start justify-between gap-3 bg-[var(--bg-neutral)]/30">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] text-[var(--content-primary)] shrink-0 shadow-xs">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={cn(bricolage.className, "text-base sm:text-lg font-bold text-[var(--content-primary)] truncate")}>
                      Create New Board
                    </h3>
                    <p className="text-xs text-[var(--content-secondary)] truncate">
                      Curate case studies into visual moodboards
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-4 sm:p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                    Board Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Mobile App UI, Brand Concepts, 3D Renders..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-2.5 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:outline-none focus:border-[var(--content-primary)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--content-primary)] mb-1.5">
                    Description <span className="text-[var(--content-tertiary)] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe the theme or purpose of this board..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-3.5 py-2 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:outline-none focus:border-[var(--content-primary)] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-[var(--bg-neutral)] p-3 border border-[var(--border-neutral)]">
                  <div className="flex items-center gap-2.5">
                    {newIsPrivate ? (
                      <Lock className="h-4 w-4 text-[var(--content-secondary)]" />
                    ) : (
                      <Globe className="h-4 w-4 text-[var(--content-secondary)]" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-[var(--content-primary)]">
                        {newIsPrivate ? "Private Board" : "Public Board"}
                      </div>
                      <div className="text-[11px] text-[var(--content-tertiary)]">
                        {newIsPrivate
                          ? "Only you can see this board"
                          : "Visible on your public studio profile"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewIsPrivate(!newIsPrivate)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      newIsPrivate ? "bg-[var(--content-primary)]" : "bg-gray-300 dark:bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        newIsPrivate ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-neutral)]">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isCreating}
                    className="h-9 px-4 rounded-full text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newTitle.trim()}
                    className="h-9 px-5 rounded-full text-xs font-bold gap-1.5"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Board</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT BOARD MODAL */}
      <AnimatePresence>
        {editingBoard && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isUpdating && setEditingBoard(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className="relative w-full max-w-md rounded-t-[32px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] shadow-[0_24px_60px_rgba(0,0,0,0.25)] overflow-hidden z-10 flex flex-col pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:pb-0"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-3 pb-2 shrink-0 bg-[var(--bg-elevated)]">
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
                  onClick={() => setEditingBoard(null)}
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
                    onClick={() => setEditingBoard(null)}
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

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingBoardId && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => !isDeleting && setDeletingBoardId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)] z-10 text-center pb-[calc(env(safe-area-inset-bottom,0px)+20px)] sm:pb-7"
            >
              {/* Mobile Pull Handle Indicator */}
              <div className="flex sm:hidden justify-center pt-3 pb-2 shrink-0">
                <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
              </div>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-4 border border-rose-500/20 shadow-xs">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
                Delete this board?
              </h3>
              <p className="mt-2 text-xs text-[var(--content-secondary)] leading-relaxed">
                This action cannot be undone. The projects inside will remain intact on Craft, but the board collage will be permanently removed.
              </p>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingBoardId(null)}
                  disabled={isDeleting}
                  className="w-full sm:w-auto h-10 px-5 rounded-full text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral)]/80 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
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
