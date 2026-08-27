"use client";

import React, { useState } from "react";
import { Plus, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CURATED_DISCIPLINES = [
  "Brand Identity",
  "UI/UX Design",
  "Typography & Type",
  "3D & Spatial Design",
  "Motion & Animation",
  "Editorial Design",
  "Design Systems",
  "Creative Direction",
  "Product Design",
  "Photography",
  "Architecture",
  "Art Direction",
  "Packaging",
  "Interaction Design",
  "Visual Design",
  "Figma",
];

interface SkillsPickerProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsPicker({ selectedSkills, onChange }: SkillsPickerProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onChange(selectedSkills.filter((s) => s !== skill));
    } else {
      if (selectedSkills.length >= 10) {
        alert("You can select up to 10 key disciplines.");
        return;
      }
      onChange([...selectedSkills, skill]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    if (selectedSkills.includes(clean)) {
      setCustomInput("");
      return;
    }

    if (selectedSkills.length >= 10) {
      alert("You can select up to 10 key disciplines.");
      return;
    }

    onChange([...selectedSkills, clean]);
    setCustomInput("");
  };

  return (
    <div className="space-y-6">
      {/* Selected Tags Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
            <span>Selected Disciplines</span>
            <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
              ({selectedSkills.length}/10)
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-[#090C09] px-3 py-1 text-xs font-bold shadow-xs animate-scale-in"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className="rounded-full p-0.5 hover:bg-black/10 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Curated Disciplines Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[var(--content-secondary)] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#8DFF00]" />
          <span>Popular Craft Domains</span>
        </label>

        <div className="flex flex-wrap gap-2">
          {CURATED_DISCIPLINES.map((discipline) => {
            const isSelected = selectedSkills.includes(discipline);
            return (
              <button
                key={discipline}
                type="button"
                onClick={() => toggleSkill(discipline)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#8DFF00] text-[#090C09] font-bold shadow-xs scale-105"
                    : "border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:border-[var(--content-secondary)] hover:text-[var(--content-primary)]"
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
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add custom specialty (e.g. Generative AI, Spatial Audio)..."
          className="flex-1 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] px-3.5 py-2 text-xs text-[var(--content-primary)] placeholder-[var(--content-tertiary)] focus:border-[var(--accent)] focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] px-4 py-2 text-xs font-semibold text-[var(--content-primary)] hover:bg-[var(--accent)] hover:text-[#090C09] hover:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}
