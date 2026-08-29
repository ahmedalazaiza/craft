"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-rose-500/30 bg-[var(--bg-elevated)] p-6 sm:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-none z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <Trash2 className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h2
                className={cn(
                  bricolage.className,
                  "text-xl sm:text-2xl font-black text-[var(--content-primary)] tracking-tight"
                )}
              >
                Delete Case Study
              </h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" />
                Permanent Action
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-1.5 text-[var(--content-tertiary)] hover:bg-[var(--bg-neutral)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <div className="mt-5 space-y-4">
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[var(--content-primary)] font-mono bg-[var(--bg-neutral)] px-2 py-0.5 rounded-md border border-[var(--border-neutral)]">
              &quot;{projectTitle}&quot;
            </span>
            ? This action cannot be undone and will permanently erase this case study, high-resolution media gallery, and all peer appreciations.
          </p>

          {/* Warning Banner */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs leading-relaxed text-rose-700 dark:text-rose-300 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span>
              Once deleted, your project URL will be removed from explore galleries, search indexes, and your public profile.
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
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto font-semibold text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full sm:w-auto gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting Project...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Project</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
