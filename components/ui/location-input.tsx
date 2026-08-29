"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { POPULAR_CITIES, detectUserLocation } from "@/lib/location";
import { MapPin, Sparkles, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (location: string) => void;
  label?: string;
  placeholder?: string;
  showPresets?: boolean;
  enableAutoDetect?: boolean;
  autoDetectOnMount?: boolean;
  className?: string;
}

export function LocationInput({
  value,
  onChange,
  label = "Location & Base",
  placeholder = "e.g. Berlin, Germany or type custom city...",
  showPresets = true,
  enableAutoDetect = true,
  autoDetectOnMount = false,
  className,
}: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter matching cities
  const matchingCities = useMemo(() => {
    if (!value || !value.trim()) {
      return POPULAR_CITIES.slice(0, 10);
    }
    const query = value.toLowerCase().trim();
    const filtered = POPULAR_CITIES.filter((c) =>
      c.toLowerCase().includes(query)
    );
    return filtered.slice(0, 8);
  }, [value]);

  // Handle auto-detect IP / Geolocation
  const handleAutoDetect = async (isManual = false) => {
    setIsDetecting(true);
    try {
      const loc = await detectUserLocation();
      if (loc) {
        setDetectedLocation(loc);
        onChange(loc);
      }
    } catch (err) {
      console.error("Location detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Auto-detect on mount if requested and current value is empty or default
  useEffect(() => {
    if (autoDetectOnMount && (!value || value === "Worldwide")) {
      handleAutoDetect(false);
    }
  }, [autoDetectOnMount]);

  const presetList = useMemo(() => {
    const base = [
      "Worldwide",
      "Berlin, Germany",
      "Tokyo, Japan",
      "London, United Kingdom",
      "New York, USA",
      "Dubai, UAE",
      "Copenhagen, Denmark",
      "Paris, France",
    ];
    if (detectedLocation && !base.includes(detectedLocation)) {
      return [detectedLocation, ...base];
    }
    return base;
  }, [detectedLocation]);

  return (
    <div ref={containerRef} className={cn("space-y-2.5", className)}>
      {/* Label and Quick Auto-Detect Trigger */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[var(--primary-forest-green)] dark:text-[#8DFF00]" />
          <span>{label}</span>
        </label>

        {enableAutoDetect && (
          <button
            type="button"
            onClick={() => handleAutoDetect(true)}
            disabled={isDetecting}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--content-secondary)] hover:text-[var(--primary-forest-green)] dark:hover:text-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
            title="Auto-detect location from IP"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[var(--primary-forest-green)] dark:text-[var(--accent)]" />
                <span>Detecting IP...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-[var(--primary-forest-green)] dark:text-[#8DFF00]" />
                <span>Auto-detect</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Preset Chips */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {presetList.map((loc) => {
            const isSelected = value?.toLowerCase() === loc.toLowerCase();
            const isDetected = loc === detectedLocation;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  onChange(loc);
                  setIsOpen(false);
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1",
                  isSelected
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[#8DFF00] dark:text-[#090C09] font-bold shadow-xs ring-1 ring-black/10 dark:ring-[var(--accent)]"
                    : "border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:border-[var(--content-secondary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isDetected && <Sparkles className="h-2.5 w-2.5 text-emerald-600 dark:text-black shrink-0" />}
                <span>{loc}</span>
                {isSelected && <Check className="h-3 w-3 shrink-0 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Fully Editable Input Field with Autocomplete Suggestions */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-2.5 pr-9 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden transition-all"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
            title="Clear location"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--content-tertiary)] pointer-events-none" />
        )}

        {/* Autocomplete Dropdown List */}
        {isOpen && matchingCities.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-[18px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-[0_16px_36px_rgba(9,12,9,0.16)] p-1.5 animate-fade-in divide-y divide-[var(--border-neutral)]/40">
            {matchingCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onChange(city);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between w-full text-left px-3 py-2 text-xs font-medium rounded-[12px] transition-colors cursor-pointer",
                  value?.toLowerCase() === city.toLowerCase()
                    ? "bg-[var(--accent)] text-[#090C09] font-bold"
                    : "text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  <span className="truncate">{city}</span>
                </div>
                {value?.toLowerCase() === city.toLowerCase() && (
                  <Check className="h-3 w-3 shrink-0 stroke-[3]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
