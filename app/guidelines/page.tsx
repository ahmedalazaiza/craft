import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Community Guidelines — Curation & Peer Standards",
  description:
    "Standards for publishing original case studies, delivering thoughtful peer feedback, and maintaining Layerat's editorial excellence.",
  path: "/guidelines",
});

export const revalidate = 86400;

export default function GuidelinesPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Community Guidelines", url: "/guidelines" },
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6 space-y-12">
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
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Peer & Curation Standards
        </span>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight")}>
          Community Guidelines
        </h1>

        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
          The shared principles and curation expectations that keep Layerat a high-signal sanctuary for creators worldwide.
        </p>
      </div>

      {/* 3 Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Award className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Originality & Provenance
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Publish authentic case studies that you personally designed, directed, or contributed to with accurate team attribution.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Thoughtful Critique
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Provide respectful, substantive feedback on typography, layout, interaction design, and conceptual execution.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-neutral-950 dark:text-white")}>
            Zero Harassment
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Layerat maintains zero tolerance for hate speech, harassment, impersonation, or predatory behavior.
          </p>
        </div>
      </div>

      {/* Detail Editorial Sections */}
      <div className="space-y-10 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base font-normal">
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            1. Curation & Publishing Standards
          </h2>
          <p>
            When publishing a monograph or case study on Layerat:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>Ensure high-resolution imagery and clear typography specimens without unnecessary watermarks.</li>
            <li>Write meaningful summaries explaining the design problem, client objectives, tools used, and creative solution.</li>
            <li>Tag appropriate disciplines (Brand Identity, UI/UX, 3D & Motion, Typography, Packaging, Architecture) accurately.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            2. Respectful Collaboration & Comments
          </h2>
          <p>
            The comment section on every project is an open forum for professional critique, questions about techniques, and appreciation. Keep interactions constructive, cordial, and focused on design craft.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            3. Reporting & Enforcement
          </h2>
          <p>
            If you notice copyright infringement, uncredited work, or violations of these guidelines, please contact our curation team at{" "}
            <a href="mailto:curation@layerat.com" className="text-neutral-900 dark:text-white font-bold underline">
              curation@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
