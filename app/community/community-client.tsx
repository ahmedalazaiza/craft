"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { CommunityCard } from "@/components/community/community-card";
import { CreatePostModal } from "@/components/community/create-post-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Button } from "@/components/ui/button";
import { getValidAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Users,
  MessageSquare,
  Scale,
  BarChart2,
  Image as ImageIcon,
  MessageCircle,
  Layers,
  Search,
  Globe,
  X,
} from "lucide-react";

export function CommunityClient() {
  const { communityPosts, followingCreatorIds, user } = useSession();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "following">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort posts (chronological feed)
  const filteredPosts = useMemo(() => {
    return communityPosts
      .filter((post) => {
        // 1. Scope filter
        if (scope === "following") {
          if (!post.author?.id || !followingCreatorIds.has(post.author.id)) {
            return false;
          }
        }

        // 2. Type filter
        if (selectedType !== "all" && post.type !== selectedType) {
          return false;
        }

        // 3. Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = post.title.toLowerCase().includes(q);
          const matchContent = post.content?.toLowerCase().includes(q);
          const matchAuthor =
            post.author.displayName.toLowerCase().includes(q) ||
            post.author.username.toLowerCase().includes(q);
          const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchAuthor && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [communityPosts, scope, selectedType, searchQuery, followingCreatorIds]);

  // Dynamic counts for left column navigation
  const typeCounts = useMemo(() => {
    const ab = communityPosts.filter((p) => p.type === "ab_test").length;
    const poll = communityPosts.filter((p) => p.type === "poll").length;
    const img = communityPosts.filter((p) => p.type === "image").length;
    const text = communityPosts.filter((p) => p.type === "text").length;
    return {
      all: communityPosts.length,
      ab_test: ab,
      poll,
      image: img,
      text,
    };
  }, [communityPosts]);

  const hasActiveFilters =
    scope !== "all" ||
    selectedType !== "all" ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setScope("all");
    setSelectedType("all");
    setSearchQuery("");
  };

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-4 sm:py-6 pb-24">
      <FadeIn>
        {/* 1. Breadcrumbs Navigation */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Community" },
          ]}
        />

        {/* ========================================================================= */}
        {/* 2. BALANCED TOP HEADER                                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-neutral)] mb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--chip-fg)] mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#8DFF00]" />
              <span>Design Community</span>
              <span className="text-[var(--content-tertiary)]">•</span>
              <span className="font-normal text-[var(--chip-fg)]">A/B Tests, Polls & Feedback</span>
            </div>
            <h1
              className={cn(
                bricolage.className,
                "text-3xl sm:text-4xl lg:text-[42px] font-bold text-[var(--content-primary)] leading-tight tracking-tight"
              )}
            >
              Community Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[var(--content-secondary)] leading-relaxed">
              Connect with designers worldwide. Test UI variants, conduct live polls, and get constructive critique.
            </p>
          </div>

          {/* Create Post Button */}
          <div className="shrink-0">
            <Button
              type="button"
              variant="accent"
              size="default"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 font-bold shadow-xs rounded-2xl px-5"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create Post</span>
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TWO-COLUMN ARCHITECTURE (Left Filters 250px | Main Feed)                */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ======================================================================= */}
          {/* COLUMN 1 (LEFT, 250px): Search & Format Filters                         */}
          {/* ======================================================================= */}
          <aside className="w-full lg:w-[250px] shrink-0 space-y-4 lg:sticky lg:top-20">
            {/* Search & Filters Box */}
            <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)] flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[var(--accent)]" />
                  Search & Filter
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-[var(--content-tertiary)] hover:text-rose-500 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--content-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, #tags..."
                  className="w-full h-8.5 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] pl-8 pr-7 text-xs text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] transition-all placeholder:text-[var(--content-tertiary)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2 text-[var(--content-tertiary)] hover:text-[var(--content-primary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Scope Switcher (All vs Following) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-[var(--content-tertiary)] uppercase tracking-wider block">
                  Feed Scope
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)]">
                  <button
                    type="button"
                    onClick={() => setScope("all")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
                      scope === "all"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs dark:bg-[var(--accent)] dark:text-[#090C09]"
                        : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                    )}
                  >
                    <Globe className="h-3 w-3" />
                    <span>All</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope("following")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
                      scope === "following"
                        ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs dark:bg-[var(--accent)] dark:text-[#090C09]"
                        : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                    )}
                  >
                    <Users className="h-3 w-3" />
                    <span>Following</span>
                  </button>
                </div>
              </div>

              {/* Post Format Selector */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-neutral)]">
                <span className="text-[10px] font-mono text-[var(--content-tertiary)] uppercase tracking-wider block">
                  Format
                </span>
                <div className="space-y-1">
                  {[
                    { id: "all", label: "All Formats", icon: Layers, count: typeCounts.all },
                    { id: "ab_test", label: "A/B Tests", icon: Scale, count: typeCounts.ab_test },
                    { id: "poll", label: "Polls", icon: BarChart2, count: typeCounts.poll },
                    { id: "image", label: "Visuals", icon: ImageIcon, count: typeCounts.image },
                    { id: "text", label: "Discussions", icon: MessageCircle, count: typeCounts.text },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = selectedType === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedType(tab.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer select-none",
                          isSelected
                            ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] font-bold shadow-2xs"
                            : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                        )}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tab.label}</span>
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0",
                            isSelected
                              ? "bg-white/20 dark:bg-black/20"
                              : "text-[var(--content-tertiary)]"
                          )}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* COLUMN 2 (MIDDLE, Flex-1): Main Posts Feed                              */}
          {/* ======================================================================= */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Quick Composer Trigger Box */}
            <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[var(--bg-neutral)] shrink-0 ring-1 ring-[var(--border-neutral)]">
                  <Image
                    src={getValidAvatarUrl(user?.avatarUrl)}
                    alt={user?.displayName || "User"}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 h-10 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-4 text-left text-xs text-[var(--content-tertiary)] hover:border-[var(--primary-forest-green)] hover:text-[var(--content-secondary)] transition-all cursor-pointer truncate"
                >
                  Share a design question, A/B test, or poll...
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-neutral)] text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] font-medium transition-all cursor-pointer"
                  >
                    <Scale className="h-3.5 w-3.5 text-amber-500" />
                    <span>A/B Test</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] font-medium transition-all cursor-pointer"
                  >
                    <BarChart2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Poll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] hover:border-[var(--content-primary)] text-[var(--content-secondary)] hover:text-[var(--content-primary)] font-medium transition-all cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Visuals</span>
                  </button>
                </div>

                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="rounded-xl text-xs font-bold px-3 py-1 h-7"
                >
                  Post
                </Button>
              </div>
            </div>

            {/* Active Filters Summary Bar (if filtered) */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] text-xs text-[var(--content-secondary)]">
                <span className="font-medium">
                  Showing <strong className="text-[var(--content-primary)]">{filteredPosts.length}</strong> results
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-[var(--primary-forest-green)] dark:text-[var(--accent)] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Posts List */}
            {filteredPosts.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-12 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-[var(--bg-neutral)] mx-auto flex items-center justify-center text-[var(--content-tertiary)]">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[var(--content-primary)]">
                    No community posts found
                  </h3>
                  <p className="text-xs text-[var(--content-secondary)] max-w-sm mx-auto">
                    Try adjusting your search query, scope, or format filters.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="rounded-xl text-xs font-bold"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <CommunityCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Floating Mobile Create Post FAB */}
        <div className="fixed right-5 bottom-20 z-40 md:hidden">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--primary-forest-green)] dark:bg-[var(--accent)] text-white dark:text-[#090C09] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Create Post"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </FadeIn>
    </div>
  );
}
