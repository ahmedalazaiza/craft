"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  Creator,
  Project,
  Comment,
  Notification,
  PlatformSettings,
  Board,
} from "./types";
import {
  fetchProjects,
  fetchCreators,
  insertProject,
  updateProjectInDb,
  deleteProjectFromDb,
  insertComment,
  toggleAppreciationInDb,
  updateProfileInDb,
  fetchUserFollows,
  fetchUserAppreciations,
  toggleFollowInDb,
  deleteUserAccountInDb,
  fetchUserNotifications,
  insertNotificationInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
  fetchCategories,
  fetchPlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
  fetchUserBoards,
  createBoardInDb,
  updateBoardInDb,
  deleteBoardFromDb,
  addProjectToBoardInDb,
  removeProjectFromBoardInDb,
  fetchProjectBoards,
  mapCommentRow,
} from "./supabase/queries";
import { CategoryTaxonomyItem, FALLBACK_TAXONOMY } from "@/lib/taxonomy";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  getCurrentAuthUser,
  AuthResponse,
} from "./supabase/auth";
import { supabase } from "./supabase/client";
import { VerificationModal, GatedActionType } from "@/components/ui/verification-modal";
import { MobileBlockSheet } from "@/components/ui/mobile-block-sheet";
import { AddToBoardModal } from "@/components/board/add-to-board-modal";
import { toast } from "@/components/ui/toast";

