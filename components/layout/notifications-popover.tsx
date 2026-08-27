"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/session-context";
import { NotificationType } from "@/lib/mock";
import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageSquare,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function NotificationsPopover() {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "appreciation":
        return <Heart className="h-3 w-3 text-[#090C09] fill-[#090C09]" />;
      case "comment":
        return <MessageSquare className="h-3 w-3 text-white fill-white" />;
      case "follow":
        return <UserPlus className="h-3 w-3 text-[#090C09]" />;
      case "publish":
        return <Sparkles className="h-3 w-3 text-[#090C09]" />;
    }
  };

  const getNotificationIconBg = (type: NotificationType) => {
    switch (type) {
      case "appreciation":
        return "bg-[#8DFF00]";
      case "comment":
        return "bg-[var(--chip-bg)]";
      case "follow":
        return "bg-[#8DFF00]";
      case "publish":
        return "bg-[#8DFF00]";
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button (Unified with Icon Button standard) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-9 w-9 rounded-full border border-[var(--border-neutral)] bg-[var(--bg-elevated)] flex items-center justify-center transition-all cursor-pointer select-none shadow-xs",
          isOpen
            ? "bg-[var(--bg-neutral)] text-[var(--content-primary)] border-[var(--content-primary)]"
            : "text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:bg-[var(--bg-neutral)]"
        )}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#8DFF00] px-1 text-[10px] font-black text-[#090C09] ring-2 ring-[var(--bg-screen)] shadow-xs">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-[360px] sm:w-[400px] rounded-[24px] bg-[var(--bg-elevated)] border border-[var(--border-neutral)] shadow-[0_20px_50px_rgba(9,12,9,0.14)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-neutral)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--content-primary)]">
                  Notifications
                </h3>
                {unreadNotificationsCount > 0 && (
                  <span className="rounded-full bg-[var(--chip-bg)] text-[var(--chip-fg)] px-2 py-0.5 text-[10px] font-bold">
                    {unreadNotificationsCount} new
                  </span>
                )}
              </div>

              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--content-secondary)] hover:text-[var(--content-primary)] hover:underline cursor-pointer transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 bg-[var(--bg-neutral)]/40 border-b border-[var(--border-neutral)] text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-semibold transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("appreciation")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-semibold transition-all cursor-pointer",
                  filter === "appreciation"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                Appreciations
              </button>
              <button
                type="button"
                onClick={() => setFilter("comment")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-semibold transition-all cursor-pointer",
                  filter === "comment"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                Comments
              </button>
              <button
                type="button"
                onClick={() => setFilter("follow")}
                className={cn(
                  "rounded-full px-2.5 py-1 font-semibold transition-all cursor-pointer",
                  filter === "follow"
                    ? "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
                    : "text-[var(--content-secondary)] hover:text-[var(--content-primary)]"
                )}
              >
                Follows
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border-neutral)]">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-[var(--content-tertiary)] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[var(--content-secondary)]">
                    No notifications to show
                  </p>
                  <p className="text-[11px] text-[var(--content-tertiary)] mt-0.5">
                    Activity on your projects and followers will appear here.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markNotificationAsRead(notif.id);
                    }}
                    className={cn(
                      "p-4 hover:bg-[var(--bg-neutral)]/40 transition-colors flex items-start gap-3.5 cursor-pointer relative group",
                      !notif.read && "bg-[var(--bg-neutral)]/20"
                    )}
                  >
                    {/* Actor Avatar with Type Badge */}
                    <div className="relative shrink-0">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-[var(--border-neutral)]">
                        <Image
                          src={notif.actor.avatarUrl}
                          alt={notif.actor.displayName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow-xs",
                          getNotificationIconBg(notif.type)
                        )}
                      >
                        {getNotificationIcon(notif.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs leading-snug">
                        <Link
                          href={`/u/${notif.actor.username}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                          }}
                          className="font-bold text-[var(--content-primary)] hover:underline"
                        >
                          {notif.actor.displayName}
                        </Link>{" "}
                        {notif.type === "appreciation" && (
                          <span className="text-[var(--content-secondary)]">
                            appreciated your project{" "}
                            {notif.project && (
                              <Link
                                href={`/project/${notif.project.slug}`}
                                onClick={(e) => {
                                   e.stopPropagation();
                                  setIsOpen(false);
                                }}
                                className="font-bold text-[var(--content-primary)] hover:underline underline-offset-2"
                              >
                                &ldquo;{notif.project.title}&rdquo;
                              </Link>
                            )}
                          </span>
                        )}
                        {notif.type === "comment" && (
                          <span className="text-[var(--content-secondary)]">
                            commented on{" "}
                            {notif.project && (
                              <Link
                                href={`/project/${notif.project.slug}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(false);
                                }}
                                className="font-bold text-[var(--content-primary)] hover:underline underline-offset-2"
                              >
                                &ldquo;{notif.project.title}&rdquo;
                              </Link>
                            )}
                          </span>
                        )}
                        {notif.type === "follow" && (
                          <span className="text-[var(--content-secondary)]">
                            started following you
                          </span>
                        )}
                        {notif.type === "publish" && (
                          <span className="text-[var(--content-secondary)]">
                            published a new project{" "}
                            {notif.project && (
                              <Link
                                href={`/project/${notif.project.slug}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsOpen(false);
                                }}
                                className="font-bold text-[var(--content-primary)] hover:underline underline-offset-2"
                              >
                                &ldquo;{notif.project.title}&rdquo;
                              </Link>
                            )}
                          </span>
                        )}
                      </p>

                      {/* Comment excerpt if present */}
                      {notif.content && notif.type === "comment" && (
                        <p className="mt-1 text-[11px] text-[var(--content-secondary)] line-clamp-2 italic bg-[var(--bg-neutral)]/60 rounded-md p-1.5">
                          &ldquo;{notif.content}&rdquo;
                        </p>
                      )}

                      <span className="text-[10px] text-[var(--content-tertiary)] block mt-1">
                        {notif.createdAt}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-[#8DFF00] shrink-0 self-center shadow-xs" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[var(--bg-neutral)]/30 border-t border-[var(--border-neutral)] text-center">
              <Link
                href="/me"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[var(--content-tertiary)] hover:text-[var(--content-primary)] transition-colors"
              >
                Profile Settings & Preferences →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
