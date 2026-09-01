"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Creator,
  Project,
  Comment,
  Notification,
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
  toggleFollowInDb,
  deleteUserAccountInDb,
  fetchUserNotifications,
  insertNotificationInDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
} from "./supabase/queries";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  getCurrentAuthUser,
  AuthResponse,
} from "./supabase/auth";
import { supabase } from "./supabase/client";
import { VerificationModal, GatedActionType } from "@/components/ui/verification-modal";

interface SessionContextType {
  user: Creator | null;
  projects: Project[];
  creators: Creator[];
  isLoadingDb: boolean;
  isAuthReady: boolean;
  appreciatedProjectIds: Set<string>;
  followingCreatorIds: Set<string>;
  onlineUserIds: Set<string>;
  isUserOnline: (userIdOrUsername?: string) => boolean;
  notifications: Notification[];
  unreadNotificationsCount: number;
  isVerificationModalOpen: boolean;
  verificationModalAction: GatedActionType;
  verificationModalTargetName?: string;
  openVerificationModal: (action: GatedActionType, targetName?: string) => void;
  closeVerificationModal: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, displayName: string, customUsername?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshFromDb: () => Promise<void>;
  setUser: (user: Creator | null | ((prev: Creator | null) => Creator | null)) => void;
  toggleAppreciation: (projectId: string) => boolean;
  isProjectAppreciated: (projectId: string) => boolean;
  toggleFollowCreator: (creatorId: string) => boolean;
  isFollowingCreator: (creatorId: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addComment: (projectId: string, content: string) => Promise<void>;
  saveProject: (projectData: Partial<Project> & { title: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<Creator>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
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
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [appreciatedProjectIds, setAppreciatedProjectIds] = useState<Set<string>>(new Set());
  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(new Set());
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [onlineUsernames, setOnlineUsernames] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Verification Gate Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationModalAction, setVerificationModalAction] = useState<GatedActionType>("like");
  const [verificationModalTargetName, setVerificationModalTargetName] = useState<string | undefined>(undefined);

  const openVerificationModal = (action: GatedActionType, targetName?: string) => {
    setVerificationModalAction(action);
    setVerificationModalTargetName(targetName);
    setIsVerificationModalOpen(true);
  };

  const closeVerificationModal = () => {
    setIsVerificationModalOpen(false);
  };

  // Helper to check if any user/creator is currently active online
  const isUserOnline = useCallback(
    (identifier?: string): boolean => {
      if (!identifier) return true;
      const idLower = identifier.toLowerCase();
      // Current active session user is always online
      if (user && (user.id === identifier || user.username.toLowerCase() === idLower)) {
        return true;
      }
      // Presence room active users
      if (onlineUserIds.has(identifier) || onlineUsernames.has(idLower)) {
        return true;
      }
      // Check database / creator state (defaults to true for active platform creators)
      const found = creators.find(
        (c) => c.id === identifier || c.username.toLowerCase() === idLower
      );
      return found?.isOnline !== false;
    },
    [user, onlineUserIds, onlineUsernames, creators]
  );

  // Live Supabase Presence Room for Realtime Online Status
  useEffect(() => {
    const presenceKey = user ? user.id : `guest_${Math.random().toString(36).substring(2, 9)}`;
    const presenceChannel = supabase.channel("craft_online_room", {
      config: {
        presence: {
          key: presenceKey,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const activeIds = new Set<string>();
        const activeUsernames = new Set<string>();

        Object.values(state).forEach((presences) => {
          (presences as Array<{ user_id?: string; username?: string }>).forEach((p) => {
            if (p.user_id) activeIds.add(p.user_id);
            if (p.username) activeUsernames.add(p.username.toLowerCase());
          });
        });

        if (user) {
          activeIds.add(user.id);
          activeUsernames.add(user.username.toLowerCase());
        }

        setOnlineUserIds(activeIds);
        setOnlineUsernames(activeUsernames);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await presenceChannel.track({
            user_id: user.id,
            username: user.username,
            online_at: new Date().toISOString(),
          });
          // Update DB profile is_online flag
          updateProfileInDb(user.id, { isOnline: true }).catch(() => {});
        }
      });

    // Subscribe to realtime notifications specifically for this logged-in recipient
    let notifChannel: ReturnType<typeof supabase.channel> | null = null;
    if (user) {
      notifChannel = supabase
        .channel(`notifications-recipient-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${user.id}`,
          },
          async () => {
            const freshNotifs = await fetchUserNotifications(user.id);
            setNotifications(freshNotifs);
          }
        )
        .subscribe();
    }

    const handleBeforeUnload = () => {
      if (user) {
        presenceChannel.untrack().catch(() => {});
        updateProfileInDb(user.id, { isOnline: false }).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (user) {
        presenceChannel.untrack().catch(() => {});
        updateProfileInDb(user.id, { isOnline: false }).catch(() => {});
      }
      supabase.removeChannel(presenceChannel);
      if (notifChannel) {
        supabase.removeChannel(notifChannel);
      }
    };
  }, [user]);

  // Check auth and fetch live database on mount
  const refreshFromDb = useCallback(async () => {
    try {
      const [dbProjects, dbCreators, activeAuthUser] = await Promise.all([
        fetchProjects({ publishedOnly: false }),
        fetchCreators(),
        getCurrentAuthUser(),
      ]);

      if (dbProjects && dbProjects.length > 0) {
        setProjects(dbProjects);
      }
      if (dbCreators && dbCreators.length > 0) {
        setCreators(dbCreators);
      }

      if (activeAuthUser) {
        setUser(activeAuthUser);
        const [userFollows, userNotifs] = await Promise.all([
          fetchUserFollows(activeAuthUser.id),
          fetchUserNotifications(activeAuthUser.id),
        ]);
        setFollowingCreatorIds(new Set(userFollows));
        setNotifications(userNotifs);
      } else {
        setUser(null);
        setNotifications([]);
        setFollowingCreatorIds(new Set());
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string };
      if (errorObj?.name !== "AbortError") {
        console.error("Failed to load initial data from Supabase:", errorObj?.message || err);
      }
    } finally {
      setIsLoadingDb(false);
    }
  }, [setUser]);

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

    refreshFromDb();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getCurrentAuthUser();
        if (profile) {
          setUser(profile);
          const [userFollows, userNotifs] = await Promise.all([
            fetchUserFollows(profile.id),
            fetchUserNotifications(profile.id),
          ]);
          setFollowingCreatorIds(new Set(userFollows));
          setNotifications(userNotifs);
        }
      } else if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setNotifications([]);
        setAppreciatedProjectIds(new Set());
        setFollowingCreatorIds(new Set());
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refreshFromDb]);

