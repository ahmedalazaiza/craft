"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session-context";
import { insertContactMessage } from "@/lib/supabase/queries";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { bricolage } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  MessageSquare,
  ChevronDown,
  Check,
  LifeBuoy,
  Briefcase,
  ShieldAlert,
} from "lucide-react";

type InquiryCategory = "general" | "support" | "feedback" | "partnership" | "report";

const CATEGORIES: {
  id: InquiryCategory;
  label: string;
  desc: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "general",
    label: "General Inquiry",
    desc: "Platform questions, features, or getting started",
    tag: "Platform",
    icon: HelpCircle,
  },
  {
    id: "support",
    label: "Technical Support",
    desc: "Account access, project upload, or bug reports",
    tag: "Assistance",
    icon: LifeBuoy,
  },
  {
    id: "feedback",
    label: "Feedback & Ideas",
    desc: "Feature suggestions, UI critiques, and suggestions",
    tag: "Creative",
    icon: Sparkles,
  },
  {
    id: "partnership",
    label: "Studio & Partnership",
    desc: "Collabs, press, sponsorships, and integrations",
    tag: "Business",
    icon: Briefcase,
  },
  {
    id: "report",
    label: "Report a Violation",
    desc: "Copyright infringement, harmful content, or abuse",
    tag: "Safety",
    icon: ShieldAlert,
  },
];

