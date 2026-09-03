import { Metadata } from "next";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchLegalDocument } from "@/lib/supabase/queries";
import { Shield, EyeOff, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Privacy Policy — Zero Data-Selling & Encryption",
  description:
    "Learn about Layerat's strict privacy principles, transparent session security, and data protection practices.",
  path: "/privacy",
});

export const revalidate = 3600; // 1 hour ISR revalidation

export default async function PrivacyPage() {
  const doc = await fetchLegalDocument("privacy");

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(doc.updatedAt || doc.publishedAt));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy" },
  ]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-4 sm:py-6 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: doc.title, isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-[var(--border-neutral)] pb-8">
        <div className="flex items-center gap-3">
          <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-[var(--content-tertiary)]">
            {doc.subtitle || "Privacy & Security"}
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--chip-bg)] text-[var(--chip-fg)] border border-[var(--border-neutral)]">
            v{doc.version}
          </span>
        </div>

        <h1
          className={cn(
            bricolage.className,
            "text-3xl sm:text-5xl font-black text-[var(--content-primary)] tracking-tight leading-tight"
          )}
        >
          {doc.title}
        </h1>

        <p className="text-xs sm:text-sm font-mono text-[var(--content-tertiary)]">
          Last revised: {formattedDate} • Applicable to all visitors, creators, and platform sessions.
        </p>
      </div>

      {/* Privacy Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <EyeOff className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Zero Data Selling
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            We never sell, rent, or monetize your personal data, portfolio metrics, or viewing behavior to third parties.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Encrypted Sessions
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            Authentication tokens and user credentials are encrypted with TLS 1.3 and PostgreSQL Row Level Security.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <Database className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Full Data Deletion
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            You can delete your account and all associated project monographs instantly at any time from your settings.
          </p>
        </div>
      </div>

      {/* Detail Sections from Database */}
      <div className="space-y-10 text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base font-normal">
        {doc.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2
              className={cn(
                bricolage.className,
                "text-xl sm:text-2xl font-bold text-[var(--content-primary)]"
              )}
            >
              {section.title}
            </h2>
            <p>{section.content}</p>

            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                {section.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Inquiries */}
        <section className="space-y-3 pt-6 border-t border-[var(--border-neutral)]">
          <h2
            className={cn(
              bricolage.className,
              "text-xl sm:text-2xl font-bold text-[var(--content-primary)]"
            )}
          >
            Privacy Officer Contact
          </h2>
          <p>
            To exercise your GDPR/CCPA data export rights or submit a privacy inquiry, reach out directly to{" "}
            <a
              href="mailto:privacy@layerat.com"
              className="text-[var(--content-primary)] font-bold underline"
            >
              privacy@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