interface SessionContextType {
  user: Creator | null;
  projects: Project[];
  creators: Creator[];
  taxonomy: CategoryTaxonomyItem[];
  platformSettings: PlatformSettings;
  isAdmin: boolean;
  isModerator: boolean;
  isLoadingDb: boolean;
  isAuthReady: boolean;
  appreciatedProjectIds: Set<string>;
  followingCreatorIds: Set<string>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  isVerificationModalOpen: boolean;
  verificationModalAction: GatedActionType;
  verificationModalTargetName?: string;
  openVerificationModal: (action: GatedActionType, targetName?: string) => void;
  closeVerificationModal: () => void;
  isMobilePublishBlockOpen: boolean;
  openMobilePublishBlock: () => void;
  closeMobilePublishBlock: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (redirectPath?: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, displayName: string, customUsername?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshFromDb: () => Promise<void>;
  setUser: (user: Creator | null | ((prev: Creator | null) => Creator | null)) => void;
  syncProjectMetrics: (projectId: string) => Promise<void>;
  toggleAppreciation: (projectId: string) => boolean;
  isProjectAppreciated: (projectId: string) => boolean;
  toggleFollowCreator: (creatorId: string) => boolean;
  isFollowingCreator: (creatorId: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addComment: (projectId: string, content: string) => Promise<void>;
  saveProject: (projectData: Partial<Project> & { title: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  adminUpdateProjectCategory: (projectId: string, newCategory: string, newCategories?: string[]) => Promise<boolean>;
  updateProfile: (updatedData: Partial<Creator>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  boards: Board[];
  isBoardsLoading: boolean;
  refreshBoards: () => Promise<void>;
  createBoard: (title: string, description?: string, isPrivate?: boolean) => Promise<Board | null>;
  updateBoard: (boardId: string, updates: { title?: string; description?: string; isPrivate?: boolean }) => Promise<boolean>;
  deleteBoard: (boardId: string) => Promise<boolean>;
  toggleProjectInBoard: (boardId: string, projectId: string) => Promise<boolean>;
  openAddToBoardModal: (project: Project) => void;
  closeAddToBoardModal: () => void;
  isAddToBoardModalOpen: boolean;
  activeBoardProject: Project | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Initialize to null to match SSR initial DOM, then immediately hydrate from local cache on mount
  const [user, setUserState] = useState<Creator | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("craft_cached_profile");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id) {
            setUserState(parsed);
          }
        }
      } catch {
        // Ignore
      }
      setIsAuthReady(true);
    }
  }, []);

  // Synchronize user state updates to localStorage
  const setUser = useCallback(
    (action: Creator | null | ((prev: Creator | null) => Creator | null)) => {
      setUserState((prev) => {
        const nextUser = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          try {
            if (nextUser) {
              localStorage.setItem("craft_cached_profile", JSON.stringify(nextUser));
            } else {
              localStorage.removeItem("craft_cached_profile");
            }
          } catch {
            // Ignore quota/security errors
          }
        }
        return nextUser;
      });
    },
    []
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [taxonomy, setTaxonomy] = useState<CategoryTaxonomyItem[]>(FALLBACK_TAXONOMY);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [appreciatedProjectIds, setAppreciatedProjectIds] = useState<Set<string>>(new Set());
  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Verification Gate Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationModalAction, setVerificationModalAction] = useState<GatedActionType>("like");
  const [verificationModalTargetName, setVerificationModalTargetName] = useState<string | undefined>(undefined);
  const inFlightAppreciations = useRef<Set<string>>(new Set());

  const openVerificationModal = (action: GatedActionType, targetName?: string) => {
    setVerificationModalAction(action);
    setVerificationModalTargetName(targetName);
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModal = () => {
    setIsVerificationModalOpen(false);
  };

  // Mobile Publishing Blocker Bottom Sheet State
  const [isMobilePublishBlockOpen, setIsMobilePublishBlockOpen] = useState(false);
  const openMobilePublishBlock = useCallback(() => {
    setIsMobilePublishBlockOpen(true);
  }, []);
  const closeMobilePublishBlock = useCallback(() => {
    setIsMobilePublishBlockOpen(false);
  }, []);

  // Boards & Moodboards State
  const [boards, setBoards] = useState<Board[]>([]);
  const [isBoardsLoading, setIsBoardsLoading] = useState(false);
  const [isAddToBoardModalOpen, setIsAddToBoardModalOpen] = useState(false);
  const [activeBoardProject, setActiveBoardProject] = useState<Project | null>(null);

  const openAddToBoardModal = useCallback(
    (project: Project) => {
      // If guest or not verified, trigger verification modal (identical to liking a project)
      if (!user || !user.isVerified) {
        openVerificationModal("board", project.title);
        return;
      }
      setActiveBoardProject(project);
      setIsAddToBoardModalOpen(true);
    },
    [user]
  );

  const closeAddToBoardModal = useCallback(() => {
    setIsAddToBoardModalOpen(false);
    setActiveBoardProject(null);
  }, []);

  // Fetch live metrics (appreciations_count, views_count, comments) directly from DB for a given project
  const syncProjectMetrics = useCallback(async (projectId: string) => {
    try {
      const { data } = await supabase
        .from("projects")
        .select("id, appreciations_count, views_count, comments(*, author:profiles!author_id(*))")
        .eq("id", projectId)
        .maybeSingle();

      if (data) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  appreciations:
                    typeof data.appreciations_count === "number"
                      ? data.appreciations_count
                      : p.appreciations,
                  views:
                    typeof data.views_count === "number"
                      ? data.views_count
                      : p.views,
                  comments: Array.isArray(data.comments)
                    ? data.comments.map(mapCommentRow)
                    : p.comments,
                }
              : p
          )
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Check auth and fetch live database on mount.
  // PHASE 1: Fetch public content data (projects, creators, categories, settings) in parallel.
  //          Release isLoadingDb immediately so the UI renders without waiting for auth.
  // PHASE 2: Silently resolve auth + user-specific data in the background.
  const refreshFromDb = useCallback(async () => {
    try {
      // ── Phase 1: Public content (no auth dependency) ─────────────────────
      // Fetch and release loading state ASAP so the page renders on mobile.
      const [dbProjects, dbCreators, dbCategories, dbSettings] = await Promise.all([
        fetchProjects({ publishedOnly: false }),
        fetchCreators(),
        fetchCategories(),
        fetchPlatformSettings(),
      ]);

      if (dbProjects && dbProjects.length > 0) {
        setProjects(dbProjects);
      }
      if (dbCreators && dbCreators.length > 0) {
        setCreators(dbCreators);
      }
      if (dbCategories && dbCategories.length > 0) {
        setTaxonomy(dbCategories);
      }
      if (dbSettings) {
        setPlatformSettings(dbSettings);
      }

      // ← UI is unblocked here. Content renders immediately on mobile.
      setIsLoadingDb(false);

      // ── Phase 2: Auth + user-specific data (background, non-blocking) ────
      const activeAuthUser = await getCurrentAuthUser();

      if (activeAuthUser) {
        setUser(activeAuthUser);
        const [userFollows, userNotifs, userAppreciations, userBoards] = await Promise.all([
          fetchUserFollows(activeAuthUser.id),
          fetchUserNotifications(activeAuthUser.id),
          fetchUserAppreciations(activeAuthUser.id),
          fetchUserBoards(activeAuthUser.id),
        ]);
        setFollowingCreatorIds(new Set(userFollows));
        setNotifications(userNotifs);
        setAppreciatedProjectIds(new Set(userAppreciations));
        setBoards(userBoards);
      } else {
        // User is not authenticated or account was deleted in database
        setUser(null);
        setNotifications([]);
        setFollowingCreatorIds(new Set());
        setAppreciatedProjectIds(new Set());
        setBoards([]);

        if (typeof window !== "undefined") {
          localStorage.removeItem("craft_cached_profile");
          const terminationReason = sessionStorage.getItem("layerat_session_terminated");
          if (terminationReason === "account_deleted") {
            sessionStorage.removeItem("layerat_session_terminated");
            toast.warning("Your session has ended. This account is no longer active.", "Session Ended");
          }
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name !== "AbortError") {
        console.error("Failed to load initial data from Supabase:", errorObj?.message || err);
      }
      // Ensure loading state is always released even on error
      setIsLoadingDb(false);
    }
  }, [setUser]);

  // Realtime notifications, interactions, and account status subscription for active session user
  useEffect(() => {
    if (!user) return;

    // 1. Instant Realtime Notifications for current user (recipient)
    const notifChannel = supabase
      .channel(`notifications-recipient-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as {
              id: string;
              type?: string;
              content?: string;
              project_id?: string;
            };

            // Instant alert sound / toast popup
            if (newNotif && newNotif.content) {
              toast.info(newNotif.content, "New Notification");
            }

            const freshNotifs = await fetchUserNotifications(user.id);
            setNotifications(freshNotifs);

            if (newNotif && newNotif.project_id) {
              syncProjectMetrics(newNotif.project_id);
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as { id: string; read?: boolean };
            if (updated && updated.id) {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === updated.id
                    ? { ...n, read: typeof updated.read === "boolean" ? updated.read : n.read }
                    : n
                )
              );
            }
          } else if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as { id?: string };
            if (oldRecord && oldRecord.id) {
              setNotifications((prev) => prev.filter((n) => n.id !== oldRecord.id));
            } else {
              const freshNotifs = await fetchUserNotifications(user.id);
              setNotifications(freshNotifs);
            }
          }
        }
      )
      .subscribe();

    // 2. Realtime Appreciations for current user (syncs hearts across devices/tabs)
    const userAppreciationsChannel = supabase
      .channel(`user-appreciations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appreciations",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as { project_id: string };
            if (row?.project_id) {
              setAppreciatedProjectIds((prev) => new Set([...prev, row.project_id]));
            }
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as { project_id: string };
            if (row?.project_id) {
              setAppreciatedProjectIds((prev) => {
                const next = new Set(prev);
                next.delete(row.project_id);
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    // 3. Realtime Follows made by current user (syncs following across devices/tabs)
    const userFollowsChannel = supabase
      .channel(`user-follows-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `follower_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as { following_id: string };
            if (row?.following_id) {
              setFollowingCreatorIds((prev) => new Set([...prev, row.following_id]));
            }
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as { following_id: string };
            if (row?.following_id) {
              setFollowingCreatorIds((prev) => {
                const next = new Set(prev);
                next.delete(row.following_id);
                return next;
              });
            }
          }
        }
      )
      .subscribe();

    // 4. Realtime Followers received by current user (instant followers_count update)
    const creatorFollowersChannel = supabase
      .channel(`creator-followers-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${user.id}`,
        },
        (payload) => {
          setUser((prev) => {
            if (!prev) return prev;
            const currentCount = prev.followersCount || 0;
            return {
              ...prev,
              followersCount:
                payload.eventType === "INSERT"
                  ? currentCount + 1
                  : Math.max(0, currentCount - 1),
            };
          });
        }
      )
      .subscribe();

    // 5. Listen to real-time deletion of this user's profile
    const profileDeleteChannel = supabase
      .channel(`profile-delete-listener-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        async () => {
          console.warn("User account was deleted. Terminating active session immediately.");
          await supabase.auth.signOut().catch(() => {});
          if (typeof window !== "undefined") {
            localStorage.removeItem("craft_cached_profile");
          }
          setUser(null);
          setNotifications([]);
          setFollowingCreatorIds(new Set());
          setAppreciatedProjectIds(new Set());
          toast.warning("Your session has ended. This account is no longer active.", "Session Ended");
        }
      )
      .subscribe();

    // 6. Listen to real-time verification of this user's profile (from mobile, another tab, or email link)
    const profileUpdateChannel = supabase
      .channel(`profile-update-listener-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        async (payload) => {
          const newRecord = payload.new as {
            is_verified?: boolean;
            display_name?: string;
            avatar_url?: string;
            username?: string;
            followers_count?: number;
          };
          if (newRecord) {
            setUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                isVerified: typeof newRecord.is_verified === "boolean" ? newRecord.is_verified : prev.isVerified,
                displayName: newRecord.display_name || prev.displayName,
                avatarUrl: newRecord.avatar_url || prev.avatarUrl,
                username: newRecord.username || prev.username,
                followersCount: typeof newRecord.followers_count === "number" ? newRecord.followers_count : prev.followersCount,
              };
            });
            if (newRecord.is_verified) {
              toast.success(
                "Your account is now verified! All creator privileges have been unlocked.",
                "Account Verified 🎉"
              );
              refreshFromDb();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(userAppreciationsChannel);
      supabase.removeChannel(userFollowsChannel);
      supabase.removeChannel(creatorFollowersChannel);
      supabase.removeChannel(profileDeleteChannel);
      supabase.removeChannel(profileUpdateChannel);
    };
  }, [user?.id, setUser, refreshFromDb, syncProjectMetrics]);

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Intercept signup verification hashes landing on root or other pages and route to /auth/verify
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      if (hash.includes("type=signup") && pathname !== "/auth/verify") {
        window.location.href = `/auth/verify${hash}`;
        return;
      }
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      refreshFromDb();
    }

    // Listen to Supabase Auth state changes (skip INITIAL_SESSION to prevent duplicate fetch)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") {
        return;
      }
      if (session?.user) {
        const profile = await getCurrentAuthUser();
        if (profile) {
          setUser(profile);
          const [userFollows, userNotifs, userAppreciations, userBoards] = await Promise.all([
            fetchUserFollows(profile.id),
            fetchUserNotifications(profile.id),
            fetchUserAppreciations(profile.id),
            fetchUserBoards(profile.id),
          ]);
          setFollowingCreatorIds(new Set(userFollows));
          setNotifications(userNotifs);
          setAppreciatedProjectIds(new Set(userAppreciations));
          setBoards(userBoards);
        } else {
          setUser(null);
          setNotifications([]);
          setFollowingCreatorIds(new Set());
          setAppreciatedProjectIds(new Set());
          setBoards([]);
          if (typeof window !== "undefined") {
            localStorage.removeItem("craft_cached_profile");
            const terminationReason = sessionStorage.getItem("layerat_session_terminated");
            if (terminationReason === "account_deleted") {
              sessionStorage.removeItem("layerat_session_terminated");
              toast.warning("Your session has ended. This account is no longer active.", "Session Ended");
            }
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setNotifications([]);
        setAppreciatedProjectIds(new Set());
        setFollowingCreatorIds(new Set());
        if (typeof window !== "undefined") {
          localStorage.removeItem("craft_cached_profile");
          const terminationReason = sessionStorage.getItem("layerat_session_terminated");
          if (terminationReason === "account_deleted") {
            sessionStorage.removeItem("layerat_session_terminated");
            toast.warning("Your session has ended. This account is no longer active.", "Session Ended");
          }
        }
      }
    });

    // Realtime categories taxonomy changes subscription
    const categoriesChannel = supabase
      .channel("public-categories-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        async () => {
          const freshCategories = await fetchCategories();
          if (freshCategories && freshCategories.length > 0) {
            setTaxonomy(freshCategories);
          }
        }
      )
      .subscribe();

    // Realtime platform settings changes subscription
    const settingsChannel = supabase
      .channel("public-platform-settings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "platform_settings",
        },
        async () => {
          const freshSettings = await fetchPlatformSettings();
          if (freshSettings) {
            setPlatformSettings(freshSettings);
          }
        }
      )
      .subscribe();

    // Realtime projects changes subscription (appreciations_count, views, status)
    const projectsRealtimeChannel = supabase
      .channel("public-projects-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as {
              id: string;
              appreciations_count?: number;
              views_count?: number;
              published?: boolean;
            };
            if (updated && updated.id) {
              setProjects((prev) =>
                prev.map((p) => {
                  if (p.id === updated.id) {
                    return {
                      ...p,
                      appreciations:
                        typeof updated.appreciations_count === "number"
                          ? updated.appreciations_count
                          : p.appreciations,
                      views:
                        typeof updated.views_count === "number"
                          ? updated.views_count
                          : p.views,
                      published:
                        typeof updated.published === "boolean"
                          ? updated.published
                          : p.published,
                    };
                  }
                  return p;
                })
              );
            }
          } else if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as { id?: string };
            if (oldRecord && oldRecord.id) {
              setProjects((prev) => prev.filter((p) => p.id !== oldRecord.id));
            }
          }
        }
      )
      .subscribe();

    // Realtime public comments subscription (keeps project comment counters fresh everywhere)
    const commentsRealtimeChannel = supabase
      .channel("public-comments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        (payload) => {
          const targetId = (payload.new as { project_id?: string })?.project_id || (payload.old as { project_id?: string })?.project_id;
          if (targetId) {
            syncProjectMetrics(targetId);
          }
        }
      )
      .subscribe();

    return () => {
      authListener?.subscription.unsubscribe();
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(projectsRealtimeChannel);
      supabase.removeChannel(commentsRealtimeChannel);
    };
  }, [refreshFromDb, setUser, syncProjectMetrics]);

  // Auth Operations
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await signInWithEmail(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshFromDb();
    }
    return res;
  };

  const loginWithGoogle = async (redirectPath: string = "/"): Promise<{ error?: string }> => {
    return await signInWithGoogle(redirectPath);
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    customUsername?: string
  ): Promise<AuthResponse> => {
    const res = await signUpWithEmail(email, password, displayName, customUsername);
    if (res.success && res.user) {
      setUser(res.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("craft_last_registered_email", email.trim().toLowerCase());
      }
    }
    return res;
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("craft_last_registered_email");
      sessionStorage.removeItem("craft_hide_verification_banner");
    }
    await authSignOut();
    setUser(null);
    setNotifications([]);
    setAppreciatedProjectIds(new Set());
    setFollowingCreatorIds(new Set());
  };


  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const isProjectAppreciated = (projectId: string) => {
    return appreciatedProjectIds.has(projectId);
  };

  const isFollowingCreator = (creatorId: string) => {
    return followingCreatorIds.has(creatorId);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    markNotificationReadInDb(id).catch(console.error);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      markAllNotificationsReadInDb(user.id).catch(console.error);
    }
  };

  // GATED ACTION: Follow Creator (Strictly Verified Only)
  const toggleFollowCreator = (creatorId: string): boolean => {
    const targetCreator = creators.find((u) => u.id === creatorId);

    // If guest or not verified, trigger verification modal
    if (!user || !user.isVerified) {
      openVerificationModal("follow", targetCreator?.displayName);
      return false;
    }

    const wasFollowing = followingCreatorIds.has(creatorId);

    // Optimistically update following list
    setFollowingCreatorIds((prev) => {
      const next = new Set(prev);
      if (wasFollowing) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
      }
      return next;
    });

    // Optimistically update real followersCount in creators list
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id === creatorId) {
          const currentCount = c.followersCount || 0;
          return {
            ...c,
            followersCount: wasFollowing
              ? Math.max(0, currentCount - 1)
              : currentCount + 1,
          };
        }
        return c;
      })
    );

    // If user is viewing themselves
    if (user.id === creatorId) {
      setUser((prev) => {
        if (!prev) return prev;
        const currentCount = prev.followersCount || 0;
        return {
          ...prev,
          followersCount: wasFollowing
            ? Math.max(0, currentCount - 1)
            : currentCount + 1,
        };
      });
    }

    // Persist follow in Supabase
    toggleFollowInDb(user.id, creatorId).catch(console.error);

    return true;
  };

  // Action: Appreciate Project (Instant Optimistic Feedback & DB Persistence - Verified Users Only)
  const toggleAppreciation = (projectId: string): boolean => {
    const targetProject = projects.find((p) => p.id === projectId);

    // Cannot appreciate draft projects
    if (targetProject && targetProject.published === false) {
      return false;
    }

    // If guest or not verified, trigger verification modal
    if (!user || !user.isVerified) {
      openVerificationModal("like", targetProject?.title);
      return false;
    }

    if (inFlightAppreciations.current.has(projectId)) {
      return false;
    }
    inFlightAppreciations.current.add(projectId);

    const wasAppreciated = appreciatedProjectIds.has(projectId);
    const nextState = !wasAppreciated;

    setAppreciatedProjectIds((prev) => {
      const next = new Set(prev);
      if (wasAppreciated) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            appreciations: wasAppreciated
              ? Math.max(0, (p.appreciations || 0) - 1)
              : (p.appreciations || 0) + 1,
          };
        }
        return p;
      })
    );

    if (user?.id) {
      toggleAppreciationInDb(projectId, user.id, nextState)
        .then(() => syncProjectMetrics(projectId))
        .catch(console.error)
        .finally(() => {
          setTimeout(() => {
            inFlightAppreciations.current.delete(projectId);
          }, 300);
        });
    } else {
      inFlightAppreciations.current.delete(projectId);
    }

    return true;
  };

  // GATED ACTION: Add Comment (Strictly Verified Only & Not Suspended)
  const addComment = async (projectId: string, content: string) => {
    if (!user) return;

    if (user.isSuspended) {
      toast.error("Your account has been suspended by moderation. Commenting is restricted.", "Account Suspended");
      return;
    }

    if (!user.isVerified) {
      openVerificationModal("comment");
      return;
    }

    const optimisticComment: Comment = {
      id: `c-${Date.now()}`,
      author: user,
      content,
      createdAt: "Just now",
    };

    const targetProject = projects.find((p) => p.id === projectId);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            comments: [optimisticComment, ...p.comments],
          };
        }
        return p;
      })
    );

    // Persist to Supabase
    try {
      await insertComment(projectId, user.id, content);
      syncProjectMetrics(projectId);
    } catch (err) {
      console.error("Failed to save comment to database:", err);
    }
  };

  // GATED ACTION: Save Project (Requires verified creator account & Not Suspended)
  const saveProject = async (projectData: Partial<Project> & { title: string }): Promise<Project> => {
    if (!user) {
      throw new Error("You must be signed in to publish projects.");
    }

    if (user.isSuspended) {
      toast.error("Your account has been suspended by moderation. Publishing is restricted.", "Account Suspended");
      throw new Error("Your account has been suspended by moderation.");
    }

    if (!user.isVerified) {
      openVerificationModal("publish", projectData.title);
      throw new Error("Email verification is required before publishing projects.");
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isRealDbId = Boolean(projectData.id && UUID_REGEX.test(projectData.id));

    if (projectData.id && isRealDbId) {
      // Update existing project
      let updated: Project | undefined;
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectData.id) {
            updated = { ...p, ...projectData } as Project;
            return updated;
          }
          return p;
        })
      );

      // Persist update in Supabase
      try {
        await updateProjectInDb(projectData.id, projectData);
      } catch (err) {
        console.error("Failed to update project in Supabase:", err);
      }

      return updated || (projectData as Project);
    } else {
      // Create new project
      const slug =
        projectData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `project-${Date.now()}`;

      const newProj: Project = {
        id: `proj-${Date.now()}`,
        slug,
        title: projectData.title,
        summary: projectData.summary || "",
        body: projectData.body || "",
        coverImage:
          projectData.coverImage ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
        galleryImages: projectData.galleryImages || [projectData.coverImage || ""],
        creator: user,
        tags: projectData.tags && projectData.tags.length > 0 ? projectData.tags : ["Design"],
        tools: projectData.tools && projectData.tools.length > 0 ? projectData.tools : ["Figma"],
        category: projectData.category || projectData.categories?.[0] || "User Interface Design (UI)",
        categories: projectData.categories && projectData.categories.length > 0 ? projectData.categories : [projectData.category || "User Interface Design (UI)"],
        subCategory: projectData.subCategory || projectData.subCategories?.[0] || undefined,
        subCategories: projectData.subCategories && projectData.subCategories.length > 0 ? projectData.subCategories : (projectData.subCategory ? [projectData.subCategory] : []),
        medium: projectData.medium || "Image",
        published: projectData.published ?? true,
        publishedAt: new Date().toISOString(),
        appreciations: 0,
        views: 0,
        comments: [],
      };

      setProjects((prev) => [newProj, ...prev]);

      // Persist to Supabase
      try {
        const dbResult = await insertProject({
          ...newProj,
          creator: user,
          creatorId: user.id,
        });
        if (dbResult) {
          setProjects((prev) => prev.map((p) => (p.slug === newProj.slug || p.id === newProj.id ? dbResult : p)));
          return dbResult;
        }
      } catch (err) {
        console.warn("Failed to insert project into Supabase:", err);
      }

      return newProj;
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    return await deleteProjectFromDb(id);
  };

  const adminUpdateProjectCategory = async (
    projectId: string,
    newCategory: string,
    newCategories?: string[]
  ): Promise<boolean> => {
    if (!isAdmin) {
      toast.error("Unauthorized: Only platform administrators can reassign project categories.", "Admin Access Required");
      return false;
    }

    const cats = newCategories && newCategories.length > 0 ? newCategories : [newCategory];

    // Optimistic UI update across all active project feeds in memory
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            category: newCategory,
            categories: cats,
          };
        }
        return p;
      })
    );

    try {
      await updateProjectInDb(projectId, {
        category: newCategory,
        categories: cats,
      });
      toast.success(`Project category updated to "${newCategory}" successfully!`, "Category Updated");
      return true;
    } catch (err) {
      console.error("Failed to update project category in Supabase:", err);
      toast.error("Failed to update project category in database.", "Update Error");
      return false;
    }
  };

  const updateProfile = async (updatedData: Partial<Creator>): Promise<boolean> => {
    if (!user) return false;
    const cleanUsername = updatedData.username
      ? updatedData.username.toLowerCase().trim().replace(/^@+/, "")
      : user.username;

    const updated: Creator = {
      ...user,
      ...updatedData,
      ...(updatedData.username ? { username: cleanUsername } : {}),
    };

    setUser(updated);
    setCreators((prev) => prev.map((c) => (c.id === user.id ? updated : c)));

    // Immediately reflect new username/profile across all projects in memory
    setProjects((prev) =>
      prev.map((p) =>
        p.creator.id === user.id || p.creator.username.toLowerCase() === user.username.toLowerCase()
          ? {
              ...p,
              creator: {
                ...p.creator,
                ...updatedData,
                ...(updatedData.username ? { username: cleanUsername } : {}),
              },
            }
          : p
      )
    );

    // Persist to Supabase
    const success = await updateProfileInDb(user.id, {
      ...updatedData,
      ...(updatedData.username ? { username: cleanUsername } : {}),
    });

    return success;
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    const userId = user.id;
    const username = user.username;

    // Optimistically purge local user state
    setUser(null);
    setProjects((prev) => prev.filter((p) => p.creator.id !== userId && p.creator.username.toLowerCase() !== username.toLowerCase()));
    setCreators((prev) => prev.filter((c) => c.id !== userId && c.username.toLowerCase() !== username.toLowerCase()));
    setAppreciatedProjectIds(new Set());
    setFollowingCreatorIds(new Set());
    setNotifications([]);

    const res = await deleteUserAccountInDb(userId);
    return res.success;
  };

  const refreshBoards = useCallback(async () => {
    if (!user) {
      setBoards([]);
      return;
    }
    setIsBoardsLoading(true);
    try {
      const b = await fetchUserBoards(user.id);
      setBoards(b);
    } catch (err) {
      console.warn("Failed to refresh boards:", err);
    } finally {
      setIsBoardsLoading(false);
    }
  }, [user]);

  const createBoard = useCallback(
    async (title: string, description?: string, isPrivate = false): Promise<Board | null> => {
      if (!user || !user.isVerified) {
        openVerificationModal("board", title);
        return null;
      }
      const optimisticId = `board-${Date.now()}`;
      const optimisticBoard: Board = {
        id: optimisticId,
        userId: user.id,
        title,
        description: description || "",
        isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemsCount: 0,
        coverImages: [],
        creator: user,
      };

      setBoards((prev) => [optimisticBoard, ...prev]);

      const created = await createBoardInDb({
        userId: user.id,
        title,
        description,
        isPrivate,
      });

      if (created) {
        setBoards((prev) =>
          prev.map((b) => (b.id === optimisticId ? { ...created, creator: user } : b))
        );
        return created;
      } else {
        setBoards((prev) => prev.filter((b) => b.id !== optimisticId));
        return null;
      }
    },
    [user]
  );

  const updateBoard = useCallback(
    async (
      boardId: string,
      updates: { title?: string; description?: string; isPrivate?: boolean }
    ): Promise<boolean> => {
      setBoards((prev) =>
        prev.map((b) =>
          b.id === boardId
            ? {
                ...b,
                ...(updates.title !== undefined && { title: updates.title }),
                ...(updates.description !== undefined && { description: updates.description }),
                ...(updates.isPrivate !== undefined && { isPrivate: updates.isPrivate }),
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      );
      return updateBoardInDb(boardId, updates);
    },
    []
  );

  const deleteBoard = useCallback(async (boardId: string): Promise<boolean> => {
    setBoards((prev) => prev.filter((b) => b.id !== boardId));
    return deleteBoardFromDb(boardId);
  }, []);

  const toggleProjectInBoard = useCallback(
    async (boardId: string, projectId: string): Promise<boolean> => {
      const targetBoard = boards.find((b) => b.id === boardId);
      const targetProject = projects.find((p) => p.id === projectId);
      if (!targetBoard || !user) return false;

      const boardMemberIds = await fetchProjectBoards(user.id, projectId);
      const isInBoard = boardMemberIds.includes(boardId);

      if (isInBoard) {
        const success = await removeProjectFromBoardInDb(boardId, projectId);
        if (success) {
          setBoards((prev) =>
            prev.map((b) => {
              if (b.id === boardId) {
                const covers = b.coverImages || [];
                const projectCover = targetProject?.coverImage;
                return {
                  ...b,
                  itemsCount: Math.max(0, (b.itemsCount || 0) - 1),
                  coverImages: projectCover ? covers.filter((c) => c !== projectCover) : covers,
                  updatedAt: new Date().toISOString(),
                };
              }
              return b;
            })
          );
        }
        return success;
      } else {
        const success = await addProjectToBoardInDb(boardId, projectId);
        if (success) {
          setBoards((prev) =>
            prev.map((b) => {
              if (b.id === boardId) {
                const covers = b.coverImages || [];
                const projectCover = targetProject?.coverImage;
                const nextCovers =
                  projectCover && !covers.includes(projectCover) && covers.length < 4
                    ? [projectCover, ...covers]
                    : covers;
                return {
                  ...b,
                  itemsCount: (b.itemsCount || 0) + 1,
                  coverImages: nextCovers,
                  updatedAt: new Date().toISOString(),
                };
              }
              return b;
            })
          );
        }
        return success;
      }
    },
    [boards, projects, user]
  );

  const isAdmin = user?.role === "admin";
  const isModerator = user?.role === "admin" || user?.role === "moderator" || user?.role === "curator";

  return (
    <SessionContext.Provider
      value={{
        user,
        projects,
        creators,
        taxonomy,
        platformSettings,
        isAdmin,
        isModerator,
        isLoadingDb,
        isAuthReady,
        appreciatedProjectIds,
        followingCreatorIds,
        notifications,

        unreadNotificationsCount,
        isVerificationModalOpen,
        verificationModalAction,
        verificationModalTargetName,
        openVerificationModal,
        closeVerificationModal,
        isMobilePublishBlockOpen,
        openMobilePublishBlock,
        closeMobilePublishBlock,
        login,
        loginWithGoogle,
        signup,
        logout,
        refreshFromDb,
        setUser,
        syncProjectMetrics,
        toggleAppreciation,
        isProjectAppreciated,
        toggleFollowCreator,
        isFollowingCreator,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addComment,
        saveProject,
        deleteProject,
        adminUpdateProjectCategory,
        updateProfile,
        deleteAccount,
        boards,
        isBoardsLoading,
        refreshBoards,
        createBoard,
        updateBoard,
        deleteBoard,
        toggleProjectInBoard,
        openAddToBoardModal,
        closeAddToBoardModal,
        isAddToBoardModalOpen,
        activeBoardProject,
      }}
    >
      {children}

      {/* Global Gated Action Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={closeVerificationModal}
        action={verificationModalAction}
        targetName={verificationModalTargetName}
      />

      {/* Global Mobile Publishing Blocker Bottom Sheet */}
      <MobileBlockSheet
        isOpen={isMobilePublishBlockOpen}
        onClose={closeMobilePublishBlock}
      />

      {/* Global Add to Board Modal */}
      <AddToBoardModal
        isOpen={isAddToBoardModalOpen}
        onClose={closeAddToBoardModal}
        project={activeBoardProject}
      />
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
