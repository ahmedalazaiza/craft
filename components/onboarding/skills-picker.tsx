"use client";

import React, { useState, useMemo } from "react";
import { Plus, X, Check, Sparkles, Layers, Tag, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { MASTER_TAXONOMY, ALL_SUB_CATEGORIES } from "@/lib/taxonomy";

interface SkillsPickerProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsPicker({ selectedSkills, onChange }: SkillsPickerProps) {
  const [customInput, setCustomInput] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("All");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 12) {
        alert("You can select up to 12 key disciplines & specialties.");
        return;
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const handleAddCustom = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    if (selectedSkills.includes(clean)) {
      setCustomInput("");
      return;
    }

    if (selectedSkills.length >= 12) {
      alert("You can select up to 12 key disciplines.");
      return;
    }

    onChange([...selectedSkills, clean]);
    setCustomInput("");
  };

  const visibleDisciplines = useMemo(() => {
    if (selectedCategoryTab === "All") {
      // 13 Master Categories + Top Subcategories
      const mainNames = MASTER_TAXONOMY.map((c) => c.name);
      const topSubs = MASTER_TAXONOMY.flatMap((c) => c.subCategories.slice(0, 2));
      return Array.from(new Set([...mainNames, ...topSubs]));
    }
    const match = MASTER_TAXONOMY.find((c) => c.name === selectedCategoryTab);
    return match ? [match.name, ...match.subCategories] : [];
  }, [selectedCategoryTab]);

  return (
    <div className="space-y-6">
      {/* Selected Tags Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center gap-1.5 font-mono uppercase tracking-wider">
            <span>Your Disciplines & Specializations</span>
            <span className="text-[11px] text-[var(--content-tertiary)]">
              ({selectedSkills.length}/12)
            </span>
          </label>
          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] font-semibold text-[var(--content-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="min-h-[52px] rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/40 p-2.5 flex flex-wrap items-center gap-2">
          {selectedSkills.length === 0 ? (
            <span className="text-xs text-[var(--content-tertiary)] italic px-2">
              Select disciplines below or add custom skills...
            </span>
          ) : (
            selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#8DFF00] dark:text-[#090C09] px-3 py-1 text-xs font-bold shadow-xs animate-scale-in"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="rounded-full p-0.5 hover:bg-white/20 dark:hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Category Tabs for Fast Browsing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--content-secondary)] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[#8DFF00]" />
            <span>Browse by Discipline ({MASTER_TAXONOMY.length} Domains)</span>
          </label>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategoryTab("All")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold shrink-0 cursor-pointer transition-all",
              selectedCategoryTab === "All"
                ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)]/80"
            )}
          >
            All Disciplines
          </button>
          {MASTER_TAXONOMY.map((cat) => {
            const isTabActive = selectedCategoryTab === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryTab(cat.name)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold shrink-0 cursor-pointer transition-all",
                  isTabActive
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:bg-[var(--bg-neutral)]/80"
                )}
              >
                {cat.shortName}
              </button>
            );
          })}
        </div>

        {/* Disciplines & Sub-categories Grid */}
        <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1 border border-[var(--border-neutral)] rounded-2xl bg-[var(--bg-screen)]">
          {visibleDisciplines.map((discipline) => {
            const isSelected = selectedSkills.includes(discipline);
            return (
              <button
                key={discipline}
                type="button"
                onClick={() => toggleSkill(discipline)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border",
                  isSelected
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#8DFF00] dark:text-[#090C09] font-bold border-transparent shadow-xs scale-102"
                    : "border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:border-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                {isSelected ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Plus className="h-3 w-3 opacity-60" />
                )}
                <span>{discipline}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Discipline Adder */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustom(e);
            }
          }}
          placeholder="Add custom specialization or skill (e.g. Design Systems, Spatial Audio)..."
          className="flex-1 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-4 py-2 text-xs font-semibold text-[var(--content-primary)] hover:bg-[var(--accent)] hover:text-[#090C09] hover:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
