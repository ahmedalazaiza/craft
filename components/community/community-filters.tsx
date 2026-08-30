"use client";

import React from "react";
import { MASTER_TAXONOMY } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import {
  Users,
  Globe,
  Search,
  Scale,
  BarChart2,
  Image as ImageIcon,
  MessageCircle,
  Layers,
  ChevronDown,
} from "lucide-react";

export type CommunityScope = "all" | "following";
export type CommunityTimeframe = "all" | "24h" | "week" | "month";

interface CommunityFiltersProps {
  scope: CommunityScope;
  onScopeChange: (scope: CommunityScope) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  timeframe: CommunityTimeframe;
  onTimeframeChange: (tf: CommunityTimeframe) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

export function CommunityFilters({
  scope,
  onScopeChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  timeframe,
  onTimeframeChange,
  searchQuery,
  onSearchChange,
  totalCount,
}: CommunityFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-3 sm:p-4 shadow-2xs">
      {/* Row 1: Scope Toggle + Type Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Scope Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)]">
          <button
            type="button"
            onClick={() => onScopeChange("all")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
              scope === "all"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs dark:bg-[var(--accent)] dark:text-[#090C09]"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>All</span>
          </button>
          <button
            type="button"
            onClick={() => onScopeChange("following")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer select-none",
              scope === "following"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs dark:bg-[var(--accent)] dark:text-[#090C09]"
                : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Following</span>
          </button>
        </div>

        {/* Post Type Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: "All", icon: Layers },
            { id: "ab_test", label: "A/B Tests", icon: Scale },
            { id: "poll", label: "Polls", icon: BarChart2 },
            { id: "image", label: "Visuals", icon: ImageIcon },
            { id: "text", label: "Discussions", icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTypeChange(tab.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border select-none",
                  isSelected
                    ? "bg-[var(--primary-forest-green)] text-white dark:bg-[var(--accent)] dark:text-[#090C09] border-transparent font-bold shadow-2xs"
                    : "bg-[var(--bg-screen)] text-[var(--content-secondary)] border-[var(--border-neutral)] hover:text-[var(--content-primary)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 2: Search + Category + Timeframe + Count */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[var(--border-neutral)]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--content-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by keyword, #tag, or creator..."
            className="w-full h-8.5 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] pl-8 pr-3 text-xs text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] transition-all placeholder:text-[var(--content-tertiary)]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Discipline */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="h-8.5 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-2.5 pr-7 text-xs font-medium text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {MASTER_TAXONOMY.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-[var(--content-tertiary)] pointer-events-none" />
          </div>

          {/* Timeframe */}
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => onTimeframeChange(e.target.value as CommunityTimeframe)}
              className="h-8.5 rounded-xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-2.5 pr-7 text-xs font-medium text-[var(--content-primary)] focus:outline-none focus:border-[var(--primary-forest-green)] appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="24h">Past 24h</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-[var(--content-tertiary)] pointer-events-none" />
          </div>

          <span className="text-[11px] font-mono text-[var(--content-tertiary)] px-1 whitespace-nowrap">
            {totalCount} {totalCount === 1 ? "post" : "posts"}
          </span>
        </div>
      </div>
    </div>
  );
}
