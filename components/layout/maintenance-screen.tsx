"use client";

import React from "react";
import { useSession } from "@/lib/session-context";
import { Logo } from "@/components/ui/logo";
import { Wrench, ShieldAlert } from "lucide-react";

export function MaintenanceScreen({ children }: { children: React.ReactNode }) {
  const { platformSettings, isAdmin, isLoadingDb } = useSession();

  // If still loading session or not in maintenance mode, or user is admin, allow normal view
  if (isLoadingDb || !platformSettings.maintenanceMode || isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[var(--bg-screen)] text-[var(--content-primary)] p-6 sm:p-10 select-none">
      {/* Top Brand */}
      <header className="w-full max-w-5xl flex items-center justify-between">
        <Logo linkHref="/" priority={true} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Wrench className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
          Scheduled Maintenance
        </span>
      </header>

      {/* Center Hero Message */}
      <main className="flex flex-col items-center text-center max-w-lg my-auto py-12">
        <div className="h-16 w-16 rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert className="h-8 w-8 text-[var(--content-primary)]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
          Upgrading the Craft
        </h1>

        <p className="text-sm sm:text-base text-[var(--content-secondary)] leading-relaxed mb-8">
          {platformSettings.maintenanceMessage ||
            "Layerat is currently undergoing scheduled platform upgrades to improve performance and stability. We will be back online shortly."}
        </p>

        <div className="inline-flex items-center gap-2 text-xs text-[var(--content-tertiary)] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-4 py-2 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Systems updating in progress · Check back soon
        </div>
      </main>

      {/* Footer */}
      <footer className="text-xs text-[var(--content-tertiary)] text-center py-4">
        &copy; {new Date().getFullYear()} Layerat Platforms Inc. All rights reserved.
      </footer>
    </div>
  );
}
