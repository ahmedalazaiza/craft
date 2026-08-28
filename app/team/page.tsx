import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Sparkles,
  Users,
  MapPin,
  Compass,
  ArrowRight,
  Shield,
  Palette,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Our Team — Curators, Designers & Builders",
  description:
    "Meet the team, curators, and creative technologists behind the Craft platform.",
  path: "/team",
});

export const revalidate = 3600;

interface TeamMember {
  name: string;
  role: string;
  location: string;
  bio: string;
  avatar: string;
  discipline: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Ahmed Al-Azaiza",
    role: "Founder & Lead Architect",
    location: "Global",
    bio: "Obsessed with micro-interactions, high-speed UI architecture, and typographic perfection.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    discipline: "Product & Architecture",
  },
  {
    name: "Elena Rostova",
    role: "Head of Editorial & Curation",
    location: "Berlin, DE",
    bio: "Ex-art director at Monolith Design. Curates standout visual monographs and oversees typography standards.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    discipline: "Editorial Direction",
  },
  {
    name: "Marcus Vance",
    role: "Creative Technologist & 3D Lead",
    location: "Tokyo, JP",
    bio: "Pioneering spatial computing interfaces, real-time shaders, and immersive interactive graphics.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    discipline: "3D & Motion",
  },
  {
    name: "Maya Lin",
    role: "Brand Identity & Specimen Curator",
    location: "London, UK",
    bio: "Specializing in timeless identity systems, foundry specimens, and minimalist packaging.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    discipline: "Brand & Typography",
  },
];

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-10 space-y-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Our Team", isCurrent: true },
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-14 lg:p-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] px-4 py-1.5 text-xs font-semibold text-[var(--content-secondary)]">
          <Users className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Curators & Builders</span>
        </div>

        <h1
          className={cn(
            bricolage.className,
            "text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--content-primary)] max-w-4xl mx-auto leading-[1.08]"
          )}
        >
          Built by makers,{" "}
          <span className="inline-block rounded-xl bg-[var(--chip-bg)] text-[var(--chip-fg)] dark:bg-[var(--accent)] dark:text-[#090C09] px-3.5 py-0.5 mt-1 border border-[var(--border-neutral)] dark:border-[var(--accent)]">
            for makers.
          </span>
        </h1>

        <p className="type-body-large text-[var(--content-secondary)] max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
          We are a distributed team of designers, engineers, and typographers dedicated to building the premier home for digital craftsmanship.
        </p>
      </section>

      {/* Team Grid */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--border-neutral)]">
          <div>
            <h2 className={cn(bricolage.className, "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]")}>
              Core Collective
            </h2>
            <p className="text-sm text-[var(--content-secondary)] mt-1">
              The creative stewards directing the curation and technical infrastructure of Craft.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--content-tertiary)] uppercase tracking-wider">
            4 Core Curators
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col justify-between rounded-[24px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-6 transition-all hover:border-[var(--content-tertiary)] hover:shadow-sm"
            >
              <div className="space-y-4">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-[var(--border-neutral)]">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
                    {member.role}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-[var(--content-tertiary)] pt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{member.location}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-neutral)]">
                <span className="inline-block rounded-full bg-[var(--bg-neutral)] px-2.5 py-1 text-[11px] font-medium text-[var(--content-secondary)]">
                  {member.discipline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Banner */}
      <section className="rounded-[32px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
              <Palette className="h-5 w-5" />
            </div>
            <h4 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
              Editorial Quality
            </h4>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
              Every feature and layout is designed with reverence for typography, whitespace, and visual balance.
            </p>
          </div>

          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
              <Terminal className="h-5 w-5" />
            </div>
            <h4 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
              Zero Bloat Engineering
            </h4>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
              Instant 0ms routing, sub-millisecond in-memory cache, and lightning-fast edge assets.
            </p>
          </div>

          <div className="space-y-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-neutral)] text-[var(--primary-forest-green)] dark:text-[var(--accent)] mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)]")}>
              Independent & Creator-Led
            </h4>
            <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed">
              Self-funded, privacy-first, and aligned 100% with the interests of our creators.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