  // Auth Operations
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await signInWithEmail(email, password);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshFromDb();
    }
    return res;
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
      await refreshFromDb();
    }
    return res;
  };

  const logout = async () => {
    if (user) {
      updateProfileInDb(user.id, { isOnline: false }).catch(() => {});
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
        // Strictly send notification only to the target creator in DB (never to the actor)
        if (targetCreator && targetCreator.id !== user.id) {
          insertNotificationInDb({
            recipientId: targetCreator.id,
            actorId: user.id,
            type: "follow",
            content: `${user.displayName} started following your studio`,
          }).catch(console.error);
        }
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

  // Action: Appreciate Project (Instant Optimistic Feedback & DB Persistence)
  const toggleAppreciation = (projectId: string): boolean => {
    const targetProject = projects.find((p) => p.id === projectId);

    setAppreciatedProjectIds((prev) => {
      const next = new Set(prev);
      const wasAppreciated = next.has(projectId);
      if (wasAppreciated) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        // Strictly send notification only to the project creator in DB (never to the actor)
        if (user && targetProject && targetProject.creator && targetProject.creator.id !== user.id) {
          insertNotificationInDb({
            recipientId: targetProject.creator.id,
            actorId: user.id,
            type: "appreciation",
            projectId: targetProject.id,
            content: `${user.displayName} appreciated your project "${targetProject.title}"`,
          }).catch(console.error);
        }
      }
      return next;
    });

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const isCurrentlyAppreciated = appreciatedProjectIds.has(projectId);
          return {
            ...p,
            appreciations: isCurrentlyAppreciated
              ? Math.max(0, p.appreciations - 1)
              : p.appreciations + 1,
          };
        }
        return p;
      })
    );

    if (user?.id) {
      toggleAppreciationInDb(projectId, user.id).catch(console.error);
    }

    return true;
  };

  // GATED ACTION: Add Comment (Strictly Verified Only)
  const addComment = async (projectId: string, content: string) => {
    if (!user || !user.isVerified) {
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

    // Strictly notify the project creator in Supabase (never the actor)
    if (targetProject && targetProject.creator && targetProject.creator.id !== user.id) {
      insertNotificationInDb({
        recipientId: targetProject.creator.id,
        actorId: user.id,
        type: "comment",
        projectId: targetProject.id,
        content: `${user.displayName} commented on "${targetProject.title}": "${content}"`,
      }).catch(console.error);
    }

    // Persist to Supabase
    try {
      await insertComment(projectId, user.id, content);
    } catch (err) {
      console.error("Failed to save comment to database:", err);
    }
  };

  // GATED ACTION: Save Project (Requires authentication)
  const saveProject = async (projectData: Partial<Project> & { title: string }): Promise<Project> => {
    if (!user) {
      openVerificationModal("publish");
      throw new Error("Authentication is required before publishing projects.");
    }

    // Auto-verify authenticated user so they are never blocked
    if (!user.isVerified) {
      const verifiedUser = { ...user, isVerified: true };
      setUser(verifiedUser);
      updateProfileInDb(user.id, { isVerified: true }).catch(() => {});
    }

    if (projectData.id) {
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

      // Async update in Supabase
      updateProjectInDb(projectData.id, projectData).catch(console.error);

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
        category: projectData.category || "Brand",
        medium: projectData.medium || "Image",
        published: projectData.published ?? true,
        publishedAt: projectData.published ? "Just now" : "Draft",
        appreciations: 0,
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

  return (
    <SessionContext.Provider
      value={{
        user,
        projects,
        creators,
        isLoadingDb,
        isAuthReady,
        appreciatedProjectIds,
        followingCreatorIds,
        onlineUserIds,
        isUserOnline,
        notifications,

        unreadNotificationsCount,
        isVerificationModalOpen,
        verificationModalAction,
        verificationModalTargetName,
        openVerificationModal,
        closeVerificationModal,
        login,
        signup,
        logout,
        refreshFromDb,
        setUser,
        toggleAppreciation,
        isProjectAppreciated,
        toggleFollowCreator,
        isFollowingCreator,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addComment,
        saveProject,
        deleteProject,
        updateProfile,
        deleteAccount,
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