export function ContactClient() {
  const { user } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<InquiryCategory>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Please provide your full name (at least 2 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address so we can reply to you.");
      return;
    }

    if (!cleanSubject || cleanSubject.length < 3) {
      setErrorMessage("Please provide a concise subject for your message (at least 3 characters).");
      return;
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      setErrorMessage("Please write a detailed message (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await insertContactMessage({
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        category,
        userId: user?.id || null,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to deliver your message. Please try again or email us directly.");
        toast.error("Could not send your message.", "Submission Failed");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      toast.success("Your message was delivered directly to our team.", "Message Sent 🎉");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      toast.error(msg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCategory("general");
    setIsDropdownOpen(false);
    setSubject("");
    setMessage("");
    setErrorMessage(null);
    if (!user) {
      setName("");
      setEmail("");
    }
  };

  const selectedCategoryObj =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const SelectedIcon = selectedCategoryObj.icon;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-[140px] py-6 sm:py-8 space-y-10 sm:space-y-14">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact Us", isCurrent: true },
        ]}
      />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] px-3 py-1 text-xs font-medium text-[var(--content-secondary)] shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-[var(--brand-secondary)] animate-pulse" />
          <span>Support & Curator Inquiries</span>
        </div>

        <h1
          className={cn(
            bricolage.className,
            "text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--content-primary)] leading-[1.08]"
          )}
        >
          We would love to hear from you
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-[var(--content-secondary)] max-w-2xl mx-auto leading-relaxed">
          Have a question about publishing, feedback on platform design, or want to collaborate? Our team of curators and engineers is here to help.
        </p>
      </div>

      {/* Main Grid: Form (Left) & Context Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-neutral)] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          {isSubmitted ? (
            /* Success Confirmation View */
            <div className="py-8 sm:py-12 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h3 className={cn(bricolage.className, "text-2xl sm:text-3xl font-bold text-[var(--content-primary)]")}>
                  Message Delivered!
                </h3>
                <p className="text-sm sm:text-base text-[var(--content-secondary)] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <span className="font-semibold text-[var(--content-primary)]">{name}</span>. We have safely logged your inquiry into our administrative dashboard and will reply to <span className="font-semibold text-[var(--content-primary)]">{email}</span> within 24-48 business hours.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "default",
                    className: "w-full sm:w-auto font-semibold px-6",
                  })}
                >
                  <span>Send Another Message</span>
                </button>
                <Link
                  href="/"
                  className={buttonVariants({
                    variant: "brand",
                    size: "default",
                    className: "w-full sm:w-auto font-bold px-6",
                  })}
                >
                  <span>Back to Home</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Authenticated User Status Notice */}
              {user && (
                <div className="p-3 rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] flex items-center justify-between text-xs text-[var(--content-secondary)]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">
                      Signed in as <strong className="text-[var(--content-primary)]">@{user.username}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--content-tertiary)] shrink-0">Account Linked</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="block text-xs font-bold text-[var(--content-primary)]">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-xs font-bold text-[var(--content-primary)]">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.design"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label id="inquiry-topic-label" className="block text-xs font-bold text-[var(--content-primary)]">
                    Inquiry Topic <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
                    Routing to Support Queue
                  </span>
                </div>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-labelledby="inquiry-topic-label"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer select-none",
                    "bg-[var(--bg-screen)] hover:border-[var(--content-primary)]/40 hover:bg-[var(--bg-neutral)]/40",
                    isDropdownOpen
                      ? "border-[var(--brand-secondary)] ring-2 ring-[var(--brand-secondary)]/20 shadow-xs bg-[var(--bg-neutral)]/60"
                      : "border-[var(--border-neutral)] shadow-2xs"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] flex items-center justify-center shrink-0 border border-[var(--brand-secondary)]/20">
                      <SelectedIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--content-primary)] truncate">
                          {selectedCategoryObj.label}
                        </span>
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-neutral)] text-[var(--content-secondary)] border border-[var(--border-neutral)] font-mono">
                          {selectedCategoryObj.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--content-tertiary)] truncate">
                        {selectedCategoryObj.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[var(--content-tertiary)] pl-2 border-l border-[var(--border-neutral)]/60">
                    <span className="text-[11px] font-medium hidden sm:inline text-[var(--content-secondary)]">
                      Change
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isDropdownOpen && "rotate-180 text-[var(--brand-secondary)]"
                      )}
                    />
                  </div>
                </button>

                {/* Dropdown Popover Menu */}
                {isDropdownOpen && (
                  <div
                    role="listbox"
                    tabIndex={-1}
                    className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-[var(--border-neutral)] bg-[var(--bg-elevated)] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--content-tertiary)] border-b border-[var(--border-neutral)]/60 mb-1 flex items-center justify-between">
                      <span>Select Destination Topic</span>
                      <span>5 Categories</span>
                    </div>

                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.id;
                      const ItemIcon = cat.icon;

                      return (
                        <div
                          key={cat.id}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setCategory(cat.id);
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "group flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer select-none",
                            isSelected
                              ? "bg-[var(--brand-secondary-subtle)] text-[var(--content-primary)] ring-1 ring-[var(--brand-secondary)]/30 font-semibold"
                              : "hover:bg-[var(--bg-neutral)] text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                  ? "bg-[var(--brand-secondary)] text-white shadow-xs"
                                  : "bg-[var(--bg-neutral)] text-[var(--content-secondary)] group-hover:text-[var(--content-primary)] border border-[var(--border-neutral)]"
                              )}
                            >
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    isSelected
                                      ? "text-[var(--brand-secondary)]"
                                      : "text-[var(--content-primary)]"
                                  )}
                                >
                                  {cat.label}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[var(--bg-neutral)] text-[var(--content-tertiary)] font-mono border border-[var(--border-neutral)]">
                                  {cat.tag}
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--content-tertiary)] truncate group-hover:text-[var(--content-secondary)]">
                                {cat.desc}
                              </p>
                            </div>
                          </div>

                          {isSelected ? (
                            <div className="h-5 w-5 rounded-full bg-[var(--brand-secondary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-[var(--border-neutral)] group-hover:bg-[var(--content-tertiary)] shrink-0 transition-colors mr-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="block text-xs font-bold text-[var(--content-primary)]">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of what you would like to discuss"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent transition-all"
                />
              </div>

              {/* Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="contact-message" className="block text-xs font-bold text-[var(--content-primary)]">
                    Detailed Message <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-[var(--content-tertiary)]">
                    {message.length} / 2000
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question, request, or idea in detail. Include links or project titles if applicable..."
                  className="w-full px-3.5 py-3 rounded-xl border border-[var(--border-neutral)] bg-[var(--bg-screen)] text-sm text-[var(--content-primary)] placeholder:text-[var(--content-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] focus:border-transparent transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={buttonVariants({
                    variant: "brand",
                    size: "lg",
                    className: "w-full justify-center gap-2 font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60",
                  })}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[var(--content-tertiary)] text-center">
                By submitting this form, you agree to our{" "}
                <Link href="/privacy" className="underline hover:text-[var(--content-primary)]">
                  Privacy Policy
                </Link>{" "}
                and acknowledge that our team may contact you via email regarding this inquiry.
              </p>
            </form>
          )}
        </div>

        {/* Right Column: Context & Help Information */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Channels Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs space-y-5">
            <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)] flex items-center gap-2")}>
              <Mail className="h-4 w-4 text-[var(--brand-secondary)]" />
              <span>Direct Channels</span>
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] space-y-1">
                <div className="text-[11px] font-mono text-[var(--content-tertiary)] uppercase tracking-wider font-semibold">
                  General Support & Inquiries
                </div>
                <a
                  href="mailto:support@layerat.com"
                  className="font-bold text-[var(--content-primary)] hover:text-[var(--brand-secondary)] transition-colors inline-flex items-center gap-1.5 text-sm"
                >
                  support@layerat.com
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-neutral)] border border-[var(--border-neutral)] space-y-1">
                <div className="text-[11px] font-mono text-[var(--content-tertiary)] uppercase tracking-wider font-semibold">
                  Curators & Editorial Board
                </div>
                <a
                  href="mailto:curators@layerat.com"
                  className="font-bold text-[var(--content-primary)] hover:text-[var(--brand-secondary)] transition-colors inline-flex items-center gap-1.5 text-sm"
                >
                  curators@layerat.com
                </a>
              </div>
            </div>

            {/* SLA Response Time */}
            <div className="pt-2 border-t border-[var(--border-neutral)] flex items-center gap-3 text-xs text-[var(--content-secondary)]">
              <div className="h-8 w-8 rounded-full bg-[var(--brand-secondary-subtle)] text-[var(--brand-secondary)] flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <strong className="block text-[var(--content-primary)]">Response Time SLA</strong>
                <span>We answer inquiries Monday through Friday within 24 to 48 hours.</span>
              </div>
            </div>
          </div>

          {/* Quick Resources Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-xs space-y-4">
            <h3 className={cn(bricolage.className, "text-lg font-bold text-[var(--content-primary)] flex items-center gap-2")}>
              <HelpCircle className="h-4 w-4 text-[var(--brand-secondary)]" />
              <span>Looking for Quick Answers?</span>
            </h3>

            <p className="text-xs text-[var(--content-secondary)] leading-relaxed">
              Check out these frequently consulted sections of our documentation:
            </p>

            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link
                  href="/guidelines"
                  className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral-hover)] border border-[var(--border-neutral)] text-[var(--content-primary)] transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:text-[var(--brand-secondary)]" />
                    <span>Community Guidelines & Standards</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral-hover)] border border-[var(--border-neutral)] text-[var(--content-primary)] transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:text-[var(--brand-secondary)]" />
                    <span>About Layerat & Our Curation Manifesto</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral-hover)] border border-[var(--border-neutral)] text-[var(--content-primary)] transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:text-[var(--brand-secondary)]" />
                    <span>Terms of Service & Copyright Policies</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--content-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
