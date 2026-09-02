"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "error" | "warning" | "success" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  public subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public add(type: ToastType, message: string, title?: string, duration = 4500) {
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const item: ToastItem = { id, type, message, title, duration };
    
    // Limit to max 4 concurrent toasts
    this.toasts = [item, ...this.toasts.slice(0, 3)];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    return id;
  }

  public remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();

export const toast = {
  error: (message: string, title?: string, duration?: number) =>
    toastManager.add("error", message, title ?? "Action Required", duration),
  warning: (message: string, title?: string, duration?: number) =>
    toastManager.add("warning", message, title ?? "Notice", duration),
  success: (message: string, title?: string, duration?: number) =>
    toastManager.add("success", message, title ?? "Success", duration),
  info: (message: string, title?: string, duration?: number) =>
    toastManager.add("info", message, title ?? "Information", duration),
  dismiss: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),
};

const iconMap: Record<ToastType, React.ReactNode> = {
  error: <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0" />,
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
  info: <Info className="h-5 w-5 text-[var(--content-primary)] shrink-0" />,
};

const badgeClassMap: Record<ToastType, string> = {
  error: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  info: "bg-[var(--bg-neutral)] border-[var(--border-neutral)] text-[var(--content-primary)]",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = toastManager.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[999999] pointer-events-none flex flex-col gap-2.5 items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto w-full rounded-2xl border p-4 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all",
              "bg-[var(--bg-elevated)] border-[var(--border-neutral)]"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Type Icon Container */}
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 mt-0.5",
                  badgeClassMap[item.type]
                )}
              >
                {iconMap[item.type]}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--content-primary)] mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)] leading-snug break-words">
                  {item.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => toast.dismiss(item.id)}
                className="rounded-lg p-1 text-[var(--content-tertiary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)] transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
