import { Metadata } from "next";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchLegalDocument } from "@/lib/supabase/queries";
import { ShieldCheck, Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Community Guidelines — Curation & Peer Standards",
  description:
    "Standards for publishing original case studies, delivering thoughtful peer feedback, and maintaining Layerat's editorial excellence.",
  path: "/guidelines",
});

export const revalidate = 3600; // 1 hour ISR revalidation

export default async function GuidelinesPage() {
  const doc = await fetchLegalDocument("guidelines");

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(doc.updatedAt || doc.publishedAt));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Community Guidelines", url: "/guidelines" },
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
            {doc.subtitle || "Peer & Curation Standards"}
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

        <p className="text-sm sm:text-base text-[var(--content-secondary)] font-normal leading-relaxed">
          {doc.summary ||
            "The shared principles and curation expectations that keep Layerat a high-signal sanctuary for creators worldwide."}
        </p>

        <p className="text-xs sm:text-sm font-mono text-[var(--content-tertiary)]">
          Last revised: {formattedDate}
        </p>
      </div>

      {/* 3 Core Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <Award className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Originality & Provenance
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            Publish authentic case studies that you personally designed, directed, or contributed to with accurate attribution.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Thoughtful Critique
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            Provide respectful, substantive feedback on typography, layout hierarchy, interaction, and conceptual execution.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 space-y-3 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--content-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-base font-bold text-[var(--content-primary)]")}>
            Zero Harassment
          </h3>
          <p className="text-xs text-[var(--content-secondary)] leading-relaxed font-normal">
            Layerat maintains zero tolerance for hate speech, harassment, impersonation, or predatory behavior.
          </p>
        </div>
      </div>

      {/* Detail Editorial Sections from Database */}
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

        {/* Contact Section */}
        <section className="space-y-3 pt-6 border-t border-[var(--border-neutral)]">
          <h2
            className={cn(
              bricolage.className,
              "text-xl sm:text-2xl font-bold text-[var(--content-primary)]"
            )}
          >
            Editorial Curation Contact
          </h2>
          <p>
            If you notice copyright infringement or violations of these guidelines, reach out to our curation team or submit a report using the flag icon on any monograph:{" "}
            <a
              href="mailto:curation@layerat.com"
              className="text-[var(--content-primary)] font-bold underline"
            >
              curation@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
