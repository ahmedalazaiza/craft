import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, HeartHandshake, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Community Guidelines — Curation & Peer Standards",
  description:
    "Standards for publishing original case studies, delivering thoughtful peer feedback, and maintaining Craft's editorial excellence.",
  path: "/guidelines",
});

export const revalidate = 86400;

export default function GuidelinesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Community Guidelines", url: "/guidelines" },
  ]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 py-6 sm:py-10 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Community Guidelines", isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-[var(--border-neutral)] pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3.5 py-1 text-xs font-semibold text-[var(--content-secondary)]">
          <HeartHandshake className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Peer Standards</span>
        </div>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-extrabold text-[var(--content-primary)] tracking-tight")}>
          Community Guidelines
        </h1>

        <p className="text-sm text-[var(--content-tertiary)]">
          The shared principles and curation expectations that keep Craft a high-signal sanctuary for creators.
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <Award className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Originality & Provenance
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            Publish authentic case studies that you personally designed, directed, or contributed to with accurate team attribution.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Thoughtful Critique
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            Provide respectful, substantive feedback on typography, layout, interaction design, and conceptual execution.
          </p>
        </div>

        <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Zero Harassment
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
            Craft maintains zero tolerance for hate speech, harassment, impersonation, or predatory behavior.
          </p>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="space-y-10 type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            1. Curation & Publishing Standards
          </h2>
          <p>
            When publishing a case study on Craft:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
            <li>Ensure high-resolution imagery and clear typography specimens without unnecessary watermarks.</li>
            <li>Write meaningful summaries explaining the design problem, client objectives, tools used, and creative solution.</li>
            <li>Tag appropriate disciplines (UI, Brand, 3D & Motion, Editorial, Typography, Architecture, Photo, Product) accurately.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            2. Respectful Collaboration & Comments
          </h2>
          <p>
            The comment section on every project is an open forum for professional critique, questions about techniques, and appreciation. Keep interactions constructive, cordial, and focused on design craft.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            3. Reporting & Enforcement
          </h2>
          <p>
            If you notice copyright infringement, uncredited work, or violations of these guidelines, please contact our curation team at{" "}
            <a href="mailto:curation@craftplatform.com" className="text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-semibold underline">
              curation@craftplatform.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
