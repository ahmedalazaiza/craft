"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { CommunityPost } from "@/lib/types";
import { useSession } from "@/lib/session-context";
import { getValidAvatarUrl } from "@/lib/avatar";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { EditPostModal } from "@/components/community/edit-post-modal";
import { VisualsCarousel } from "@/components/community/visuals-carousel";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Share2,
  Check,
  Send,
  Clock,
  Scale,
  BarChart2,
  Image as ImageIcon,
  MessageCircle,
  Copy,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CommunityCardProps {
  post: CommunityPost;
}

export function CommunityCard({ post }: CommunityCardProps) {
  const {
    user,
    likeCommunityPost,
    voteCommunityPost,
    addCommunityComment,
    deleteCommunityPost,
    followingCreatorIds,
    toggleFollowCreator,
  } = useSession();

  const [mounted, setMounted] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likeParticles, setLikeParticles] = useState<number[]>([]);

  // 3-dots menu & modal states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const isAuthor =
    user?.id === post.author.id ||
    (user?.username &&
      post.author.username &&
      user.username.toLowerCase() === post.author.username.toLowerCase());

  const userLikes = post.userLikes || 0;
  const isMaxLikes = userLikes >= 10;
  const isFollowingAuthor = post.author?.id ? followingCreatorIds.has(post.author.id) : false;

  const handleLike = () => {
    if (isMaxLikes) return;
    likeCommunityPost(post.id);
    const id = Date.now();
    setLikeParticles((prev) => [...prev, id]);
    setTimeout(() => {
      setLikeParticles((prev) => prev.filter((item) => item !== id));
    }, 900);
  };

  const handleVote = (optionId: string) => {
    voteCommunityPost(post.id, optionId);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/community#${post.id}` : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url,
        });
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCommunityPost(post.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addCommunityComment(post.id, commentInput.trim());
      setCommentInput("");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTime = (isoString: string) => {
    if (!mounted) {
      return "Recently";
    }
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Calculate A/B percentages
  const abTotalVotes = (post.abTest?.optionA.votesCount || 0) + (post.abTest?.optionB.votesCount || 0);
  const optAPercent = abTotalVotes > 0 ? Math.round(((post.abTest?.optionA.votesCount || 0) / abTotalVotes) * 100) : 50;
  const optBPercent = abTotalVotes > 0 ? 100 - optAPercent : 50;

  return (
    <article
      id={post.id}
      className="group relative rounded-3xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-5 sm:p-6 shadow-xs hover:border-[var(--border-strong)] transition-all duration-200 flex flex-col gap-4"
    >
      {/* 1. Header: Author Meta & Category */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/u/${post.author.username}`}
            className="relative h-10 w-10 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-1 ring-[var(--border-neutral)] shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src={getValidAvatarUrl(post.author.avatarUrl)}
              alt={post.author.displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/u/${post.author.username}`}
                className="font-bold text-sm text-[var(--content-primary)] hover:underline truncate"
              >
                {post.author.displayName}
              </Link>
              {post.author.isVerified !== false && <VerifiedBadge size="sm" />}

              {/* Follow Button */}
              {user?.id !== post.author.id && (
                <button
                  type="button"
                  onClick={() => toggleFollowCreator(post.author.id)}
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all cursor-pointer",
                    isFollowingAuthor
                      ? "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-rose-500"
                      : "text-[var(--primary-forest-green)] dark:text-[var(--accent)] hover:bg-[var(--bg-neutral)]"
                  )}
                >
                  {isFollowingAuthor ? "Following" : "+ Follow"}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--content-tertiary)] mt-0.5">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span suppressHydrationWarning className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Pill & 3-Dots Options Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-[var(--bg-neutral)] px-2.5 py-1 text-[11px] font-medium text-[var(--content-secondary)]">
            {post.category}
          </span>

          {/* Three Dots Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {/* Dropdown Popover */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
                {isAuthor && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer text-left"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[var(--accent)]" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Post</span>
                    </button>
                    <div className="my-1 border-t border-[var(--border-neutral)]" />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleShare();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer text-left"
                >
                  <Copy className="h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                  <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
                </button>

                {!isAuthor && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsReported(true);
                      setTimeout(() => setIsReported(false), 3000);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-[var(--content-tertiary)] hover:text-amber-500 hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer text-left"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>{isReported ? "Reported" : "Report Post"}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Post Title & Description */}
      <div className="space-y-1.5">
        <h2
          className={cn(
            bricolage.className,
            "text-base sm:text-lg font-bold tracking-tight text-[var(--content-primary)] leading-snug"
          )}
        >
          {post.title}
        </h2>
        {post.content && (
          <p className="text-xs sm:text-sm text-[var(--content-secondary)] whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
        )}
      </div>

      {/* 3. Interactive Content Container */}
      {/* 3.1 A/B Design Test */}
      {post.type === "ab_test" && post.abTest && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A */}
            <button
              type="button"
              onClick={() => handleVote("A")}
              className={cn(
                "group/opt relative flex flex-col rounded-2xl border text-left overflow-hidden transition-all cursor-pointer select-none",
                post.userVotedOptionId === "A"
                  ? "border-[var(--primary-forest-green)] dark:border-[var(--accent)] ring-2 ring-[var(--primary-forest-green)]/20 dark:ring-[var(--accent)]/20 bg-[var(--bg-screen)]"
                  : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:border-[var(--content-secondary)]"
              )}
            >
              {post.abTest.optionA.imageUrl && (
                <div className="relative aspect-[16/10] w-full bg-[var(--bg-neutral)] overflow-hidden">
                  <Image
                    src={post.abTest.optionA.imageUrl}
                    alt={post.abTest.optionA.label}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover group-hover/opt:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center justify-center h-6 w-6 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                    A
                  </div>
                  {post.userVotedOptionId === "A" && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09] px-2 py-0.5 text-[10px] font-bold shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Voted</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--content-primary)] truncate">
                  {post.abTest.optionA.label}
                </span>
                {post.userVotedOptionId ? (
                  <span className="text-xs font-mono font-bold text-[var(--content-primary)]">
                    {optAPercent}%
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--content-tertiary)] group-hover/opt:text-[var(--content-primary)]">
                    Vote A
                  </span>
                )}
              </div>
            </button>

            {/* Option B */}
            <button
              type="button"
              onClick={() => handleVote("B")}
              className={cn(
                "group/opt relative flex flex-col rounded-2xl border text-left overflow-hidden transition-all cursor-pointer select-none",
                post.userVotedOptionId === "B"
                  ? "border-[var(--primary-forest-green)] dark:border-[var(--accent)] ring-2 ring-[var(--primary-forest-green)]/20 dark:ring-[var(--accent)]/20 bg-[var(--bg-screen)]"
                  : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:border-[var(--content-secondary)]"
              )}
            >
              {post.abTest.optionB.imageUrl && (
                <div className="relative aspect-[16/10] w-full bg-[var(--bg-neutral)] overflow-hidden">
                  <Image
                    src={post.abTest.optionB.imageUrl}
                    alt={post.abTest.optionB.label}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover group-hover/opt:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center justify-center h-6 w-6 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-xs">
                    B
                  </div>
                  {post.userVotedOptionId === "B" && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09] px-2 py-0.5 text-[10px] font-bold shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>Voted</span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--content-primary)] truncate">
                  {post.abTest.optionB.label}
                </span>
                {post.userVotedOptionId ? (
                  <span className="text-xs font-mono font-bold text-[var(--content-primary)]">
                    {optBPercent}%
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--content-tertiary)] group-hover/opt:text-[var(--content-primary)]">
                    Vote B
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Progress bar and total votes */}
          {post.userVotedOptionId && (
            <div className="space-y-1.5 pt-1">
              <div className="h-2 w-full rounded-full bg-[var(--bg-neutral)] overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${optAPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${optBPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-amber-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--content-tertiary)]">
                <span>Option A ({optAPercent}%)</span>
                <span>{abTotalVotes} total votes</span>
                <span>Option B ({optBPercent}%)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3.2 Interactive Poll */}
      {post.type === "poll" && post.poll && (() => {
        const totalPollVotes = Math.max(
          post.poll.totalVotes || 0,
          post.poll.options.reduce((acc, opt) => acc + (opt.votesCount || 0), 0)
        );

        return (
          <div className="space-y-2 pt-1">
            {post.poll.options.map((option) => {
              const isSelected = post.userVotedOptionId === option.id;
              const percent =
                totalPollVotes > 0
                  ? Math.round(((option.votesCount || 0) / totalPollVotes) * 100)
                  : 0;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleVote(option.id)}
                  className={cn(
                    "group/poll relative w-full rounded-2xl border p-3.5 text-left overflow-hidden transition-all cursor-pointer select-none",
                    isSelected
                      ? "border-[var(--primary-forest-green)] dark:border-[var(--accent)] ring-2 ring-[var(--primary-forest-green)]/15 dark:ring-[var(--accent)]/15 bg-[var(--bg-screen)]"
                      : "border-[var(--border-neutral)] bg-[var(--bg-screen)] hover:border-[var(--content-secondary)]"
                  )}
                >
                  {/* Background animated progress bar */}
                  {Boolean(post.userVotedOptionId) && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className={cn(
                        "absolute inset-y-0 left-0",
                        isSelected
                          ? "bg-[var(--primary-forest-green)]/15 dark:bg-[var(--accent)]/20"
                          : "bg-[var(--bg-neutral)]/80 dark:bg-white/5"
                      )}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-all",
                          isSelected
                            ? "border-[var(--primary-forest-green)] dark:border-[var(--accent)] bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09]"
                            : "border-[var(--content-tertiary)] bg-[var(--bg-neutral)]/40"
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium truncate",
                          isSelected
                            ? "font-bold text-[var(--content-primary)]"
                            : "text-[var(--content-primary)]"
                        )}
                      >
                        {option.text}
                      </span>
                    </div>

                    {Boolean(post.userVotedOptionId) && (
                      <span className="font-mono text-xs font-bold text-[var(--content-primary)] shrink-0 bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md border border-[var(--border-neutral)] shadow-2xs">
                        {percent}%
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="text-[11px] font-mono text-[var(--content-tertiary)] text-right pt-1">
              {totalPollVotes} {totalPollVotes === 1 ? "vote" : "votes"}
            </div>
          </div>
        );
      })()}

      {/* 3.3 Visual Gallery Carousel (Instagram Style) */}
      {post.type === "image" && post.images && post.images.length > 0 && (
        <div className="pt-1">
          <VisualsCarousel images={post.images} title={post.title} />
        </div>
      )}

      {/* 4. Tags List */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-[var(--bg-screen)] px-2 py-0.5 text-[11px] font-mono text-[var(--content-tertiary)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 5. Footer Action Bar: Likes (up to 10), Comments, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-neutral)]">
        <div className="flex items-center gap-2">
          {/* Multi-Like Heart Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleLike}
              disabled={isMaxLikes}
              className={cn(
                "group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none shadow-2xs",
                userLikes > 0
                  ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09]"
                  : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--border-neutral)]",
                isMaxLikes && "opacity-80 cursor-default"
              )}
              title={isMaxLikes ? "Max 10 likes reached!" : "Like this post (up to 10)"}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 transition-transform group-hover:scale-115 group-active:scale-90",
                  userLikes > 0 ? "fill-current text-current" : "fill-none text-current"
                )}
              />
              <span className="font-bold">{post.likesCount}</span>
              {userLikes > 0 && (
                <span className="text-[10px] font-mono opacity-80">
                  ({userLikes}/10)
                </span>
              )}
            </button>

            {/* Floating Like Particle Burst */}
            <AnimatePresence>
              {likeParticles.map((particleId) => (
                <motion.div
                  key={particleId}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -32, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="pointer-events-none absolute -top-4 left-3 text-xs font-bold text-[var(--primary-forest-green)] dark:text-[var(--accent)] select-none z-20 flex items-center gap-0.5"
                >
                  +1 ❤️
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Comments Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-1.5 rounded-full bg-[var(--bg-neutral)] px-3 py-1.5 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--border-neutral)] transition-all cursor-pointer select-none"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-full p-2 text-xs font-medium text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-all cursor-pointer"
          title="Share post"
        >
          {copiedLink ? (
            <span className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </span>
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 6. Expandable Comments Drawer */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden space-y-3 pt-2 border-t border-[var(--border-neutral)]"
          >
            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start gap-2.5 rounded-2xl bg-[var(--bg-screen)] p-3 border border-[var(--border-neutral)]"
                  >
                    <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[var(--bg-neutral)] shrink-0 ring-1 ring-[var(--border-neutral)]">
                      <Image
                        src={getValidAvatarUrl(comment.author.avatarUrl)}
                        alt={comment.author.displayName}
                        fill
                        sizes="28px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[var(--content-primary)] truncate">
                          {comment.author.displayName}
                        </span>
                        <span suppressHydrationWarning className="text-[10px] text-[var(--content-tertiary)] font-mono">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--content-secondary)] mt-0.5 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--content-tertiary)] italic py-2 text-center">
                No replies yet. Be the first to share your thoughts!
              </p>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a constructive reply..."
                className="flex-1 h-9 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-3 text-xs text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] transition-all placeholder:text-[var(--content-tertiary)]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmittingComment}
                className="h-9 px-3.5 rounded-xl bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09] text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>Send</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <EditPostModal
          post={post}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-sm rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-7 shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-13 w-13 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
                Delete Community Post?
              </h3>
              <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                Are you sure you want to delete this post? This action cannot be undone and will remove all votes and comments.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="rounded-2xl px-4 text-xs font-bold flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="default"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-2xl px-4 text-xs font-bold flex-1 bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
