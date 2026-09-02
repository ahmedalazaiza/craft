import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Terms of Use — Layerat Platform Agreement",
  description:
    "Review the Terms of Use governing your portfolio publishing, intellectual property, and community participation on Layerat.",
  path: "/terms",
});

export const revalidate = 86400;

export default function TermsPage() {
  const lastUpdated = "August 31, 2026";
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
          { label: "Terms of Use", isCurrent: true },
        ]}
      />

      {/* Header */}
      <div className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Legal Agreement
        </span>

        <h1 className={cn(bricolage.className, "text-3xl sm:text-5xl font-black text-neutral-950 dark:text-white tracking-tight leading-tight")}>
          Terms of Use
        </h1>

        <p className="text-xs sm:text-sm font-mono text-neutral-400 dark:text-neutral-500">
          Last modified: {lastUpdated} • Effective immediately for all registered creators and visitors.
        </p>
      </div>

      {/* Creator Pledge Highlight Card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#141713] p-6 sm:p-8 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-neutral-950 dark:text-white font-bold text-sm">
          <ShieldCheck className="h-5 w-5 text-neutral-950 dark:text-white" />
          <span>The Layerat Creator Pledge</span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
          <strong className="text-neutral-900 dark:text-neutral-200 font-bold">You own 100% of your work.</strong> When you upload projects, visual spreads, fonts, or case studies to Layerat, you retain all copyrights, trademarks, and intellectual property. We merely require the standard non-exclusive license to render and display your work across the platform.
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base font-normal">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing, creating an account on, or interacting with Layerat (&quot;the Platform&quot;), you agree to be bound by these Terms of Use and our Community Guidelines. If you do not agree with any part of these terms, you must refrain from using the Platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            2. Creator Intellectual Property & Ownership
          </h2>
          <p>
            You represent and warrant that you own or have obtained all necessary licenses, rights, consents, and permissions to publish any content, imagery, videos, or assets uploaded to your Layerat portfolio.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>We do not claim any ownership rights over your creative assets.</li>
            <li>You may edit, unpublish, or permanently delete your projects at any time from your Studio Dashboard.</li>
            <li>Plagiarism, uncredited reproduction, or unauthorized impersonation of other designers is strictly prohibited.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            3. Account Security & Verification
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to immediately notify Layerat of any unauthorized use or security breach.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            4. Acceptable Use & Conduct
          </h2>
          <p>
            Layerat is an editorial platform devoted to professional design and visual culture. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            <li>Upload malicious scripts, spam, or automated bot interactions.</li>
            <li>Post defamatory, abusive, infringing, or harmful content.</li>
            <li>Attempt to reverse engineer or disrupt platform infrastructure and APIs.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            5. Termination & Modifications
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or engage in copyright infringement. We may update these terms periodically; continued use of Layerat following updates constitutes acceptance.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className={cn(bricolage.className, "text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white")}>
            6. Contact & Legal Inquiries
          </h2>
          <p>
            For questions regarding these terms, DMCA notices, or intellectual property questions, please reach out to our legal collective at{" "}
            <a href="mailto:legal@layerat.com" className="text-neutral-900 dark:text-white font-bold underline">
              legal@layerat.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
