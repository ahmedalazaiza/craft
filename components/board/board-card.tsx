"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Board } from "@/lib/types";
import { Lock, Globe, MoreVertical, Trash2, Edit3, FolderHeart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  board: Board;
  creatorName?: string;
  onDelete?: (boardId: string) => void;
  onEdit?: (board: Board) => void;
}

export function BoardCard({ board, creatorName, onDelete, onEdit }: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const covers = board.coverImages || [];
  const count = board.itemsCount ?? 0;
  const displayName = creatorName || board.creator?.displayName || "Layerat Creator";

  return (
    <div className="group relative flex flex-col rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] overflow-hidden hover:border-[var(--border-strong)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
      {/* Visual Collage Cover Area */}
      <Link
        href={`/boards/${board.id}`}
        prefetch={true}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[var(--bg-neutral)]"
      >
        {/* Collage Display Logic */}
        {covers.length === 0 ? (
          // Empty State
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-neutral)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] mb-3 text-[var(--content-tertiary)] group-hover:scale-105 group-hover:text-[var(--content-primary)] transition-all duration-300">
              <FolderHeart className="h-7 w-7" />
            </div>
            <span className="text-xs font-medium text-[var(--content-tertiary)]">
              Empty Board
            </span>
          </div>
        ) : covers.length === 1 ? (
          // Single Image
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={covers[0]}
              alt={board.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : covers.length === 2 ? (
          // 2 Images Split Grid
          <div className="grid h-full w-full grid-cols-2 gap-0.5">
            {covers.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative h-full w-full overflow-hidden bg-black/5">
                <Image
                  src={img}
                  alt={`${board.title} cover ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        ) : covers.length === 3 ? (
          // 3 Images: 1 large on left, 2 stacked on right
          <div className="grid h-full w-full grid-cols-2 gap-0.5">
            <div className="relative h-full w-full overflow-hidden bg-black/5">
              <Image
                src={covers[0]}
                alt={`${board.title} cover 1`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="grid h-full w-full grid-rows-2 gap-0.5">
              {covers.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative h-full w-full overflow-hidden bg-black/5">
                  <Image
                    src={img}
                    alt={`${board.title} cover ${idx + 2}`}
                    fill
                    sizes="(max-width: 640px) 25vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // 4+ Images: 2x2 collage matching the user's reference screenshot
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {covers.slice(0, 4).map((img, idx) => (
              <div key={idx} className="relative h-full w-full overflow-hidden bg-black/5">
                <Image
                  src={img}
                  alt={`${board.title} cover ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Scrim Overlay for Contrast with Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/60 pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

        {/* Top-Left: Board Title & Creator Name (Exact Reference Screenshot Layout) */}
        <div className="absolute top-4 left-4 right-14 pointer-events-none z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight line-clamp-1 drop-shadow-md">
            {board.title}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow-sm line-clamp-1 mt-0.5">
            {displayName}
          </p>
        </div>

        {/* Top-Right: Privacy Icon Badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
          {board.isPrivate ? (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/90 border border-white/10"
              title="Private Board"
            >
              <Lock className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/90 border border-white/10"
              title="Public Board"
            >
              <Globe className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        {/* Bottom-Right: Project Count Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/15 shadow-sm">
            {count} {count === 1 ? "project" : "projects"}
          </span>
        </div>
      </Link>

      {/* Card Details Footer Bar */}
      <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border-neutral)]">
        <div className="min-w-0 flex-1 pr-2">
          {board.description ? (
            <p className="text-xs text-[var(--content-secondary)] line-clamp-1">
              {board.description}
            </p>
          ) : (
            <p className="text-xs text-[var(--content-tertiary)] italic">
              No description added
            </p>
          )}
        </div>

        {/* Options Context Menu */}
        {(onDelete || onEdit) && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 sm:h-8 sm:w-8 min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
              aria-label="Board options"
            >
              <MoreVertical className="h-4.5 w-4.5 sm:h-4 sm:w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-1.5 w-36 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xl p-1 z-50 divide-y divide-[var(--border-neutral)]">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(board);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Board</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(board.id);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
