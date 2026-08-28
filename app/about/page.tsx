import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  Eye,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "About Us — The Modern Home for Great Design",
  description:
    "Craft is a portfolio platform for designers, art directors, and creative studios to share high-resolution case studies without ads or algorithms.",
  path: "/about",
});

export const revalidate = 3600;

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-10 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", isCurrent: true },
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-14 lg:p-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-4 py-1.5 text-xs font-semibold text-[var(--content-secondary)]">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Our Story & Mission</span>
        </div>

        <h1
          className={cn(
            bricolage.className,
            "text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--content-primary)] max-w-4xl mx-auto leading-[1.08]"
          )}
        >
          The modern home for{" "}
          <span className="inline-block rounded-xl bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[var(--accent)] dark:text-[#090C09] px-3.5 py-0.5 mt-1 border border-[var(--border-neutral)] dark:border-[var(--accent)]">
            great design.
          </span>
        </h1>

        <p className="type-body-large text-[var(--content-secondary)] max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
          We built Craft because design portfolios deserve a clean, fast, and ad-free space. Here, your work speaks for itself.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/explore"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-[var(--accent)] text-[#090C09] hover:bg-[var(--accent-hover)] px-6 py-3 text-sm shadow-xs transition-all"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Projects</span>
          </Link>
          <Link
            href="/creators"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-semibold bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-6 py-3 text-sm transition-all"
          >
            <span>Discover Creators</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            High Resolution
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
            Upload full project case studies in crisp, uncompressed quality with custom image layouts and typography.
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            No Algorithms
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
            No social feed noise or hidden algorithms. Discoveries are driven purely by design quality and authentic peer feedback.
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            100% Creator Ownership
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed text-sm sm:text-base">
            You own all rights to your work. Share your case studies, studio story, and design process on your own terms.
          </p>
        </div>
      </section>

      {/* Story & Background */}
      <section className="rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-14 space-y-8">
        <div className="max-w-3xl space-y-6">
          <h2 className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--content-primary)]")}>
            Why We Started Craft
          </h2>
          <div className="space-y-4 type-body-default text-[var(--content-secondary)] leading-relaxed text-base sm:text-lg">
            <p>
              Craft was created to give designers, art directors, and creative studios a clean, distraction-free home for their best work.
            </p>
            <p>
              While modern social feeds focus on quick video clips and engagement tricks, we believe great design needs room to breathe—with clear typography, high-resolution imagery, and thoughtful write-ups.
            </p>
            <p>
              Whether you specialize in UI/UX design, branding, 3D motion, or architecture, Craft gives you the tools to share your creative process and connect with other designers around the world.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[var(--border-neutral)]">
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              100%
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Creator Ownership</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              0ms
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Instant Navigation</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              4K+
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">High-Resolution Quality</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              Global
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Designer Network</p>
          </div>
        </div>
      </section>
    </div>
  );
}
