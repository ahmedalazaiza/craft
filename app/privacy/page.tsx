import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Shield, Lock, EyeOff, Database, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy — Zero Data-Selling & Encryption",
  description:
    "Learn about Craft's strict privacy principles, transparent session security, and data protection practices.",
  path: "/privacy",
});

export const revalidate = 86400;

export default function PrivacyPage() {
  const lastUpdated = "August 28, 2026";

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-[var(--border-neutral)] pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3.5 py-1 text-xs font-semibold text-[var(--content-secondary)]">
          <Lock className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Privacy & Security</span>
        </div>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-extrabold text-[var(--content-primary)] tracking-tight")}>
          Privacy Policy
        </h1>

        <p className="text-sm text-[var(--content-tertiary)]">
          Last revised: {lastUpdated} • Applicable to all visitors, creators, and platform sessions.
        </p>
      </div>

      {/* Privacy Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Zero Data Selling
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            We never sell, rent, or monetize your personal data, portfolio metrics, or viewing behavior to third-party advertisers.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Encrypted Sessions
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            Authentication tokens and user credentials are encrypted with industry-standard cryptographic algorithms.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <Database className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Full Data Export & Deletion
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            You can delete your account and all associated project data instantly at any time from your settings.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-10 type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            1. Information We Collect
          </h2>
          <p>
            We collect only the essential information needed to operate a pristine creative platform:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
            <li><strong>Account Information:</strong> Email address, username, display name, and avatar when you sign up.</li>
            <li><strong>Creator Profile Content:</strong> Bio, location, discipline tags, website links, and uploaded portfolio project assets.</li>
            <li><strong>Interactive Actions:</strong> Peer appreciations, project comments, and followed creators.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            2. How We Use Your Information
          </h2>
          <p>
            Your information is used strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
            <li>Render your studio profile, projects, and high-DPI case studies across the Craft directory.</li>
            <li>Send essential transactional emails (email verification, password resets, account security alerts).</li>
            <li>Provide real-time peer notifications when other verified makers appreciate or comment on your work.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            3. Local Storage & Preferences
          </h2>
          <p>
            Craft uses local browser storage exclusively for functional purposes: caching your dark/light theme preference (`craft-theme`) and fast hydration tokens to eliminate visual loading flashes (0ms navigation). We do not use third-party tracking pixels or surveillance analytics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            4. Your Rights (GDPR & CCPA Aligned)
          </h2>
          <p>
            Regardless of your geographic location, you have the right to access, rectify, or permanently erase your personal data. To request a full data export or complete account deletion, please contact{" "}
            <a href="mailto:privacy@craftplatform.com" className="text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-semibold underline">
              privacy@craftplatform.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
