"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Comment } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { getValidAvatarUrl } from "@/lib/avatar";
import { Send, MessageSquare } from "lucide-react";

interface CommentSectionProps {
  projectId: string;
  comments: Comment[];
}

export function CommentSection({ projectId, comments }: CommentSectionProps) {
  const router = useRouter();
  const { user, addComment } = useSession();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    addComment(projectId, commentText.trim());
    setCommentText("");
  };

  return (
    <section className="mt-8 border-t border-[var(--border-neutral)] pt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-[var(--primary-forest-green)]" />
        <h3 className="type-title-subsection text-[var(--content-primary)]">
          Feedback & Notes ({comments.length})
        </h3>
      </div>

      {/* Write Comment Form / Guest CTA */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[var(--border-neutral)] shrink-0">
                <Image
                  src={getValidAvatarUrl(user.avatarUrl)}
                  alt={user.displayName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave design critique, questions, or appreciation..."
                  rows={2}
                  className="w-full text-sm resize-none rounded-[16px]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    disabled={!commentText.trim()}
                    className="gap-1.5 font-bold shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Post Comment</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 sm:p-5 shadow-xs">
            <div>
              <p className="type-body-large-bold text-[var(--content-primary)]">
                Join the conversation
              </p>
              <p className="type-body-default text-[var(--content-secondary)] mt-0.5">
                Sign in to leave feedback and discuss craft with creators.
              </p>
            </div>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "accent",
                size: "sm",
              })}
            >
              Log in to Comment
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-[var(--content-tertiary)] type-body-default">
          No comments yet. Be the first to share an observation on this work.
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className="flex gap-4 p-4 rounded-[16px] bg-[var(--bg-screen)] border border-[var(--border-neutral)]"
            >
              <Link
                href={`/u/${c.author.username}`}
                className="relative h-10 w-10 shrink-0"
              >
                <div className="relative h-full w-full rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)]">
                  <Image
                    src={getValidAvatarUrl(c.author.avatarUrl)}
                    alt={c.author.displayName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <OnlineBadge userId={c.author.id} username={c.author.username} size="sm" className="absolute bottom-0 right-0 z-20" />
              </Link>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link
                    href={`/u/${c.author.username}`}
                    className="type-body-default-bold text-[var(--content-primary)] hover:text-[var(--primary-forest-green)] transition-colors flex items-center gap-1.5"
                  >
                    <span>{c.author.displayName}</span>
                    {c.author.isVerified !== false && <VerifiedBadge size="sm" />}
                  </Link>
                  <span className="type-label text-[var(--content-tertiary)]">
                    {c.createdAt}
                  </span>
                </div>
                <p className="mt-1.5 type-body-default text-[var(--content-secondary)] whitespace-pre-line">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
