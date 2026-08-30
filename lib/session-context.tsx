"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Creator,
  Project,
  Comment,
  Notification,
  CommunityPost,
  CommunityComment,
} from "./types";
import {
  loadCommunityPostsFromStorage,
  saveCommunityPostsToStorage,
  INITIAL_COMMUNITY_POSTS,
  loadUserLikesMap,
  saveUserLikesMap,
  loadUserVotesMap,
  saveUserVotesMap,
} from "./community-data";
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
  fetchCommunityPostsFromDb,
  insertCommunityPostInDb,
  updateCommunityPostInDb,
  deleteCommunityPostInDb,
  toggleCommunityLikeInDb,
  voteCommunityPostInDb,
  insertCommunityCommentInDb,
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
  communityPosts: CommunityPost[];
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
  updateProfile: (updatedData: Partial<Creator>) => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  // Community Actions
  createCommunityPost: (postData: Omit<CommunityPost, "id" | "author" | "createdAt" | "likesCount" | "comments">) => Promise<CommunityPost>;
  updateCommunityPost: (postId: string, updates: Partial<CommunityPost>) => Promise<boolean>;
  deleteCommunityPost: (postId: string) => Promise<boolean>;
  likeCommunityPost: (postId: string) => number;
  voteCommunityPost: (postId: string, optionId: string) => void;
  addCommunityComment: (postId: string, content: string) => Promise<CommunityComment | null>;
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
      if (!identifier) return false;
      const idLower = identifier.toLowerCase();
      // Current active session user is always online
      if (user && (user.id === identifier || user.username.toLowerCase() === idLower)) {
        return true;
      }
      // Presence room active users
      if (onlineUserIds.has(identifier) || onlineUsernames.has(idLower)) {
        return true;
      }
      // Check database state as fallback
      const found = creators.find(
        (c) => c.id === identifier || c.username.toLowerCase() === idLower
      );
      return found?.isOnline ?? false;
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

  // GATED ACTION: Appreciate Project (Strictly Verified Only)
  const toggleAppreciation = (projectId: string): boolean => {
    const targetProject = projects.find((p) => p.id === projectId);

    // If guest or not verified, trigger verification modal
    if (!user || !user.isVerified) {
      openVerificationModal("like", targetProject?.title);
      return false;
    }

    setAppreciatedProjectIds((prev) => {
      const next = new Set(prev);
      const wasAppreciated = next.has(projectId);
      if (wasAppreciated) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        // Strictly send notification only to the project creator in DB (never to the actor)
        if (targetProject && targetProject.creator && targetProject.creator.id !== user.id) {
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

    // Sync with Supabase
    toggleAppreciationInDb(projectId, user.id).catch(console.error);

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

  const updateProfile = async (updatedData: Partial<Creator>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    setCreators((prev) => prev.map((c) => (c.id === user.id ? updated : c)));

    // Persist to Supabase
    updateProfileInDb(user.id, updatedData).catch(console.error);
  };

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);

  // Load from local storage immediately, then fetch live from Supabase & subscribe to realtime
  useEffect(() => {
    // 1. Instant local storage bootstrap
    if (typeof window !== "undefined") {
      const cached = loadCommunityPostsFromStorage();
      if (cached && cached.length > 0) {
        setCommunityPosts(cached);
      }
    }

    // 2. Fetch live data from Supabase
    fetchCommunityPostsFromDb(user?.id, loadUserLikesMap(), loadUserVotesMap())
      .then((dbPosts) => {
        if (dbPosts && dbPosts.length > 0) {
          setCommunityPosts(dbPosts);
          saveCommunityPostsToStorage(dbPosts);
        }
      })
      .catch((err) => {
        console.warn("Notice fetching community posts from Supabase:", err);
      });

    // 3. Realtime subscription on community changes
    const channel = supabase
      .channel("community_realtime_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_posts" },
        () => {
          fetchCommunityPostsFromDb(user?.id, loadUserLikesMap(), loadUserVotesMap()).then((posts) => {
            if (posts && posts.length > 0) {
              setCommunityPosts(posts);
              saveCommunityPostsToStorage(posts);
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const createCommunityPost = async (
    postData: Omit<CommunityPost, "id" | "author" | "createdAt" | "likesCount" | "comments">
  ): Promise<CommunityPost> => {
    if (!user) {
      openVerificationModal("publish", "Create Community Post");
      throw new Error("Authentication required");
    }

    const optimisticPost: CommunityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      author: user,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      userLikes: 0,
      comments: [],
    };

    const updated = [optimisticPost, ...communityPosts];
    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    // Persist to Supabase
    insertCommunityPostInDb(postData, user.id)
      .then((savedPost) => {
        if (savedPost) {
          setCommunityPosts((prev) =>
            prev.map((p) => (p.id === optimisticPost.id ? savedPost : p))
          );
        }
      })
      .catch((err) => {
        console.warn("Notice saving community post to Supabase:", err);
      });

    return optimisticPost;
  };

  const updateCommunityPost = async (
    postId: string,
    updates: Partial<CommunityPost>
  ): Promise<boolean> => {
    if (!user) {
      openVerificationModal("publish", "Edit Community Post");
      return false;
    }

    const updated = communityPosts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          ...updates,
          author: p.author, // keep original author object
        };
      }
      return p;
    });

    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    // Persist update to DB
    const success = await updateCommunityPostInDb(postId, updates);
    return success;
  };

  const deleteCommunityPost = async (postId: string): Promise<boolean> => {
    if (!user) {
      openVerificationModal("publish", "Delete Community Post");
      return false;
    }

    const updated = communityPosts.filter((p) => p.id !== postId);
    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    // Persist delete to DB
    const success = await deleteCommunityPostInDb(postId);
    return success;
  };

  const likeCommunityPost = (postId: string): number => {
    let currentLikes = 0;
    const targetPost = communityPosts.find((p) => p.id === postId);

    const updated = communityPosts.map((p) => {
      if (p.id === postId) {
        const prevUserLikes = p.userLikes || 0;
        if (prevUserLikes >= 10) {
          currentLikes = 10;
          return p; // max 10
        }
        currentLikes = prevUserLikes + 1;
        return {
          ...p,
          likesCount: p.likesCount + 1,
          userLikes: currentLikes,
        };
      }
      return p;
    });

    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    const userLikesMap = loadUserLikesMap();
    userLikesMap[postId] = currentLikes;
    saveUserLikesMap(userLikesMap);

    // Persist like / claps count to Supabase
    if (user) {
      toggleCommunityLikeInDb(postId, user.id, currentLikes).catch(console.error);
    }

    // Notify author if current user is logged in and not author
    if (user && targetPost && targetPost.author.id !== user.id && currentLikes === 1) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: "community_like",
        actor: user,
        post: {
          id: targetPost.id,
          title: targetPost.title,
        },
        content: `${user.displayName} liked your post "${targetPost.title.slice(0, 40)}..."`,
        createdAt: "Just now",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Persist notification in DB
      insertNotificationInDb({
        recipientId: targetPost.author.id,
        actorId: user.id,
        type: "community_like",
        content: `${user.displayName} liked your post "${targetPost.title.slice(0, 40)}..."`,
      }).catch(console.error);
    }

    return currentLikes;
  };

  const voteCommunityPost = (postId: string, optionId: string) => {
    const targetPost = communityPosts.find((p) => p.id === postId);
    const updated = communityPosts.map((p) => {
      if (p.id === postId) {
        // If it's an A/B test
        if (p.type === "ab_test" && p.abTest) {
          const prevChoice = p.userVotedOptionId;
          if (prevChoice === optionId) return p; // same vote

          const isA = optionId === "A";
          const newOptionA = {
            ...p.abTest.optionA,
            votesCount: isA
              ? p.abTest.optionA.votesCount + 1
              : prevChoice === "A"
              ? Math.max(0, p.abTest.optionA.votesCount - 1)
              : p.abTest.optionA.votesCount,
          };
          const newOptionB = {
            ...p.abTest.optionB,
            votesCount: !isA
              ? p.abTest.optionB.votesCount + 1
              : prevChoice === "B"
              ? Math.max(0, p.abTest.optionB.votesCount - 1)
              : p.abTest.optionB.votesCount,
          };

          return {
            ...p,
            userVotedOptionId: optionId,
            abTest: {
              optionA: newOptionA,
              optionB: newOptionB,
            },
          };
        }

        // If it's a Poll
        if (p.type === "poll" && p.poll) {
          const prevChoice = p.userVotedOptionId;
          if (prevChoice === optionId) return p; // same vote

          const updatedOptions = p.poll.options.map((opt) => {
            if (opt.id === optionId) {
              return { ...opt, votesCount: (opt.votesCount || 0) + 1 };
            }
            if (prevChoice && opt.id === prevChoice) {
              return { ...opt, votesCount: Math.max(0, (opt.votesCount || 0) - 1) };
            }
            return { ...opt, votesCount: opt.votesCount || 0 };
          });

          const totalVotes = updatedOptions.reduce((acc, o) => acc + (o.votesCount || 0), 0);

          return {
            ...p,
            userVotedOptionId: optionId,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes,
            },
          };
        }
      }
      return p;
    });

    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    const userVotesMap = loadUserVotesMap();
    userVotesMap[postId] = optionId;
    saveUserVotesMap(userVotesMap);

    // Persist vote to Supabase
    if (user) {
      voteCommunityPostInDb(postId, user.id, optionId).catch(console.error);
    }

    // Notify author if voter is logged in and not author
    if (user && targetPost && targetPost.author.id !== user.id) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: "community_vote",
        actor: user,
        post: {
          id: targetPost.id,
          title: targetPost.title,
        },
        content: `${user.displayName} voted on your post "${targetPost.title.slice(0, 40)}..."`,
        createdAt: "Just now",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      insertNotificationInDb({
        recipientId: targetPost.author.id,
        actorId: user.id,
        type: "community_vote",
        content: `${user.displayName} voted on your post "${targetPost.title.slice(0, 40)}..."`,
      }).catch(console.error);
    }
  };

  const addCommunityComment = async (postId: string, content: string): Promise<CommunityComment | null> => {
    if (!user) {
      openVerificationModal("comment", "Join Discussion");
      return null;
    }

    const optimisticComment: CommunityComment = {
      id: `cc-${Date.now()}`,
      author: user,
      content,
      createdAt: "Just now",
    };

    const targetPost = communityPosts.find((p) => p.id === postId);

    const updated = communityPosts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [optimisticComment, ...p.comments],
        };
      }
      return p;
    });

    setCommunityPosts(updated);
    saveCommunityPostsToStorage(updated);

    // Persist comment to Supabase
    insertCommunityCommentInDb(postId, user.id, content)
      .then((savedComment) => {
        if (savedComment) {
          setCommunityPosts((prev) =>
            prev.map((p) => {
              if (p.id === postId) {
                return {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === optimisticComment.id ? savedComment : c
                  ),
                };
              }
              return p;
            })
          );
        }
      })
      .catch(console.error);

    // Notify author
    if (targetPost && targetPost.author.id !== user.id) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: "community_comment",
        actor: user,
        post: {
          id: targetPost.id,
          title: targetPost.title,
        },
        content: `${user.displayName} replied: "${content.slice(0, 40)}..."`,
        createdAt: "Just now",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      insertNotificationInDb({
        recipientId: targetPost.author.id,
        actorId: user.id,
        type: "community_comment",
        content: `${user.displayName} replied to your post "${targetPost.title.slice(0, 40)}...": "${content.slice(0, 40)}"`,
      }).catch(console.error);
    }

    return optimisticComment;
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
        communityPosts,
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

        createCommunityPost,
        updateCommunityPost,
        deleteCommunityPost,
        likeCommunityPost,
        voteCommunityPost,
        addCommunityComment,
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
