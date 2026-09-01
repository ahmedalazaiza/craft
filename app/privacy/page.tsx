import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Shield, EyeOff, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy — Zero Data-Selling & Encryption",
  description:
    "Learn about Layerat's strict privacy principles, transparent session security, and data protection practices.",
  path: "/privacy",
});

export const revalidate = 86400;

export default function PrivacyPage() {
  const lastUpdated = "August 31, 2026";
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy" },
  ]);

  return (
    <div className="mx-auto max-w-[860px] px-4 sm:px-6 py-4 sm:py-6 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Privacy & Security
        </span>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight")}>
          Privacy Policy
        </h1>

        <p className="text-xs sm:text-sm font-mono text-neutral-400 dark:text-neutral-500">
          Last revised: {lastUpdated} • Applicable to all visitors, creators, and platform sessions.
        </p>
      </div>

      {/* Privacy Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Zero Data Selling
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            We never sell, rent, or monetize your personal data, portfolio metrics, or viewing behavior to third-party advertisers.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Encrypted Sessions
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Authentication tokens and user credentials are encrypted with industry-standard cryptographic protocols.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Database className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Full Data Deletion
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            You can delete your account and all associated project data instantly at any time from your account settings.
          </p>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="space-y-10 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base font-normal">
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            1. Information We Collect
          </h2>
          <p>
            We collect only the essential information needed to operate a pristine creative platform:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li><strong className="text-neutral-900 dark:text-neutral-200 font-semibold">Account Information:</strong> Email address, username, display name, and avatar when you sign up.</li>
            <li><strong className="text-neutral-900 dark:text-neutral-200 font-semibold">Creator Profile Content:</strong> Bio, location, discipline tags, website links, and uploaded portfolio project assets.</li>
            <li><strong className="text-neutral-900 dark:text-neutral-200 font-semibold">Interactive Actions:</strong> Peer appreciations, project comments, and followed creators.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>Render your studio profile, projects, and high-DPI case studies across the Layerat directory.</li>
            <li>Send essential transactional emails (email verification, password resets, account security alerts).</li>
            <li>Provide real-time peer notifications when other verified makers appreciate or comment on your work.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            3. Local Storage & Preferences
          </h2>
          <p>
            Layerat uses local browser storage exclusively for functional purposes: caching your theme preference and fast hydration tokens to eliminate visual loading flashes (0ms navigation). We do not use third-party tracking pixels or surveillance analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            4. Your Rights (GDPR & CCPA Aligned)
          </h2>
          <p>
            Regardless of your geographic location, you have the right to access, rectify, or permanently erase your personal data. To request a full data export or complete account deletion, please contact{" "}
            <a href="mailto:privacy@layerat.com" className="text-neutral-900 dark:text-white font-bold underline">
              privacy@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
