import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck, FileText, Scale, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Use — Layerat Platform Agreement",
  description:
    "Review the Terms of Use governing your portfolio publishing, intellectual property, and community participation on Layerat.",
  path: "/terms",
});

export const revalidate = 86400;

export default function TermsPage() {
  const lastUpdated = "August 28, 2026";
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Terms of Use", url: "/terms" },
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
          { label: "Terms of Use", isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-[var(--border-neutral)] pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-3.5 py-1 text-xs font-semibold text-[var(--content-secondary)]">
          <Scale className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Legal Agreement</span>
        </div>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-extrabold text-[var(--content-primary)] tracking-tight")}>
          Terms of Use
        </h1>

        <p className="text-sm text-[var(--content-tertiary)]">
          Last modified: {lastUpdated} • Effective immediately for all registered creators and visitors.
        </p>
      </div>

      {/* Summary Box */}
      <div className="rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-bold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>The Layerat Creator Pledge</span>
        </div>
        <p className="text-sm text-[var(--content-secondary)] leading-relaxed">
          <strong>You own 100% of your work.</strong> When you upload projects, visual spreads, fonts, or case studies to Layerat, you retain all copyrights, trademarks, and intellectual property. We merely ask for the non-exclusive license required to render and display your work across the platform.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing, creating an account on, or interacting with Layerat (&quot;the Platform&quot;), you agree to be bound by these Terms of Use and our Community Guidelines. If you do not agree with any part of these terms, you must refrain from using the Platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            2. Creator Intellectual Property & Ownership
          </h2>
          <p>
            You represent and warrant that you own or have obtained all necessary licenses, rights, consents, and permissions to publish any content, imagery, videos, or assets uploaded to your Layerat portfolio.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
            <li>We do not claim any ownership rights over your creative assets.</li>
            <li>You may edit, unpublish, or permanently delete your projects at any time from your Studio Dashboard.</li>
            <li>Plagiarism, uncredited reproduction, or unauthorized impersonation of other designers is strictly prohibited.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            3. Account Security & Verification
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to immediately notify Layerat of any unauthorized use or security breach.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            4. Acceptable Use & Conduct
          </h2>
          <p>
            Layerat is an editorial platform devoted to professional design and visual culture. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
            <li>Upload malicious scripts, spam, or automated bot interactions.</li>
            <li>Post defamatory, abusive, infringing, or harmful content.</li>
            <li>Attempt to reverse engineer or disrupt platform infrastructure and APIs.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            5. Termination & Modifications
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage in copyright infringement. We may update these terms periodically; continued use of Layerat following updates constitutes acceptance.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-[var(--content-primary)]")}>
            6. Contact & Legal Inquiries
          </h2>
          <p>
            For questions regarding these terms, DMCA notices, or intellectual property questions, please reach out to our legal collective at{" "}
            <a href="mailto:legal@layerat.com" className="text-[var(--primary-forest-green)] dark:text-[var(--accent)] font-semibold underline">
              legal@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
