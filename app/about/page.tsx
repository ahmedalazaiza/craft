import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
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
    "Layerat is a portfolio platform for designers, art directors, and creative studios to share high-resolution case studies without ads or algorithms.",
  path: "/about",
});

export const revalidate = 3600;

export default function AboutPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 sm:py-10 space-y-20">
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
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Our Story & Mission
        </span>

        <h1
          className={cn(
            bricolage.className,
            "text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.06]"
          )}
        >
          The modern home for great design.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal max-w-2xl mx-auto">
          We built Layerat because creative work deserves a fast, focused, and ad-free space. Here, high-resolution craftsmanship speaks for itself.
        </p>

        {/* Clean Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/explore"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-[#7110DE] text-white hover:bg-[#5F0EBA] px-7 py-3 text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Projects</span>
          </Link>
          <Link
            href="/creators"
            prefetch={true}
            className="inline-flex items-center justify-center gap-2 rounded-full font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 px-6 py-3 text-sm transition-colors shadow-xs"
          >
            <span>Discover Creators</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-8 space-y-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-xl font-bold text-neutral-950 dark:text-white")}>
            High Resolution
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Upload full project case studies in crisp, uncompressed quality with custom image layouts, process notes, and typography.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-8 space-y-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-xl font-bold text-neutral-950 dark:text-white")}>
            No Algorithms
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            No social feed noise or algorithmic feeds. Discoveries are driven purely by design quality and authentic peer appreciation.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141713] p-8 space-y-4 shadow-xs">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className={cn(bricolage.className, "text-xl font-bold text-neutral-950 dark:text-white")}>
            100% Creator Ownership
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            You retain full intellectual property rights to your work. Share your portfolio and story completely on your own terms.
          </p>
        </div>
      </section>

      {/* Story & Background Section */}
      <section className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#141713] p-8 sm:p-14 lg:p-16 space-y-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            The Philosophy
          </span>
          <h2 className={cn(bricolage.className, "text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white tracking-tight")}>
            Why We Started Layerat
          </h2>
          <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm sm:text-base font-normal">
            <p>
              Layerat was created to give designers, art directors, and creative studios a clean, distraction-free home for their best work.
            </p>
            <p>
              While modern social feeds prioritize short-form clips and algorithmic hooks, we believe great design needs room to breathe—with clear typography, high-resolution imagery, and thoughtful write-ups.
            </p>
            <p>
              Whether you specialize in UI/UX design, branding, 3D motion, or architecture, Layerat gives you the tools to share your creative process and connect with other designers around the world.
            </p>
          </div>
        </div>

        {/* Highlights / Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white")}>
              100%
            </p>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Creator Ownership</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white")}>
              0ms
            </p>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Instant Navigation</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white")}>
              4K+
            </p>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">High-Resolution Quality</p>
          </div>
          <div className="space-y-1">
            <p className={cn(bricolage.className, "text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white")}>
              Global
            </p>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">Designer Network</p>
          </div>
        </div>
      </section>
    </div>
  );
}
