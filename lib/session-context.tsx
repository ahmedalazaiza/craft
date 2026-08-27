"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Creator,
  Project,
  Comment,
  Notification,
  mockProjects,
  mockUsers,
} from "./mock";
import {
  fetchProjects,
  fetchCreators,
  insertProject,
  updateProjectInDb,
  deleteProjectFromDb,
  insertComment,
  toggleAppreciationInDb,
  updateProfileInDb,
} from "./supabase/queries";
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  getCurrentAuthUser,
  AuthResponse,
} from "./supabase/auth";
import { supabase } from "./supabase/client";

interface SessionContextType {
  user: Creator | null;
  projects: Project[];
  creators: Creator[];
  isLoadingDb: boolean;
  appreciatedProjectIds: Set<string>;
  followingCreatorIds: Set<string>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, displayName: string, customUsername?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshFromDb: () => Promise<void>;
  setUser: (user: Creator | null) => void;
  toggleAppreciation: (projectId: string) => boolean;
  isProjectAppreciated: (projectId: string) => boolean;
  toggleFollowCreator: (creatorId: string) => boolean;
  isFollowingCreator: (creatorId: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    notif: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  addComment: (projectId: string, content: string) => Promise<void>;
  saveProject: (projectData: Partial<Project> & { title: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  updateProfile: (updatedData: Partial<Creator>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Guest by default (user === null)
  const [user, setUser] = useState<Creator | null>(null);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [creators, setCreators] = useState<Creator[]>(mockUsers);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);
  const [appreciatedProjectIds, setAppreciatedProjectIds] = useState<Set<string>>(new Set());
  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check auth and fetch live database on mount
  const refreshFromDb = useCallback(async () => {
    try {
      setIsLoadingDb(true);
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
      } else {
        setUser(null);
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to load initial data from Supabase:", err);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    refreshFromDb();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getCurrentAuthUser();
        if (profile) {
          setUser(profile);
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
      await refreshFromDb();
    }
    return res;
  };

  const logout = async () => {
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
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (
    notif: Omit<Notification, "id" | "createdAt" | "read">
  ) => {
    const newNotification: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: "Just now",
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const toggleFollowCreator = (creatorId: string): boolean => {
    if (!user) {
      return false;
    }

    const targetCreator = creators.find((u) => u.id === creatorId);

    setFollowingCreatorIds((prev) => {
      const next = new Set(prev);
      const wasFollowing = next.has(creatorId);
      if (wasFollowing) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
        if (targetCreator) {
          addNotification({
            type: "follow",
            actor: user,
            content: `You started following ${targetCreator.displayName}`,
          });
        }
      }
      return next;
    });

    return true;
  };

  const toggleAppreciation = (projectId: string): boolean => {
    if (!user) {
      return false;
    }

    const targetProject = projects.find((p) => p.id === projectId);

    setAppreciatedProjectIds((prev) => {
      const next = new Set(prev);
      const wasAppreciated = next.has(projectId);
      if (wasAppreciated) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        if (targetProject) {
          addNotification({
            type: "appreciation",
            actor: user,
            project: {
              id: targetProject.id,
              slug: targetProject.slug,
              title: targetProject.title,
            },
          });
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

  const addComment = async (projectId: string, content: string) => {
    if (!user) return;

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

    if (targetProject) {
      addNotification({
        type: "comment",
        actor: user,
        project: {
          id: targetProject.id,
          slug: targetProject.slug,
          title: targetProject.title,
        },
        content,
      });
    }

    // Persist to Supabase
    try {
      await insertComment(projectId, user.id, content);
    } catch (err) {
      console.error("Failed to save comment to database:", err);
    }
  };

  const saveProject = async (projectData: Partial<Project> & { title: string }): Promise<Project> => {
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

      const activeCreator = user || {
        id: "guest-user",
        username: "creator",
        displayName: "Anonymous Creator",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        bio: "",
        location: "Worldwide",
        city: "Global",
        skills: [],
        isVerified: false,
        isOnline: true,
        followersCount: 0,
        isCurrentUser: true,
      };

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
        creator: activeCreator,
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

      if (newProj.published && user) {
        addNotification({
          type: "publish",
          actor: user,
          project: {
            id: newProj.id,
            slug: newProj.slug,
            title: newProj.title,
          },
        });
      }

      // Persist to Supabase
      try {
        const dbResult = await insertProject({
          ...newProj,
          creatorId: user?.id || "a0000001-0000-4000-8000-000000000001",
        });
        if (dbResult) {
          setProjects((prev) => prev.map((p) => (p.slug === slug ? dbResult : p)));
          return dbResult;
        }
      } catch (err) {
        console.error("Failed to insert project into Supabase:", err);
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

  return (
    <SessionContext.Provider
      value={{
        user,
        projects,
        creators,
        isLoadingDb,
        appreciatedProjectIds,
        followingCreatorIds,
        notifications,
        unreadNotificationsCount,
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
        addNotification,
        addComment,
        saveProject,
        deleteProject,
        updateProfile,
      }}
    >
      {children}
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
