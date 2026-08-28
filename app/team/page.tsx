import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { constructMetadata, generateBreadcrumbJsonLd } from "@/lib/seo";
import { bricolage } from "@/lib/fonts";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Users,
  MapPin,
  Globe,
  Palette,
  Terminal,
  Shield,
  ArrowUpRight,
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
  socials: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Ahmed Al-Azaiza",
    role: "Founder & Lead Architect",
    location: "Global",
    bio: "Obsessed with micro-interactions, high-speed UI architecture, and typographic perfection.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85",
    discipline: "Product & Architecture",
    socials: {
      github: "https://github.com",
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
      website: "https://craftplatform.com",
    },
  },
  {
    name: "Elena Rostova",
    role: "Head of Editorial & Curation",
    location: "Berlin, DE",
    bio: "Ex-art director at Monolith Design. Curates standout visual monographs and oversees typography standards.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=85",
    discipline: "Editorial Direction",
    socials: {
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
      website: "https://craftplatform.com",
    },
  },
  {
    name: "Marcus Vance",
    role: "Creative Technologist & 3D Lead",
    location: "Tokyo, JP",
    bio: "Pioneering spatial computing interfaces, real-time shaders, and immersive interactive graphics.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
    discipline: "3D & Motion",
    socials: {
      github: "https://github.com",
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
    },
  },
  {
    name: "Maya Lin",
    role: "Brand Identity & Specimen Curator",
    location: "London, UK",
    bio: "Specializing in timeless identity systems, foundry specimens, and minimalist packaging.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=85",
    discipline: "Brand & Typography",
    socials: {
      twitter: "https://x.com",
      linkedin: "https://linkedin.com",
      website: "https://craftplatform.com",
    },
  },
];

// SVG Icons for Social Platforms
function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

export default function TeamPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Our Team", url: "/team" },
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
          We are a distributed collective of designers, engineers, and typographers dedicated to building the premier home for digital craftsmanship.
        </p>
      </section>

      {/* Team Grid with High-Impact Prominent Portraits */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.name}
              className="group flex flex-col justify-between rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] overflow-hidden transition-all duration-300 hover:border-[var(--content-tertiary)] hover:shadow-lg"
            >
              <div>
                {/* Large Prominent Portrait Header */}
                <div className="relative w-full aspect-[4/4.5] overflow-hidden bg-[var(--bg-neutral)]">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    priority={idx < 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Floating Discipline Badge (Top Left) */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-white/15 shadow-xs">
                      {member.discipline}
                    </span>
                  </div>

                  {/* Location Badge (Bottom Left on Image) */}
                  <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1 text-xs font-medium text-white/95 drop-shadow-sm">
                    <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>{member.location}</span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-6 space-y-2.5">
                  <h3 className={cn(bricolage.className, "text-xl font-bold text-[var(--content-primary)] tracking-tight")}>
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--primary-forest-green)] dark:text-[var(--accent)]">
                    {member.role}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--content-secondary)] leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Social Media Links Bar */}
              <div className="px-6 pb-6 pt-3 border-t border-[var(--border-neutral)] flex items-center gap-2">
                {member.socials.twitter && (
                  <a
                    href={member.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[#090C09] hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    title={`${member.name} on X / Twitter`}
                    aria-label={`${member.name} on X / Twitter`}
                  >
                    <TwitterXIcon className="h-3.5 w-3.5" />
                  </a>
                )}

                {member.socials.github && (
                  <a
                    href={member.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[#090C09] hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    title={`${member.name} on GitHub`}
                    aria-label={`${member.name} on GitHub`}
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                )}

                {member.socials.linkedin && (
                  <a
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[#090C09] hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    title={`${member.name} on LinkedIn`}
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedInIcon className="h-4 w-4" />
                  </a>
                )}

                {member.socials.website && (
                  <a
                    href={member.socials.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-neutral)] bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[#090C09] hover:bg-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    title={`${member.name}'s Website / Studio`}
                    aria-label={`${member.name}'s Website / Studio`}
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
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
