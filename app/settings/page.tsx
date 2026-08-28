import { Suspense } from "react";
import type { Metadata } from "next";
import { SettingsClient } from "./settings-client";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your studio profile, security credentials, preferences, and account configurations on Craft.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-12 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)]" />
        </div>
      }
    >
      <SettingsClient />
    </Suspense>
  );
}

