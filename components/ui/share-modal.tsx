"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Copy, Share2, MessageCircle, Send, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  subtitle?: string;
  creatorName?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  subtitle = "Share this profile with your network or copy the direct link.",
  creatorName,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Check out ${creatorName ? `${creatorName}'s studio` : title} on Craft:`;

  const shareLinks = [
    {
      name: "X (Twitter)",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: "bg-[var(--chip-bg)] text-[var(--chip-fg)] hover:bg-[var(--chip-bg-hover)] border border-[var(--border-neutral)]",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0-.01-3.28 1.64 1.64 0 0 0 .01 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
        </svg>
      ),
      bg: "bg-[#0A66C2] text-white hover:bg-[#084e96]",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: "WhatsApp",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25.7-.72 1.29-1.37 1.66-.46.26-1.07.41-1.78.41-.75 0-1.7-.22-3.11-.8-1.57-.65-2.73-1.63-3.66-2.74-1.02-1.22-1.6-2.58-1.6-3.83 0-1.31.54-2.26 1.05-2.77.27-.27.6-.42.94-.42.23 0 .45.05.65.25.2.2.62 1.48.67 1.6.05.12.08.26.01.41-.07.15-.17.29-.32.46-.15.17-.3.33-.43.47-.14.15-.3.32-.13.61.34.58.8 1.18 1.38 1.68.74.64 1.44.97 1.89 1.15.18.07.36.05.5-.07.19-.16.59-.69.75-.92.16-.23.33-.2.53-.13.2.07 1.3.61 1.53.72.23.12.38.18.44.28.06.1.06.58-.19 1.28z" />
        </svg>
      ),
      bg: "bg-[#25D366] text-white hover:bg-[#1EBE5D]",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + url)}`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-t-[28px] sm:rounded-[28px] border-t sm:border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-none z-10 overflow-hidden pb-10 sm:pb-7 pb-safe"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 h-8 w-8 rounded-full flex items-center justify-center text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-[var(--chip-bg)] text-[var(--chip-fg)] flex items-center justify-center shadow-xs">
                <Share2 className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <h2
                  className={cn(
                    bricolage.className,
                    "text-xl sm:text-2xl font-bold text-[var(--content-primary)] tracking-tight"
                  )}
                >
                  {title}
                </h2>
              </div>
            </div>

            <p className="text-xs text-[var(--content-secondary)] leading-relaxed mb-6">
              {subtitle}
            </p>

            {/* Quick Social Share Buttons */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)] block mb-2.5">
                Share directly via
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {shareLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex flex-col items-center justify-center min-h-[48px] gap-2 py-3 px-2 rounded-2xl transition-all shadow-xs text-xs font-semibold select-none cursor-pointer",
                      item.bg
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Copy Link Section */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--content-tertiary)] block mb-2">
                Or copy direct public link
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-1.5 focus-within:ring-2 focus-within:ring-[var(--primary-forest-green)] transition-all">
                <div className="flex-1 px-3 overflow-hidden">
                  <p className="text-xs font-mono text-[var(--content-secondary)] truncate select-all">
                    {url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "h-10 min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer select-none",
                    copied
                      ? "bg-[var(--sentiment-positive-bg)] text-[var(--sentiment-positive-fg)]"
                      : "bg-[var(--chip-bg)] text-[var(--chip-fg)] hover:bg-[var(--chip-bg-hover)] active:scale-95"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-current" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
