"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  ShieldAlert,
  Image as ImageIcon,
  MessageSquare,
  Heart,
  Globe,
} from "lucide-react";
import { useSession } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { bricolage } from "@/lib/fonts";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
}: DeleteProjectModalProps) {
  const router = useRouter();
  const { deleteProject } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeleting || !projectId) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const success = await deleteProject(projectId);
      if (success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/me");
        }
      } else {
        setErrorMessage("Failed to delete project from database. Please try again.");
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(errorMsg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={!isDeleting ? onClose : undefined}
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-none z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-wide uppercase">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Irreversible Action</span>
            </div>

            <h2
              className={cn(
                bricolage.className,
                "text-2xl sm:text-3xl font-black text-[var(--content-primary)] tracking-tight leading-tight"
              )}
            >
              Delete Project Permanently?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-2 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description & Purge List */}
        <div className="mt-5 space-y-4">
          <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[var(--content-primary)] font-mono bg-[var(--bg-neutral)] px-2 py-0.5 rounded-md border border-[var(--border-neutral)]">
              &quot;{projectTitle}&quot;
            </span>
            ? Everything associated with this project will be permanently erased:
          </p>

          {/* Purge Checklist */}
          <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/40 p-4 space-y-2.5 text-xs text-[var(--content-secondary)]">
            <div className="flex items-center gap-2.5 text-[var(--content-primary)] font-medium">
              <ImageIcon className="h-4 w-4 text-rose-500 shrink-0" />
              <span>All uploaded case study images & high-res media</span>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--content-primary)] font-medium">
              <Heart className="h-4 w-4 text-rose-500 shrink-0" />
              <span>All community appreciations and likes</span>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--content-primary)] font-medium">
              <MessageSquare className="h-4 w-4 text-rose-500 shrink-0" />
              <span>All peer discussion comments & critique history</span>
            </div>
            <div className="flex items-center gap-2.5 text-[var(--content-primary)] font-medium">
              <Globe className="h-4 w-4 text-rose-500 shrink-0" />
              <span>Public explore showcase, search entries & profile cards</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-xs leading-relaxed text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span>
              This operation cannot be undone. You will need to re-upload and re-publish if you decide to restore it later.
            </span>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[var(--border-neutral)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto h-11 px-5 rounded-full text-xs font-bold text-[var(--content-secondary)] hover:text-[var(--content-primary)] bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral)]/80 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel & Keep Project
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-auto h-11 px-6 rounded-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting Project...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>I Understand, Delete Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
