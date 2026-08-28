"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { bricolage } from "@/lib/fonts";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { OnlineBadge } from "@/components/ui/online-badge";
import { LocationInput } from "@/components/ui/location-input";
import { SkillsPicker } from "@/components/onboarding/skills-picker";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { PasswordResetModal } from "@/components/settings/password-reset-modal";
import { requestPasswordResetInDb } from "@/lib/supabase/queries";
import { uploadMediaFile } from "@/lib/supabase/storage";
import { DEFAULT_AVATAR_URL, getValidAvatarUrl } from "@/lib/avatar";
import { supabase } from "@/lib/supabase/client";
import {
  User,
  Shield,
  Bell,
  Trash2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  AlertTriangle,
  KeyRound,
  Camera,
  Check,
  Globe,
  MapPin,
  Sparkles,
  Layers,
  Heart,
  FolderKanban,
  Settings,
  Lock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "security" | "preferences" | "danger";

export function SettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, projects, updateProfile, isLoadingDb } = useSession();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Edit State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || user?.city || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || DEFAULT_AVATAR_URL);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Security / Password Reset State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Preferences state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [commentNotifs, setCommentNotifs] = useState(true);
  const [appreciateNotifs, setAppreciateNotifs] = useState(true);
  const [followerNotifs, setFollowerNotifs] = useState(true);
  const [directoryDiscoverable, setDirectoryDiscoverable] = useState(true);
  const [preferencesSavedNotice, setPreferencesSavedNotice] = useState(false);

  // Synchronize initial state when user session loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || "");
      setLocation(user.location || user.city || "");
      setWebsite(user.website || "");
      setAvatarUrl(user.avatarUrl || DEFAULT_AVATAR_URL);
      setSkills(user.skills || []);
    }
  }, [user]);

  // Check for password reset trigger from URL or Auth State
  useEffect(() => {
    const isResetParam = searchParams.get("reset_password") === "true";
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token");
      const isCancelled = sessionStorage.getItem("craft_password_reset_cancelled") === "true";
      const isCompleted = sessionStorage.getItem("craft_password_reset_completed") === "true";

      if ((isResetParam || isRecoveryHash) && !isCancelled && !isCompleted) {
        setIsPasswordModalOpen(true);
      }
    }

    // Listener for auth state password recovery event
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordModalOpen(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  // Cooldown countdown timer for password reset email
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  // Handle Avatar Upload
  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const cdnUrl = await uploadMediaFile(file, "project-media", "avatars");
      setAvatarUrl(cdnUrl);
      // Auto-update profile avatar
      await updateProfile({ avatarUrl: cdnUrl });
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      alert("Display name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    setProfileSavedSuccess(false);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        city: location.trim(),
        website: website.trim() || undefined,
        avatarUrl,
        skills,
      });
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Send Password Reset Email
  const handleSendPasswordReset = async () => {
    if (!user?.email || isSendingReset || resetCooldown > 0) return;

    setIsSendingReset(true);
    setResetSentSuccess(false);
    setResetError(null);

    try {
      const res = await requestPasswordResetInDb(user.email);
      if (res.success) {
        setResetSentSuccess(true);
        setResetCooldown(60); // 60s cooldown
      } else {
        setResetError(res.error || "Failed to dispatch password reset email.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to send reset link.";
      setResetError(errorMsg);
    } finally {
      setIsSendingReset(false);
    }
  };

  const triggerPreferenceSave = () => {
    setPreferencesSavedNotice(true);
    setTimeout(() => setPreferencesSavedNotice(false), 2500);
  };

  // Projects stats for creator overview
  const userProjects = user ? projects.filter((p) => p.creator.username.toLowerCase() === user.username.toLowerCase()) : [];
  const publishedProjects = userProjects.filter((p) => p.published);
  const totalAppreciations = userProjects.reduce((sum, p) => sum + p.appreciations, 0);

  if (isLoadingDb) {
    return (
      <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary-forest-green)]" />
          <span className="text-xs font-semibold text-[var(--content-tertiary)]">
            Loading Studio Settings...
          </span>
        </div>
      </div>
    );
  }

  // Guest State -> Auth Required
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-10 rounded-[28px] shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] mx-auto mb-4 text-[var(--primary-forest-green)]">
            <User className="h-8 w-8" />
          </div>
          <h1 className="type-title-section text-[var(--content-primary)] font-bold text-2xl">
            Account Settings Authentication Required
          </h1>
          <p className="mt-2 type-body-default text-[var(--content-secondary)]">
            Please log in with your creator credentials to access and modify your studio profile, security, and account preferences.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({
                variant: "accent",
                className: "font-bold shadow-xs",
              })}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold",
              })}
            >
              Create account
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1580px] px-4 sm:px-6 py-6 sm:py-10">
      <FadeIn>
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "My Studio", href: "/me" },
            { label: "Account Settings", isCurrent: true },
          ]}
        />

        {/* ========================================================================= */}
        {/* TOP HERO: STUDIO IDENTITY & ACCOUNT OVERVIEW BANNER                       */}
        {/* ========================================================================= */}
        <div className="mt-6 rounded-[28px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            {/* User Identity Info */}
            <div className="flex items-center gap-5">
              {/* Avatar with Click-to-Upload */}
              <div className="relative group">
                <div
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-[var(--bg-neutral)] ring-4 ring-[var(--border-neutral)] shadow-sm cursor-pointer hover:ring-[var(--primary-forest-green)] transition-all"
                  title="Click to replace avatar photo"
                >
                  <Image
                    src={getValidAvatarUrl(avatarUrl)}
                    alt={displayName || user.displayName}
                    fill
                    sizes="96px"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                    <Camera className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Change</span>
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <OnlineBadge userId={user.id} username={user.username} size="lg" className="absolute bottom-0 right-0 z-10" />
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className={cn(
                      bricolage.className,
                      "text-2xl sm:text-3xl font-black text-[var(--content-primary)] tracking-tight"
                    )}
                  >
                    {displayName || user.displayName}
                  </h1>
                  {user.isVerified && <VerifiedBadge size="default" />}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--content-secondary)] font-mono">
                  <span className="font-semibold text-[var(--content-primary)]">@{user.username}</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-xs text-[var(--content-tertiary)] pt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-neutral)]">
              <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-4 py-2 text-center shadow-xs">
                <FolderKanban className="h-4 w-4 text-[var(--primary-forest-green)]" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--content-primary)]">
                    {publishedProjects.length} Works
                  </span>
                  <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                    Published
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] px-4 py-2 text-center shadow-xs">
                <Heart className="h-4 w-4 text-[var(--primary-forest-green)]" />
                <div className="text-left">
                  <span className="block text-xs font-bold text-[var(--content-primary)]">
                    {totalAppreciations} Hearts
                  </span>
                  <span className="text-[10px] text-[var(--content-tertiary)] uppercase font-mono">
                    Received
                  </span>
                </div>
              </div>

              <Link
                href={`/u/${user.username}`}
                target="_blank"
                className={buttonVariants({
                  variant: "secondary",
                  size: "default",
                  className: "gap-1.5 font-bold shadow-xs",
                })}
              >
                <span>View Public Studio</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          ref={avatarFileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleAvatarFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {/* ========================================================================= */}
        {/* MAIN SETTINGS GRID: SIDEBAR TABS (Left) + TAB PANELS (Right)              */}
        {/* ========================================================================= */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-3">
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto p-1.5 rounded-[22px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "profile"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <User className="h-4 w-4 shrink-0" />
                <span>Profile & Studio Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "security"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                <span>Security & Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "preferences"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)] shadow-xs"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
                )}
              >
                <Bell className="h-4 w-4 shrink-0" />
                <span>Notifications & Privacy</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("danger")}
                className={cn(
                  "flex items-center gap-3 rounded-[14px] px-4 py-3 text-xs font-bold transition-all whitespace-nowrap cursor-pointer text-left w-full",
                  activeTab === "danger"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                )}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span>Danger Zone</span>
              </button>
            </nav>

            {/* Quick Context Card */}
            <div className="hidden lg:block p-4 rounded-[20px] bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-xs text-[var(--content-secondary)] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[var(--content-primary)]">
                <Lock className="h-3.5 w-3.5 text-[var(--primary-forest-green)]" />
                <span>Encrypted Studio</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--content-tertiary)]">
                Your portfolio data, custom media assets, and security credentials are authenticated through Supabase Row-Level Security.
              </p>
            </div>
          </aside>

          {/* Settings Main Content Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* ============================================================= */}
            {/* 1. PROFILE & STUDIO DETAILS TAB                               */}
            {/* ============================================================= */}
            {activeTab === "profile" && (
              <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h2 className="type-title-subsection text-[var(--content-primary)] font-bold text-xl">
                    Profile & Studio Presence
                  </h2>
                  <p className="mt-1 text-xs text-[var(--content-secondary)]">
                    Update your public display identity, biography manifesto, location, and creative disciplines.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Display Name & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5 text-xs">
                        Display Name
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                        required
                        className="h-11 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5 text-xs">
                        Studio Username (@handle)
                      </label>
                      <Input
                        value={`@${user.username}`}
                        disabled
                        className="h-11 text-sm font-mono bg-[var(--bg-neutral)]/50 text-[var(--content-secondary)] cursor-not-allowed"
                      />
                      <span className="text-[10px] text-[var(--content-tertiary)] mt-1 block">
                        Unique handle assigned at registration.
                      </span>
                    </div>
                  </div>

                  {/* Bio / Design Manifesto */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="type-body-default-bold text-[var(--content-primary)] text-xs">
                        About / Studio Manifesto
                      </label>
                      <span
                        className={cn(
                          "text-xs font-mono font-semibold",
                          bio.length >= 280
                            ? "text-[var(--negative)]"
                            : bio.length >= 240
                            ? "text-amber-500"
                            : "text-[var(--content-tertiary)]"
                        )}
                      >
                        {bio.length}/280 max
                      </span>
                    </div>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 280))}
                      maxLength={280}
                      rows={3}
                      placeholder="Tell the design community about your studio philosophy and design approach..."
                      className="text-sm"
                    />
                  </div>

                  {/* Location & Website */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LocationInput
                      value={location}
                      onChange={setLocation}
                      label="Location / Base"
                      placeholder="e.g. Berlin, Germany"
                      showPresets={false}
                      enableAutoDetect={true}
                    />

                    <div>
                      <label className="type-body-default-bold text-[var(--content-primary)] block mb-1.5 text-xs">
                        Website or Portfolio URL
                      </label>
                      <Input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://studio.design"
                        className="h-11 text-sm"
                      />
                    </div>
                  </div>

                  {/* Disciplines & Specializations (SkillsPicker) */}
                  <div className="pt-4 border-t border-[var(--border-neutral)]">
                    <SkillsPicker
                      selectedSkills={skills}
                      onChange={setSkills}
                    />
                  </div>

                  {/* Submit Button & Status Indicator */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border-neutral)]">
                    {profileSavedSuccess ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] animate-scale-in">
                        <Check className="h-4 w-4" />
                        <span>Profile successfully updated!</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--content-tertiary)]">
                        Changes are immediately visible across your public studio.
                      </span>
                    )}

                    <Button
                      type="submit"
                      variant="accent"
                      size="default"
                      disabled={isSavingProfile}
                      className="gap-2 font-bold shadow-xs min-w-[140px]"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* ============================================================= */}
            {/* 2. SECURITY & CREDENTIALS TAB                                */}
            {/* ============================================================= */}
            {activeTab === "security" && (
              <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h2 className="type-title-subsection text-[var(--content-primary)] font-bold text-xl">
                    Security & Authentication
                  </h2>
                  <p className="mt-1 text-xs text-[var(--content-secondary)]">
                    Manage your authenticated email credentials and dispatch password recovery links.
                  </p>
                </div>

                {/* Email Section */}
                <div className="p-5 rounded-[20px] bg-[var(--bg-neutral)]/40 border border-[var(--border-neutral)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-screen)] border border-[var(--border-neutral)] text-[var(--primary-forest-green)] shrink-0 shadow-xs">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--content-primary)]">
                          {user.email || "No email on record"}
                        </span>
                        {user.isVerified !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sentiment-positive-bg)]/15 text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified Email
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            Pending Verification
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--content-tertiary)] block mt-0.5">
                        Primary email used for sign-in, multi-factor notifications, and account recovery.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Reset Dispatch Section */}
                <div className="p-5 rounded-[20px] border border-[var(--border-neutral)] bg-[var(--bg-elevated)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[#090C09] shrink-0 mt-0.5 shadow-xs">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--content-primary)]">
                          Account Password
                        </h3>
                        <p className="text-xs text-[var(--content-secondary)] mt-0.5 max-w-md leading-relaxed">
                          To update your password, request a secure single-use recovery link. Clicking the link in your inbox will securely open the password update modal.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={handleSendPasswordReset}
                      disabled={isSendingReset || resetCooldown > 0}
                      className="gap-2 font-bold shadow-xs shrink-0"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : resetCooldown > 0 ? (
                        <>
                          <Clock className="h-4 w-4" />
                          <span>Resend in {resetCooldown}s</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>Send Password Reset Link</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {resetSentSuccess && (
                    <div className="rounded-xl border border-[var(--sentiment-positive-bg)]/30 bg-[var(--sentiment-positive-bg)]/10 p-3.5 text-xs text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] font-semibold flex items-center gap-2 animate-scale-in">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Password reset link successfully dispatched to <strong>{user.email}</strong>. Open the link to update your credentials.
                      </span>
                    </div>
                  )}

                  {resetError && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* ============================================================= */}
            {/* 3. PREFERENCES & PRIVACY TAB                                 */}
            {/* ============================================================= */}
            {activeTab === "preferences" && (
              <Card elevated className="border border-[var(--border-neutral)] bg-[var(--bg-screen)] p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div>
                  <h2 className="type-title-subsection text-[var(--content-primary)] font-bold text-xl">
                    Notification & Privacy Preferences
                  </h2>
                  <p className="mt-1 text-xs text-[var(--content-secondary)]">
                    Control your activity notifications stream, discovery visibility, and communications.
                  </p>
                </div>

                {preferencesSavedNotice && (
                  <div className="rounded-xl border border-[var(--sentiment-positive-bg)]/30 bg-[var(--sentiment-positive-bg)]/10 p-3 text-xs text-[var(--sentiment-positive-bg)] dark:text-[var(--accent)] font-semibold flex items-center gap-2 animate-scale-in">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Preferences updated successfully.</span>
                  </div>
                )}

                <div className="space-y-4 divide-y divide-[var(--border-neutral)]">
                  {/* Public Directory Visibility */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Public Creator Directory Listing
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Allow your studio and portfolio to be indexed in the global Creators directory.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDirectoryDiscoverable(!directoryDiscoverable);
                        triggerPreferenceSave();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        directoryDiscoverable ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle directory discoverability"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          directoryDiscoverable ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Appreciation Notifications */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Peer Appreciations (Likes)
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Receive activity notifications when peers appreciate your published works.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppreciateNotifs(!appreciateNotifs);
                        triggerPreferenceSave();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        appreciateNotifs ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle appreciation notifications"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          appreciateNotifs ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Critique & Feedback Notifications */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        Critiques & Discussion Notes
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Get notified when peers leave feedback and critiques on your case studies.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCommentNotifs(!commentNotifs);
                        triggerPreferenceSave();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        commentNotifs ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle critique notifications"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          commentNotifs ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  {/* Follower Notifications */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <span className="text-xs font-bold text-[var(--content-primary)] block">
                        New Followers
                      </span>
                      <span className="text-[11px] text-[var(--content-secondary)] block">
                        Receive instant alerts when new designers follow your creative studio.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFollowerNotifs(!followerNotifs);
                        triggerPreferenceSave();
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none",
                        followerNotifs ? "bg-[var(--primary-forest-green)]" : "bg-[var(--border-neutral)]"
                      )}
                      aria-label="Toggle follower notifications"
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          followerNotifs ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* ============================================================= */}
            {/* 4. DANGER ZONE TAB                                           */}
            {/* ============================================================= */}
            {activeTab === "danger" && (
              <Card elevated className="border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                    <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400">
                      Danger Zone
                    </h2>
                    <p className="mt-1 text-xs text-[var(--content-secondary)] leading-relaxed max-w-xl">
                      Actions in this section are permanent and irreversible. Deleting your account will completely purge all your published case studies, uploaded gallery spreads, peer feedback, appreciations, and studio profile from the database.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-rose-500/20 bg-[var(--bg-elevated)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[var(--content-primary)]">
                      Permanently Delete Account
                    </div>
                    <div className="text-xs text-[var(--content-secondary)] mt-0.5">
                      Once deleted, your studio handle @{user.username} and all records cannot be recovered.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full h-11 px-5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </Card>
            )}
          </main>
        </div>
      </FadeIn>

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Single-Session Password Reset Popup Modal */}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setResetSentSuccess(false);
          setActiveTab("security");
        }}
      />
    </div>
  );
}
