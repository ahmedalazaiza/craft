"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Creator,
  Project,
  Notification,
  currentUser,
  mockProjects,
  mockUsers,
  mockNotifications,
} from "./mock";

interface SessionContextType {
  user: Creator | null;
  projects: Project[];
  appreciatedProjectIds: Set<string>;
  followingCreatorIds: Set<string>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  toggleUserSession: () => void;
  setUser: (user: Creator | null) => void;
  toggleAppreciation: (projectId: string) => boolean; // returns true if authenticated, false if guest
  isProjectAppreciated: (projectId: string) => boolean;
  toggleFollowCreator: (creatorId: string) => boolean;
  isFollowingCreator: (creatorId: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (
    notif: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  addComment: (projectId: string, content: string) => void;
  saveProject: (projectData: Partial<Project> & { title: string }) => Project;
  updateProfile: (updatedData: Partial<Creator>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Creator | null>(currentUser);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [appreciatedProjectIds, setAppreciatedProjectIds] = useState<Set<string>>(
    new Set(["proj-1"])
  );
  // Track followed creators in session (init with Kai Sato user-2 and Maya Lin user-3 for rich demo)
  const [followingCreatorIds, setFollowingCreatorIds] = useState<Set<string>>(
    new Set(["user-2", "user-3"])
  );
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const toggleUserSession = () => {
    setUser((prev) => (prev ? null : currentUser));
  };

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
      return false; // Not authenticated
    }

    const targetCreator = mockUsers.find((u) => u.id === creatorId);

    setFollowingCreatorIds((prev) => {
      const next = new Set(prev);
      const wasFollowing = next.has(creatorId);
      if (wasFollowing) {
        next.delete(creatorId);
      } else {
        next.add(creatorId);
        // Trigger live notification if following someone
        if (targetCreator) {
          addNotification({
            type: "follow",
            actor: user,
            content: `You started following ${targetCreator.displayName}'s studio`,
          });
        }
      }
      return next;
    });

    return true;
  };

  const toggleAppreciation = (projectId: string): boolean => {
    if (!user) {
      return false; // Not authenticated
    }

    const targetProject = projects.find((p) => p.id === projectId);

    setAppreciatedProjectIds((prev) => {
      const next = new Set(prev);
      const wasAppreciated = next.has(projectId);
      if (wasAppreciated) {
        next.delete(projectId);
      } else {
        next.add(projectId);
        // Trigger live notification when appreciating
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

    return true;
  };

  const addComment = (projectId: string, content: string) => {
    if (!user) return;
    const newComment = {
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
            comments: [newComment, ...p.comments],
          };
        }
        return p;
      })
    );

    // Trigger live notification on comment
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
  };

  const saveProject = (projectData: Partial<Project> & { title: string }) => {
    if (projectData.id) {
      // update existing
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
      return updated || (projectData as Project);
    } else {
      // create new
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        slug:
          projectData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || `project-${Date.now()}`,
        title: projectData.title,
        summary: projectData.summary || "",
        body: projectData.body || "",
        coverImage:
          projectData.coverImage ||
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85",
        galleryImages: projectData.galleryImages || [],
        creator: user || currentUser,
        tags:
          projectData.tags && projectData.tags.length > 0
            ? projectData.tags
            : ["Design"],
        tools:
          projectData.tools && projectData.tools.length > 0
            ? projectData.tools
            : ["Figma"],
        category: projectData.category || "Brand",
        medium: projectData.medium || "Image",
        published: projectData.published ?? true,
        publishedAt: projectData.published ? "Just now" : "Draft",
        appreciations: 0,
        comments: [],
      };
      setProjects((prev) => [newProj, ...prev]);

      // Trigger notification for published work
      if (newProj.published) {
        addNotification({
          type: "publish",
          actor: user || currentUser,
          project: {
            id: newProj.id,
            slug: newProj.slug,
            title: newProj.title,
          },
        });
      }

      return newProj;
    }
  };

  const updateProfile = (updatedData: Partial<Creator>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        projects,
        appreciatedProjectIds,
        followingCreatorIds,
        notifications,
        unreadNotificationsCount,
        toggleUserSession,
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
