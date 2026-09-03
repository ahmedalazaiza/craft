import { Metadata } from "next";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchLegalDocument } from "@/lib/supabase/queries";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Use — Layerat Platform Agreement",
  description:
    "Review the Terms of Use governing your portfolio publishing, intellectual property, and community participation on Layerat.",
  path: "/terms",
});

export const revalidate = 3600; // 1 hour ISR revalidation

export default async function TermsPage() {
  const doc = await fetchLegalDocument("terms");

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(doc.updatedAt || doc.publishedAt));

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Terms of Use", url: "/terms" },
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
            {doc.subtitle || "Legal Agreement"}
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
          Last modified: {formattedDate} • Effective immediately for all registered creators and visitors.
        </p>
      </div>

      {/* Creator Pledge Highlight Card */}
      {doc.summary && (
        <div className="rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[var(--content-primary)] font-bold text-sm">
            <ShieldCheck className="h-5 w-5 text-[var(--content-primary)]" />
            <span>The Layerat Creator Pledge</span>
          </div>
          <p className="text-sm text-[var(--content-secondary)] leading-relaxed font-normal">
            <strong className="text-[var(--content-primary)] font-bold">You own 100% of your work.</strong>{" "}
            {doc.summary}
          </p>
        </div>
      )}

      {/* Content Sections from Database */}
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
            Legal & Compliance Contact
          </h2>
          <p>
            For questions regarding these terms, DMCA notices, or intellectual property concerns, please reach out to our legal collective at{" "}
            <a
              href="mailto:legal@layerat.com"
              className="text-[var(--content-primary)] font-bold underline"
            >
              legal@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
