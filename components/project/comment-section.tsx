"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { Comment } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
    if (!user) {
      router.push("/login");
      return;
    }
    if (!commentText.trim()) return;

    addComment(projectId, commentText.trim());
    setCommentText("");
  };

  return (
    <section className="mt-16 border-t border-[var(--border-neutral)] pt-12">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-5 w-5 text-[var(--primary-forest-green)]" />
        <h2 className="type-title-section text-[var(--content-primary)]">
          Discussion & Critique ({comments.length})
        </h2>
      </div>

      {/* Composer */}
      <div className="mb-10 rounded-[20px] bg-[var(--bg-neutral)]/30 border border-[var(--border-neutral)] p-5 sm:p-6">
        {user ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 rounded-full overflow-hidden bg-[var(--bg-neutral)]">
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="type-body-default-bold text-[var(--content-primary)]">
                Commenting as {user.displayName}
              </span>
            </div>

            <Textarea
              placeholder="Share thoughts, technical observations, or feedback..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[90px]"
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!commentText.trim()}
                className="gap-2"
              >
                <span>Post Comment</span>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 text-center sm:text-left">
            <div>
              <p className="type-body-large-bold text-[var(--content-primary)]">
                Join the conversation
              </p>
              <p className="type-body-default text-[var(--content-secondary)] mt-0.5">
                Sign in to leave feedback and discuss craft with creators.
              </p>
            </div>
            <Link href="/login">
              <Button variant="accent" size="sm">
                Log in to Comment
              </Button>
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
                className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)]"
              >
                <Image
                  src={c.author.avatarUrl}
                  alt={c.author.displayName}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Link
                    href={`/u/${c.author.username}`}
                    className="type-body-default-bold text-[var(--content-primary)] hover:text-[var(--primary-forest-green)] transition-colors"
                  >
                    {c.author.displayName}
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
