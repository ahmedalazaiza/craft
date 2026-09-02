"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { POPULAR_CITIES, detectUserLocation } from "@/lib/location";
import { MapPin, Sparkles, Loader2, X, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LocationInputProps {
  value: string;
  onChange: (location: string) => void;
  label?: string;
  placeholder?: string;
  showPresets?: boolean;
  enableAutoDetect?: boolean;
  className?: string;
}

export function LocationInput({
  value,
  onChange,
  label = "Location & Base",
  placeholder = "e.g. Berlin, Germany or type custom city...",
  showPresets = true,
  enableAutoDetect = true,
  className,
}: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Execute explicit auto-detection after user gives legal consent
  const performLocationDetection = async () => {
    setIsConsentOpen(false);
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
          <MapPin className="h-3.5 w-3.5 text-[var(--content-secondary)]" />
          <span>{label}</span>
        </label>

        {enableAutoDetect && (
          <button
            type="button"
            onClick={() => setIsConsentOpen(true)}
            disabled={isDetecting}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--content-secondary)] hover:text-[var(--content-primary)] transition-colors cursor-pointer disabled:opacity-50"
            title="Request location access to detect city"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[var(--content-primary)]" />
                <span>Detecting Location...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-[var(--content-secondary)]" />
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
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold shadow-xs"
                    : "border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-[var(--content-secondary)] hover:border-[var(--content-secondary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                {isDetected && <Sparkles className="h-2.5 w-2.5 text-[var(--content-primary)] shrink-0" />}
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
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] font-bold"
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

      {/* Legal Location Access Consent Modal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isConsentOpen && (
              <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsConsentOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ type: "spring", damping: 28, stiffness: 350 }}
                  className="relative w-full max-w-md rounded-t-[28px] sm:rounded-3xl border-t sm:border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 shadow-2xl z-10 space-y-5 pb-safe"
                >
                  {/* Mobile Pull Handle Indicator */}
                  <div className="flex sm:hidden justify-center pt-1 pb-2 -mt-2 shrink-0">
                    <div className="h-1.5 w-12 rounded-full bg-[var(--border-neutral)]" />
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3
                        className={cn(
                          bricolage.className,
                          "text-lg font-bold text-[var(--content-primary)]"
                        )}
                      >
                        Allow Location Access
                      </h3>
                      <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                        Layerat requests permission to detect your approximate network location to automatically suggest your city on your studio profile.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[var(--bg-neutral)]/70 border border-[var(--border-neutral)] p-3.5 text-[11px] text-[var(--content-secondary)] space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--content-primary)]">
                      <MapPin className="h-3.5 w-3.5 text-[var(--content-primary)]" />
                      <span>Privacy & Legal Guarantee</span>
                    </div>
                    <p className="leading-relaxed">
                      We only resolve city-level coordinates (e.g. &ldquo;London, UK&rdquo;). Your precise GPS location is never tracked, stored, or shared.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsConsentOpen(false)}
                      className="rounded-full px-4 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      onClick={performLocationDetection}
                      className="rounded-full px-5 font-bold text-xs shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Allow & Detect Location</span>
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
