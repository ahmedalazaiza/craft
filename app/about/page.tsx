import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Sparkles,
  Layers,
  Compass,
  ArrowRight,
  ShieldCheck,
  Eye,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "About Us — The Digital Sanctuary for Pure Craft",
  description:
    "Craft is a curated platform for designers, art directors, and creative studios to present living case studies without algorithmic noise.",
  path: "/about",
});

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-10 space-y-16">
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
          <span>Our Vision & Philosophy</span>
        </div>

        <h1
          className={cn(
            bricolage.className,
            "text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--content-primary)] max-w-4xl mx-auto leading-[1.08]"
          )}
        >
          A digital sanctuary designed for{" "}
          <span className="inline-block rounded-xl bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[var(--accent)] dark:text-[#090C09] px-3.5 py-0.5 mt-1 border border-[var(--border-neutral)] dark:border-[var(--accent)]">
            pure craft.
          </span>
        </h1>

        <p className="type-body-large text-[var(--content-secondary)] max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
          We built Craft because creative portfolios deserve better than infinite feeds, compression artifacts, and algorithmic noise. Here, design speaks for itself.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/explore"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-[var(--accent)] text-[#090C09] hover:bg-[var(--accent-hover)] px-6 py-3 text-sm shadow-xs transition-all"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Curated Work</span>
          </Link>
          <Link
            href="/signup"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-semibold bg-[var(--bg-neutral)] text-[var(--content-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-neutral)] px-6 py-3 text-sm transition-all"
          >
            <span>Join as Creator</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Manifesto / Why Craft */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            Intrinsic Resolution
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed">
            Every visual monograph is rendered in uncompromised clarity with native aspect ratios, custom layout spreads, and zero aggressive compression.
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            Zero Algorithmic Bias
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed">
            No engagement bait, no hidden algorithms deciding your reach. Discoveries are powered by genuine peer appreciation and editorial curation.
          </p>
        </div>

        <div className="rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-10 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className={cn(bricolage.className, "text-2xl font-bold text-[var(--content-primary)]")}>
            100% Creator Ownership
          </h3>
          <p className="type-body-default text-[var(--content-secondary)] leading-relaxed">
            Your ideas and assets belong entirely to you. Craft provides a pristine canvas to showcase your identity, tools, process, and case studies.
          </p>
        </div>
      </section>

      {/* Story & Background */}
      <section className="rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-14 space-y-8">
        <div className="max-w-3xl space-y-6">
          <h2 className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--content-primary)]")}>
            Our Story & Origin
          </h2>
          <div className="space-y-4 type-body-default text-[var(--content-secondary)] leading-relaxed text-base sm:text-lg">
            <p>
              Craft started with a simple observation: as social networks shifted toward fast-paced video and algorithmic feeds, designers lost their natural habitat for deep, reflective visual storytelling.
            </p>
            <p>
              We wanted a place reminiscent of high-end design monographs and independent studio books—where typography is respected, image fidelity is preserved, and peer discussions center on craft, rationale, and execution.
            </p>
            <p>
              Today, Craft connects designers, art directors, 3D artists, and creative technologists across Tokyo, London, New York, Berlin, and beyond.
            </p>
          </div>
        </div>

        {/* Platform Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[var(--border-neutral)]">
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              100%
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Creator IP Ownership</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              0ms
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Instant Route Navigation</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              4K+
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">High-DPI Spreads</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-extrabold text-[var(--primary-forest-green)] dark:text-[var(--accent)]")}>
              Global
            </p>
            <p className="text-xs sm:text-sm font-medium text-[var(--content-secondary)]">Creative Community</p>
          </div>
        </div>
      </section>
    </div>
  );
}
