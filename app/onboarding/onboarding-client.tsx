"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/session-context";
import { AvatarUploader } from "@/components/onboarding/avatar-uploader";
import { SkillsPicker } from "@/components/onboarding/skills-picker";
import { DEFAULT_AVATAR_URL, getValidAvatarUrl, getInitials } from "@/lib/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/ui/motion-wrapper";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe,
  MapPin,
  User,
  ShieldCheck,
  ExternalLink,
  Layers,
  FileText,
  Rocket,
  Check,
} from "lucide-react";
import { bricolage } from "@/lib/fonts";
import { cn, normalizeUrl, formatDisplayUrl } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { LocationInput } from "@/components/ui/location-input";

export function OnboardingClient() {
  const router = useRouter();
  const { user, updateProfile } = useSession();

  // Current Step State (1: Visual Persona, 2: Disciplines, 3: Bio & Links, 4: Live Preview & Launch)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  // Form Fields State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || DEFAULT_AVATAR_URL);
  const [location, setLocation] = useState(user?.location || "Worldwide");
  const [skills, setSkills] = useState<string[]>(
    user?.skills && user.skills.length > 0
      ? user.skills
      : ["Brand Identity", "UI/UX Design"]
  );
  const [bio, setBio] = useState(
    user?.bio || "Independent designer crafting identity systems and digital experiences."
  );
  const [website, setWebsite] = useState(user?.website || "");

  // Sync state when user session finishes loading from Supabase
  React.useEffect(() => {
    if (user) {
      if (user.displayName) setDisplayName((prev) => prev || user.displayName);
      if (user.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
      if (user.location && user.location !== "Worldwide") {
        setLocation(user.location);
      }
      if (user.skills && user.skills.length > 0) {
        setSkills(user.skills);
      }
      if (user.bio && user.bio !== "Independent designer crafting identity systems and digital experiences.") {
        setBio(user.bio);
      }
      if (user.website) {
        setWebsite((prev) => prev || user.website || "");
      }
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSaveAndLaunch = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || user?.displayName || "Creator",
        avatarUrl,
        location,
        city: location.split(",")[0] || location,
        skills,
        bio,
        website: normalizeUrl(website) || undefined,
      });

      setHasLaunched(true);
      setTimeout(() => {
        router.push("/me");
      }, 1500);
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      setIsSaving(false);
    }
  };

  // Steps configuration
  const steps = [
    { number: 1, title: "Visual Persona", icon: <User className="h-4 w-4" /> },
    { number: 2, title: "Disciplines", icon: <Layers className="h-4 w-4" /> },
    { number: 3, title: "Manifesto & Links", icon: <FileText className="h-4 w-4" /> },
    { number: 4, title: "Launch Preview", icon: <Rocket className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-12">
      <FadeIn>
        {/* Header Title & Progress Indicator */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--chip-bg)] px-3.5 py-1 text-[11px] font-semibold text-[var(--chip-fg)] mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Profile Onboarding Experience</span>
          </div>

          <h1
            className={cn(
              bricolage.className,
              "text-3xl sm:text-4xl font-bold text-[var(--content-primary)] tracking-tight"
            )}
          >
            Shape your creator presence
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[var(--content-secondary)]">
            Introduce yourself to the global directory and curate your aesthetic coordinates.
          </p>

          {/* Stepper Dots Bar */}
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3">
            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number as 1 | 2 | 3 | 4)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    isCurrent
                      ? "bg-[#7110DE] text-white shadow-xs"
                      : isCompleted
                      ? "bg-[var(--bg-neutral)] text-[var(--content-primary)] border border-[var(--border-neutral)]"
                      : "text-[var(--content-tertiary)] hover:text-[var(--content-secondary)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      isCurrent
                        ? "bg-white text-[#7110DE]"
                        : isCompleted
                        ? "bg-[#7110DE] text-white"
                        : "bg-[var(--bg-neutral)] text-[var(--content-tertiary)]"
                    )}
                  >
                    {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : step.number}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left: Interactive Form Step Card */}
          <div className="lg:col-span-7">
            <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] rounded-[32px] p-6 sm:p-8 shadow-xl dark:shadow-none">
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {/* STEP 1: VISUAL PERSONA */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-[var(--content-primary)]">
                          Visual Identity & Location
                        </h2>
                        <p className="text-xs text-[var(--content-secondary)] mt-1">
                          Upload your avatar or choose a crafted preset, and set your location.
                        </p>
                      </div>

                      {/* Avatar Uploader */}
                      <AvatarUploader
                        currentAvatar={avatarUrl}
                        onAvatarChange={setAvatarUrl}
                        displayName={displayName}
                      />

                      {/* Display Name Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--content-primary)]">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your full name or studio alias"
                          className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-3 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
                        />
                      </div>

                      {/* Location Selector with IP Auto-Detect & Autocomplete */}
                      <LocationInput
                        value={location}
                        onChange={setLocation}
                        autoDetectOnMount={true}
                        enableAutoDetect={true}
                        showPresets={true}
                      />
                    </motion.div>
                  )}

                  {/* STEP 2: CRAFT DISCIPLINES */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-[var(--content-primary)]">
                          Creative Disciplines & Skills
                        </h2>
                        <p className="text-xs text-[var(--content-secondary)] mt-1">
                          Select the primary domains of design, art direction, and medium you specialize in.
                        </p>
                      </div>

                      <SkillsPicker
                        selectedSkills={skills}
                        onChange={setSkills}
                      />
                    </motion.div>
                  )}

                  {/* STEP 3: BIO & ONLINE COORDINATES */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-xl font-bold text-[var(--content-primary)]">
                          Bio & Portfolio Coordinates
                        </h2>
                        <p className="text-xs text-[var(--content-secondary)] mt-1">
                          Write a concise summary of your practice and link your personal website.
                        </p>
                      </div>

                      {/* Bio Textarea */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[var(--content-primary)]">
                            Creative Bio / Statement
                          </label>
                          <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
                            {bio.length}/280
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          maxLength={280}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Briefly describe your design philosophy, past work, and interests..."
                          className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 p-4 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden resize-none leading-relaxed"
                        />
                      </div>

                      {/* Website URL */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--content-primary)] flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-[var(--content-secondary)]" />
                          <span>Website / Portfolio URL</span>
                        </label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="www.yourname.design or https://..."
                          className="w-full rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-neutral)]/50 px-4 py-3 text-xs sm:text-sm text-[var(--content-primary)] focus:border-[var(--input-focus-border)] focus:ring-2 focus:ring-[var(--input-focus-ring)] focus:outline-hidden"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: LIVE LAUNCH PREVIEW */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6 text-center py-4"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--chip-bg)] border border-[var(--border-neutral)] text-[var(--chip-fg)] dark:bg-[#7110DE]/20 dark:border-[#7110DE]/30 dark:text-[#7110DE] mx-auto shadow-sm animate-bounce">
                        <Rocket className="h-8 w-8" />
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-[var(--content-primary)]">
                          Ready for launch!
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--content-secondary)] max-w-sm mx-auto">
                          Your creator profile is configured. Review your live directory card on the right and click Launch to enter your studio.
                        </p>
                      </div>

                      {hasLaunched ? (
                        <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span>Profile Launched! Redirecting to your workspace...</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="accent"
                          size="lg"
                          disabled={isSaving}
                          onClick={handleSaveAndLaunch}
                          className="w-full max-w-md mx-auto font-bold shadow-lg gap-2 text-sm"
                        >
                          {isSaving ? "Saving profile..." : "Launch My Creator Profile"}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wizard Navigation Buttons Footer */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-[var(--border-neutral)]">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      className="gap-2 text-xs font-semibold text-[var(--content-secondary)]"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>
                  ) : (
                    <Link
                      href="/me"
                      className={buttonVariants({
                        variant: "ghost",
                        className: "text-xs text-[var(--content-tertiary)] hover:text-[var(--content-primary)]",
                      })}
                    >
                      Skip for now
                    </Link>
                  )}

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleNext}
                      className="gap-2 font-bold shadow-xs text-xs sm:text-sm"
                    >
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Live Interactive Card Preview */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono uppercase font-bold text-[var(--content-tertiary)] flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[var(--content-tertiary)]" />
                  <span>Live Directory Preview</span>
                </span>
                <span className="text-[11px] text-[var(--content-tertiary)]">
                  Updates in real-time
                </span>
              </div>

              {/* Real-time Preview Creator Card */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[var(--border-neutral)] bg-neutral-100 dark:bg-neutral-800 shrink-0 flex items-center justify-center select-none">
                      {avatarUrl && avatarUrl !== DEFAULT_AVATAR_URL ? (
                        <Image
                          src={getValidAvatarUrl(avatarUrl)}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                        />
                      ) : getInitials(displayName || user?.displayName) ? (
                        <span className="text-base font-black text-neutral-800 dark:text-neutral-100 tracking-wider">
                          {getInitials(displayName || user?.displayName)}
                        </span>
                      ) : (
                        <User className="h-6 w-6 text-neutral-400 dark:text-neutral-500 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-[var(--content-primary)] truncate">
                          {displayName || "Your Name"}
                        </h3>
                        <VerifiedBadge size="sm" />
                      </div>
                      <span className="block text-xs font-mono text-[var(--content-tertiary)] truncate">
                        @{user?.username || "handle"}
                      </span>
                    </div>
                  </div>

                  <OnlineBadge isOnline={true} />
                </div>

                {/* Bio */}
                <p className="mt-4 text-xs text-[var(--content-secondary)] line-clamp-2 leading-relaxed">
                  {bio || "Your creative statement and bio will appear here."}
                </p>

                {/* Location & Website */}
                <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--content-tertiary)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[var(--content-tertiary)]" />
                    <span className="truncate">{location}</span>
                  </span>
                  {website && (
                    <span className="flex items-center gap-1 truncate text-[var(--content-link)]">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{formatDisplayUrl(website)}</span>
                    </span>
                  )}
                </div>

                {/* Skills Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[var(--chip-bg)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--chip-fg)]"
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="rounded-full bg-[var(--bg-neutral)] px-2 py-0.5 text-[10px] font-mono text-[var(--content-tertiary)]">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Mock portfolio gallery strip */}
                <div className="mt-5 grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-neutral)]/60">
                  <div className="aspect-square rounded-xl bg-[var(--bg-neutral)] flex items-center justify-center text-[10px] text-[var(--content-tertiary)] font-mono">
                    Project 1
                  </div>
                  <div className="aspect-square rounded-xl bg-[var(--bg-neutral)] flex items-center justify-center text-[10px] text-[var(--content-tertiary)] font-mono">
                    Project 2
                  </div>
                  <div className="aspect-square rounded-xl bg-[var(--bg-neutral)] flex items-center justify-center text-[10px] text-[var(--content-tertiary)] font-mono">
                    Project 3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
