"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Project, Board } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import {
  X,
  Plus,
  Check,
  Lock,
  Globe,
  Bookmark,
  FolderPlus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { fetchProjectBoards } from "@/lib/supabase/queries";

interface AddToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function AddToBoardModal({ isOpen, onClose, project }: AddToBoardModalProps) {
  const {
    user,
    boards,
    createBoard,
    toggleProjectInBoard,
    openVerificationModal,
  } = useSession();

  const [activeBoardIds, setActiveBoardIds] = useState<Set<string>>(new Set());
  const [isLoadingMembership, setIsLoadingMembership] = useState(false);
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Load which of the user's boards contain this project
  useEffect(() => {
    if (!isOpen || !project || !user) {
      setActiveBoardIds(new Set());
      return;
    }

    let isMounted = true;
    setIsLoadingMembership(true);

    fetchProjectBoards(user.id, project.id)
      .then((boardIds) => {
        if (isMounted) {
          setActiveBoardIds(new Set(boardIds));
        }
      })
      .catch((err) => {
        console.error("Error checking board membership:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMembership(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, project, user]);

  // Lock body scroll and close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const handleToggleBoard = async (board: Board) => {
    if (!user || !user.isVerified) {
      openVerificationModal("board", project.title);
      return;
    }

    const wasInBoard = activeBoardIds.has(board.id);

    // Optimistically update local membership
    setActiveBoardIds((prev) => {
      const next = new Set(prev);
      if (wasInBoard) {
        next.delete(board.id);
      } else {
        next.add(board.id);
      }
      return next;
    });

    try {
      const success = await toggleProjectInBoard(board.id, project.id);
      if (success) {
        if (wasInBoard) {
          toast.info(`Removed from "${board.title}"`, "Board Updated");
        } else {
          toast.success(`Added to "${board.title}"`, "Saved to Board");
        }
      } else {
        // Revert on failure
        setActiveBoardIds((prev) => {
          const next = new Set(prev);
          if (wasInBoard) {
            next.add(board.id);
          } else {
            next.delete(board.id);
          }
          return next;
        });
        toast.error("Failed to update board. Please try again.", "Error");
      }
    } catch {
      toast.error("Could not update board.", "Error");
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isSubmittingNew) return;

    if (!user || !user.isVerified) {
      openVerificationModal("board", project.title);
      return;
    }

    try {
      setIsSubmittingNew(true);
      const created = await createBoard(newTitle.trim(), undefined, isPrivate);
      if (created) {
        await toggleProjectInBoard(created.id, project.id);
        setActiveBoardIds((prev) => new Set(prev).add(created.id));
        toast.success(`Board "${created.title}" created & project added!`, "Board Ready");
        setNewTitle("");
        setIsCreatingInline(false);
      } else {
        toast.error("Failed to create board.", "Error");
      }
    } catch {
      toast.error("Could not create board. Please try again.", "Error");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 360 }}
          className="relative w-full max-w-md rounded-t-[28px] sm:rounded-[28px] bg-[var(--bg-elevated)] border-t sm:border border-[var(--border-neutral)] shadow-[0_24px_60px_rgba(0,0,0,0.25)] overflow-hidden z-10 flex flex-col max-h-[88vh] pb-safe sm:pb-0"
        >
          {/* Mobile Pull Handle Indicator */}
          <div className="flex sm:hidden justify-center pt-2 pb-1 shrink-0 bg-[var(--bg-elevated)]">
            <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
          </div>

          {/* Header with Project Quick Preview */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-neutral)] flex items-start justify-between gap-3 bg-[var(--bg-neutral)]/40">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 rounded-[14px] overflow-hidden bg-[var(--bg-neutral)] border border-[var(--border-neutral)] shrink-0 shadow-xs">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--content-tertiary)] flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  <span>Add to Board</span>
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[var(--content-primary)] truncate mt-0.5">
                  {project.title}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        {/* Existing Boards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          {isLoadingMembership ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--content-tertiary)]">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--content-primary)] mb-2" />
              <p className="text-xs font-medium">Loading your creative boards...</p>
            </div>
          ) : boards.length === 0 && !isCreatingInline ? (
            <div className="text-center py-8 px-4 rounded-[18px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-neutral)]/30">
              <div className="h-10 w-10 mx-auto rounded-full bg-[var(--bg-neutral)] flex items-center justify-center text-[var(--content-secondary)] mb-2.5">
                <FolderPlus className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[var(--content-primary)]">No boards yet</h3>
              <p className="text-xs text-[var(--content-secondary)] mt-1 max-w-[240px] mx-auto">
                Create your first creative board to organize and curate your inspiration.
              </p>
              <Button
                size="sm"
                variant="accent"
                onClick={() => setIsCreatingInline(true)}
                className="mt-3.5 gap-1.5 font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Board</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--content-tertiary)] uppercase tracking-wider px-1">
                Your Boards ({boards.length})
              </span>

              {boards.map((b) => {
                const isSelected = activeBoardIds.has(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleToggleBoard(b)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 p-3 rounded-[16px] transition-all text-left cursor-pointer border",
                      isSelected
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] border-[var(--chip-fg)]/20 shadow-xs"
                        : "bg-[var(--bg-elevated)] text-[var(--content-primary)] border-[var(--border-neutral)] hover:bg-[var(--bg-neutral)]/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors",
                          isSelected
                            ? "bg-[var(--chip-fg)] text-[var(--chip-bg)]"
                            : "bg-[var(--bg-neutral)] text-[var(--content-secondary)]"
                        )}
                      >
                        {isSelected ? <Check className="h-4 w-4 stroke-[3]" /> : <Bookmark className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate">{b.title}</span>
                          {b.isPrivate ? (
                            <span title="Private board"><Lock className="h-3 w-3 opacity-60 shrink-0" /></span>
                          ) : (
                            <span title="Public board"><Globe className="h-3 w-3 opacity-40 shrink-0" /></span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--content-tertiary)] font-medium">
                          {b.itemsCount ?? 0} {b.itemsCount === 1 ? "project" : "projects"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors",
                        isSelected
                          ? "bg-[var(--chip-fg)]/15 text-current"
                          : "text-[var(--content-tertiary)] group-hover:text-[var(--content-primary)]"
                      )}
                    >
                      {isSelected ? "Saved" : "Add"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline Create Board Form */}
          {isCreatingInline && (
            <form
              onSubmit={handleCreateAndAdd}
              className="mt-3 p-3.5 rounded-[18px] bg-[var(--bg-neutral)]/60 border border-[var(--border-neutral)] space-y-3 animate-scale-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--content-primary)] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Create New Board</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="text-xs text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Mobile App UI, Brand Systems..."
                autoFocus
                maxLength={60}
                required
                className="w-full h-10 px-3.5 rounded-[12px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--content-primary)]"
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--content-secondary)]">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-[var(--border-neutral)] text-[var(--content-primary)] focus:ring-0"
                  />
                  <span>Make this board private</span>
                </label>

                <Button
                  type="submit"
                  size="sm"
                  variant="accent"
                  disabled={!newTitle.trim() || isSubmittingNew}
                  className="font-bold gap-1 px-3.5"
                >
                  {isSubmittingNew ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Create & Add</span>
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer: Trigger to open Inline Create */}
        {!isCreatingInline && boards.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-[var(--border-neutral)] bg-[var(--bg-neutral)]/20">
            <button
              type="button"
              onClick={() => setIsCreatingInline(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[14px] text-xs font-bold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Board</span>
            </button>
          </div>
        )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
