import { supabase } from "./client";
import {
  Project,
  Creator,
  Comment,
  Notification,
  NotificationType,
  CommunityPost,
  CommunityComment,
} from "@/lib/types";
import { DEFAULT_AVATAR_URL } from "@/lib/avatar";

// =============================================================================
// TYPE MAPPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileToCreator(row: any, currentUserId?: string): Creator {
  if (!row) {
    return {
      id: "",
      username: "creator",
      displayName: "Creator",
      avatarUrl: DEFAULT_AVATAR_URL,
      bio: "",
      location: "",
      city: "",
      skills: [],
      isVerified: false,
      isOnline: false,
      followersCount: 0,
      isCurrentUser: false,
    };
  }

  const liveFollowers =
    Array.isArray(row.followers) && row.followers.length > 0 && typeof row.followers[0].count === "number"
      ? row.followers[0].count
      : (row.followers_count ?? 0);

  return {
    id: row.id || "",
    username: row.username || "creator",
    displayName: row.display_name || row.username || "Creator",
    avatarUrl: row.avatar_url || DEFAULT_AVATAR_URL,
    bio: row.bio || "",
    location: row.location || "",
    city: row.city || row.location || "",
    website: row.website || undefined,
    skills: row.skills || [],
    isVerified: Boolean(row.is_verified),
    isOnline: row.is_online ?? false,
    followersCount: liveFollowers,
    isCurrentUser: currentUserId ? row.id === currentUserId : false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommentRow(row: any): Comment {
  return {
    id: row.id,
    author: mapProfileToCreator(row.author || row.profiles),
    content: row.content,
    createdAt: formatTimeAgo(new Date(row.created_at || Date.now())),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProjectRow(row: any, currentUserId?: string): Project {
  const creator = mapProfileToCreator(row.creator || row.profiles, currentUserId);
  const comments = Array.isArray(row.comments)
    ? row.comments.map(mapCommentRow)
    : [];

  const liveAppreciations =
    Array.isArray(row.appreciations) && row.appreciations.length > 0 && typeof row.appreciations[0].count === "number"
      ? row.appreciations[0].count
      : (row.appreciations_count ?? 0);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || "",
    body: row.body || "",
    coverImage: row.cover_image,
    galleryImages: row.gallery_images && row.gallery_images.length > 0 ? row.gallery_images : [row.cover_image],
    creator,
    tags: row.tags || [],
    tools: row.tools || [],
    category: row.category,
    subCategory: row.sub_category || undefined,
    medium: row.medium,
    published: row.published ?? true,
    publishedAt: formatTimeAgo(new Date(row.published_at || row.created_at || Date.now())),
    appreciations: liveAppreciations,
    comments,
    featured: row.featured ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotificationRow(row: any): Notification {
  return {
    id: row.id,
    type: (row.type as NotificationType) || "appreciation",
    actor: mapProfileToCreator(row.actor || {}),
    project: row.project
      ? {
          id: row.project.id,
          slug: row.project.slug,
          title: row.project.title,
        }
      : undefined,
    content: row.content || undefined,
    createdAt: row.created_at ? formatTimeAgo(new Date(row.created_at)) : "Just now",
    read: !!row.read,
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return `${Math.floor(diffInDays / 7)}w ago`;
}

// =============================================================================
// DATABASE QUERIES (WITH INSTANT IN-MEMORY SERVER CACHE)
// =============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string, ttlMs = 30000): T | null {
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.timestamp < ttlMs) {
    return entry.data as T;
  }
  return null;
}

function setToCache<T>(key: string, data: T): void {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateAppCache(): void {
  memoryCache.clear();
}

export interface FetchProjectsOptions {
  category?: string;
  tag?: string;
  medium?: string;
  search?: string;
  sort?: "newest" | "appreciated" | "comments" | "title";
  creatorId?: string;
  publishedOnly?: boolean;
}

/**
 * Fetch all projects from Supabase with relations (Instant Memory Cache)
 */
export async function fetchProjects(options: FetchProjectsOptions = {}): Promise<Project[]> {
  const cacheKey = `projects:${JSON.stringify(options)}`;
  const cached = getFromCache<Project[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let query = supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `);

    if (options.publishedOnly !== false) {
      query = query.eq("published", true);
    }

    if (options.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }

    if (options.medium && options.medium !== "All") {
      query = query.eq("medium", options.medium);
    }

    if (options.creatorId) {
      query = query.eq("creator_id", options.creatorId);
    }

    // Sort order
    if (options.sort === "appreciated") {
      query = query.order("appreciations_count", { ascending: false });
    } else if (options.sort === "title") {
      query = query.order("title", { ascending: true });
    } else {
      query = query.order("published_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error || !data) {
      if (error && (error.message || Object.keys(error).length > 0)) {
        console.error("Error fetching projects from Supabase:", error.message || error.details || error);
      }
      return [];
    }

    let projects = data.map((row) => mapProjectRow(row));

    // Apply text search & tag filter in memory if needed
    if (options.search) {
      const q = options.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.creator.displayName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.tools.some((tl) => tl.toLowerCase().includes(q))
      );
    }

    if (options.tag) {
      projects = projects.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
      );
    }

    setToCache(cacheKey, projects);
    return projects;
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string };
    if (errorObj?.name !== "AbortError") {
      console.error("Error fetching projects from Supabase:", errorObj?.message || err);
    }
    return [];
  }
}

/**
 * Fetch a single project by its unique slug
 */
export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with slug '${slug}':`, err);
    return null;
  }
}

/**
 * Fetch a single project by its unique ID (UUID or custom ID)
 */
export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*)),
        appreciations(count)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with id '${id}':`, err);
    return null;
  }
}

/**
 * Fetch all creators from Supabase (Instant Memory Cache)
 */
export async function fetchCreators(): Promise<Creator[]> {
  const cacheKey = "creators:all";
  const cached = getFromCache<Creator[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        followers:follows!following_id(count)
      `)
      .order("followers_count", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    const creators = data.map((row) => mapProfileToCreator(row));
    setToCache(cacheKey, creators);
    return creators;
  } catch (err) {
    console.error("Error fetching creators from Supabase:", err);
    return [];
  }
}

/**
 * Fetch a single creator by username
 */
export async function fetchCreatorByUsername(username: string): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        followers:follows!following_id(count)
      `)
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapProfileToCreator(data);
  } catch (err) {
    console.error(`Error fetching creator '@${username}':`, err);
    return null;
  }
}


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve a guaranteed valid creator ID that exists in public.profiles table
 */
async function resolveValidCreatorId(
  creatorId?: string,
  creator?: Creator
): Promise<string> {
  try {
    // 1. Try finding by ID
    if (creatorId && UUID_REGEX.test(creatorId)) {
      const { data: existingById } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", creatorId)
        .maybeSingle();

      if (existingById?.id) return existingById.id;
    }

    // 2. Try finding by creator username
    const candidateUsername = creator?.username;
    if (candidateUsername) {
      const { data: existingByUsername } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", candidateUsername)
        .maybeSingle();

      if (existingByUsername?.id) return existingByUsername.id;
    }

    // 3. Try to create profile for this creatorId if valid UUID
    if (creatorId && UUID_REGEX.test(creatorId)) {
      const uniqueUsername = `creator_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const { data: created, error } = await supabase
        .from("profiles")
        .insert({
          id: creatorId,
          username: candidateUsername || uniqueUsername,
          display_name: creator?.displayName || "Creator",
          avatar_url: creator?.avatarUrl || DEFAULT_AVATAR_URL,
          bio: creator?.bio || "Independent designer & creative practitioner.",
          location: creator?.location || "Worldwide",
          city: creator?.city || "Global",
          skills: creator?.skills || ["Design"],
          is_verified: true,
          is_online: true,
          followers_count: 0,
        })
        .select("id")
        .maybeSingle();

      if (!error && created?.id) return created.id;
    }

    // 4. Fallback to first existing profile in the database
    const { data: firstProfile } = await supabase
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    return firstProfile?.id || "a0000001-0000-4000-8000-000000000001";
  } catch (err) {
    console.warn("Notice resolving creator ID:", err);
    return "a0000001-0000-4000-8000-000000000001";
  }
}

/**
 * Create a new project in Supabase with validation & auto-healing
 */
export async function insertProject(project: Partial<Project> & { creatorId?: string; creator?: Creator }): Promise<Project | null> {
  try {
    const finalCreatorId = await resolveValidCreatorId(
      project.creatorId || project.creator?.id,
      project.creator
    );

    // Generate clean, unique slug
    let baseSlug = project.slug;
    if (!baseSlug || !baseSlug.trim()) {
      baseSlug = (project.title || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = `project-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    const { data: existingSlug } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();

    if (existingSlug) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85";
    const finalCover = project.coverImage || defaultCover;
    const finalGallery = project.galleryImages && project.galleryImages.length > 0 
      ? project.galleryImages.filter(Boolean) 
      : [finalCover];

    const finalTags = project.subCategory && !(project.tags || []).includes(project.subCategory)
      ? [project.subCategory, ...(project.tags || [])]
      : (project.tags && project.tags.length > 0 ? project.tags : ["Design"]);

    const row = {
      slug: finalSlug,
      title: project.title || "Untitled Project",
      summary: project.summary || "",
      body: project.body || "",
      cover_image: finalCover,
      gallery_images: finalGallery.length > 0 ? finalGallery : [finalCover],
      category: project.category || "User Interface Design (UI)",
      medium: project.medium || "Image",
      tags: finalTags,
      tools: project.tools && project.tools.length > 0 ? project.tools : ["Figma"],
      published: project.published ?? true,
      featured: project.featured ?? false,
      creator_id: finalCreatorId,
      appreciations_count: 0,
      published_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from("projects")
      .insert(row)
      .select(`
        *,
        creator:profiles!creator_id(*)
      `)
      .single();

    if (error) {
      console.warn("Supabase project insert notice:", error.message || error.code || JSON.stringify(error));
      
      // If error was slug conflict, retry with unique timestamp slug
      if (error.code === "23505") {
        row.slug = `${baseSlug}-${Date.now()}`;
        const res = await supabase
          .from("projects")
          .insert(row)
          .select(`*, creator:profiles!creator_id(*)`)
          .single();
        data = res.data;
        error = res.error;
      } else if (error.code === "23503") {
        // Foreign key retry with guaranteed default profile
        const { data: defaultProfile } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
        if (defaultProfile?.id) {
          row.creator_id = defaultProfile.id;
          const res = await supabase
            .from("projects")
            .insert(row)
            .select(`*, creator:profiles!creator_id(*)`)
            .single();
          data = res.data;
          error = res.error;
        }
      }
    }

    if (error || !data) {
      return null;
    }

    invalidateAppCache();
    return mapProjectRow(data);
  } catch (err) {
    console.warn("Supabase insert project exception:", err);
    return null;
  }
}

/**
 * Update an existing project
 */
export async function updateProjectInDb(id: string, updates: Partial<Project>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.summary !== undefined) payload.summary = updates.summary;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
    if (updates.galleryImages !== undefined) payload.gallery_images = updates.galleryImages;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.medium !== undefined) payload.medium = updates.medium;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.tools !== undefined) payload.tools = updates.tools;
    if (updates.published !== undefined) payload.published = updates.published;

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);

    if (error) {
      console.error("Error updating project:", error);
      return false;
    }
    invalidateAppCache();
    return true;
  } catch (err) {
    console.error("Error updating project in Supabase:", err);
    return false;
  }
}

/**
 * Delete a project
 */
export async function deleteProjectFromDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      invalidateAppCache();
    }
    return !error;
  } catch (err) {
    console.error("Error deleting project:", err);
    return false;
  }
}

/**
 * Add a comment to a project
 */
export async function insertComment(projectId: string, authorId: string, content: string): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        project_id: projectId,
        author_id: authorId,
        content,
      })
      .select(`*, author:profiles!author_id(*)`)
      .single();

    if (error || !data) {
      console.error("Error posting comment:", error);
      return null;
    }

    invalidateAppCache();
    return mapCommentRow(data);
  } catch (err) {
    console.error("Error adding comment in Supabase:", err);
    return null;
  }
}

/**
 * Toggle appreciation (like/heart)
 */
export async function toggleAppreciationInDb(projectId: string, userId: string): Promise<boolean> {
  try {
    // Check if already appreciated
    const { data } = await supabase
      .from("appreciations")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      // Remove appreciation
      await supabase.from("appreciations").delete().eq("id", data.id);

      // Recalculate true real count
      const { count } = await supabase
        .from("appreciations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ appreciations_count: count ?? 0 })
        .eq("id", projectId);

      invalidateAppCache();
      return false;
    } else {
      // Add appreciation
      await supabase.from("appreciations").insert({ project_id: projectId, user_id: userId });

      // Recalculate true real count
      const { count } = await supabase
        .from("appreciations")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId);

      await supabase
        .from("projects")
        .update({ appreciations_count: count ?? 1 })
        .eq("id", projectId);

      invalidateAppCache();
      return true;
    }
  } catch (err) {
    console.error("Error toggling appreciation:", err);
    return false;
  }
}

/**
 * Check if a username handle is available or taken
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; error?: string }> {
  const clean = username.trim().toLowerCase().replace(/^@/, "");
  if (!clean) return { available: false, error: "Username cannot be empty" };
  if (clean.length < 3) return { available: false, error: "Username must be at least 3 characters" };
  if (clean.length > 30) return { available: false, error: "Username must be at most 30 characters" };
  if (!/^[a-z0-9_.-]+$/.test(clean)) {
    return { available: false, error: "Only letters, numbers, underscores, dashes, and periods are allowed" };
  }
  const reserved = [
    "admin",
    "explore",
    "community",
    "creators",
    "settings",
    "about",
    "api",
    "login",
    "signup",
    "onboarding",
    "terms",
    "privacy",
    "guidelines",
    "project",
    "me",
  ];
  if (reserved.includes(clean)) {
    return { available: false, error: "This username is reserved" };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", clean)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      return { available: true };
    }

    if (data && data.id !== currentUserId) {
      return { available: false, error: "Username is already taken" };
    }

    return { available: true };
  } catch {
    return { available: true };
  }
}

/**
 * Update creator profile
 */
export async function updateProfileInDb(id: string, updates: Partial<Creator>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.username !== undefined) payload.username = updates.username.trim().toLowerCase().replace(/^@/, "");
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.isOnline !== undefined) payload.is_online = updates.isOnline;

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);

    if (!error) {
      invalidateAppCache();
    }
    return !error;
  } catch (err) {
    console.error("Error updating profile in Supabase:", err);
    return false;
  }
}

/**
 * Fetch list of creator IDs that a user follows
 */
export async function fetchFollowingIds(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (error || !data) return new Set();

    return new Set(data.map((row) => row.following_id));
  } catch {
    return new Set();
  }
}

export async function fetchUserFollows(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (error || !data) return [];
    return data.map((r: { following_id: string }) => r.following_id);
  } catch (err) {
    console.error("Error fetching user follows from Supabase:", err);
    return [];
  }
}

/**
 * Toggle follow/unfollow a creator
 */
export async function toggleFollowInDb(followerId: string, followingId: string): Promise<boolean> {
  try {
    // Check if relationship already exists
    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle();

    if (data) {
      // Unfollow: delete row
      await supabase.from("follows").delete().eq("id", data.id);

      // Recalculate true real followers count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", followingId);

      await supabase
        .from("profiles")
        .update({ followers_count: count ?? 0 })
        .eq("id", followingId);

      invalidateAppCache();
      return false; // Not following anymore
    } else {
      // Follow: insert row
      await supabase.from("follows").insert({
        follower_id: followerId,
        following_id: followingId,
      });

      // Recalculate true real followers count
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", followingId);

      await supabase
        .from("profiles")
        .update({ followers_count: count ?? 1 })
        .eq("id", followingId);

      invalidateAppCache();
      return true; // Now following
    }
  } catch (err) {
    console.error("Error toggling follow in Supabase:", err);
    return false;
  }
}

/**
 * Permanently delete a user account and all associated data from Supabase
 * Cascades to all projects, appreciations, comments, follows, and notifications.
 */
export async function deleteUserAccountInDb(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    // 1. Delete the profile record from public.profiles table
    // All related tables (projects, appreciations, comments, follows, notifications)
    // have ON DELETE CASCADE foreign key constraints on public.profiles(id).
    const { error: profileDeleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("Error deleting profile record from Supabase:", profileDeleteError);
      return { success: false, error: profileDeleteError.message };
    }

    // 2. Sign out the user session immediately
    await supabase.auth.signOut();

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to delete account.";
    console.error("Unexpected error deleting user account:", err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Trigger Supabase Password Reset Email
 */
export async function requestPasswordResetInDb(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) {
      return { success: false, error: "Email address is required." };
    }

    const redirectUrl = typeof window !== "undefined"
      ? `${window.location.origin}/settings?reset_password=true`
      : "http://localhost:3000/settings?reset_password=true";

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send reset email.";
    return { success: false, error: errorMsg };
  }
}

// =============================================================================
// NOTIFICATIONS QUERIES & MUTATIONS (STRICT RECIPIENT LOGIC)
// =============================================================================

/**
 * Fetch notifications for a specific recipient user from Supabase
 */
export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles!actor_id(*),
        project:projects!project_id(id, slug, title)
      `)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      if (error && (error.message || Object.keys(error).length > 0)) {
        console.error("Error fetching notifications from Supabase:", error.message || error);
      }
      return [];
    }

    return data.map(mapNotificationRow);
  } catch (err: unknown) {
    const errorObj = err as { name?: string; message?: string };
    if (errorObj?.name !== "AbortError") {
      console.error("Error in fetchUserNotifications:", errorObj?.message || err);
    }
    return [];
  }
}

/**
 * Dispatch a notification directly to the RECIPIENT in Supabase
 * STRICT BUSINESS RULE:
 * 1. actorId must NOT equal recipientId (no self-notifications).
 * 2. Stored for the recipient only.
 */
export async function insertNotificationInDb(payload: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  projectId?: string;
  content?: string;
}): Promise<void> {
  try {
    const { recipientId, actorId, type, projectId, content } = payload;

    // Strict Self-Action Guard: Never notify a user about their own actions
    if (!recipientId || !actorId || recipientId === actorId) {
      return;
    }

    const { error } = await supabase.from("notifications").insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      project_id: projectId || null,
      content: content || null,
      read: false,
    });

    if (error) {
      console.error("Error inserting notification in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to dispatch notification to Supabase:", err);
  }
}

/**
 * Mark a single notification as read in Supabase
 */
export async function markNotificationReadInDb(notificationId: string): Promise<void> {
  try {
    if (!notificationId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
}

/**
 * Mark all notifications as read for a recipient in Supabase
 */
export async function markAllNotificationsReadInDb(recipientId: string): Promise<void> {
  try {
    if (!recipientId) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", recipientId)
      .eq("read", false);

    if (error) {
      console.error("Error marking all notifications as read in Supabase:", error.message || error);
    }
  } catch (err) {
    console.error("Failed to mark all notifications as read:", err);
  }
}

// =============================================================================
// COMMUNITY HUB DATABASE QUERIES & LIVE INTEGRATION
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityCommentRow(row: any): CommunityComment {
  return {
    id: row.id,
    author: mapProfileToCreator(row.author || row.profiles),
    content: row.content,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCommunityPostRow(
  row: any,
  currentUserId?: string,
  userLikesMap?: Record<string, number>,
  userVotesMap?: Record<string, string>
): CommunityPost {
  const author = mapProfileToCreator(row.author || row.profiles, currentUserId);
  const comments = Array.isArray(row.comments)
    ? row.comments.map(mapCommunityCommentRow)
    : [];

  const userLikes = userLikesMap && userLikesMap[row.id] !== undefined ? userLikesMap[row.id] : 0;
  const userVotedOptionId = userVotesMap ? userVotesMap[row.id] : undefined;

  let abTest = undefined;
  if (row.type === "ab_test" && row.ab_test_option_a_label) {
    abTest = {
      optionA: {
        id: "A" as const,
        label: row.ab_test_option_a_label,
        imageUrl: row.ab_test_option_a_image || undefined,
        votesCount: row.ab_test_option_a_votes || 0,
      },
      optionB: {
        id: "B" as const,
        label: row.ab_test_option_b_label,
        imageUrl: row.ab_test_option_b_image || undefined,
        votesCount: row.ab_test_option_b_votes || 0,
      },
    };
  }

  let poll = undefined;
  if (row.type === "poll") {
    const rawOptions = Array.isArray(row.poll_options) ? row.poll_options : [];
    const mappedOptions = rawOptions.map((opt: any, idx: number) => ({
      id: opt.id || `opt-${idx + 1}`,
      text: opt.text || `Option ${idx + 1}`,
      votesCount: typeof opt.votesCount === "number" ? opt.votesCount : 0,
    }));
    const sumVotes = mappedOptions.reduce((acc: number, o: { votesCount: number }) => acc + o.votesCount, 0);
    poll = {
      question: row.poll_question || row.title,
      options: mappedOptions,
      totalVotes: typeof row.poll_total_votes === "number" && row.poll_total_votes > 0 ? Math.max(row.poll_total_votes, sumVotes) : sumVotes,
    };
  }

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content || "",
    category: row.category,
    tags: row.tags || [],
    images: row.images || [],
    abTest,
    poll,
    author,
    likesCount: row.likes_count || 0,
    userLikes,
    userVotedOptionId,
    comments,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch all community posts with authors and comments from Supabase
 */
export async function fetchCommunityPostsFromDb(
  currentUserId?: string,
  userLikesMap?: Record<string, number>,
  userVotesMap?: Record<string, string>
): Promise<CommunityPost[]> {
  try {
    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        author:profiles!author_id(*),
        comments:community_comments(*, author:profiles!author_id(*))
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      if (error && error.message) {
        console.warn("Supabase community_posts query notice:", error.message);
      }
      return [];
    }

    return data.map((row) =>
      mapCommunityPostRow(row, currentUserId, userLikesMap, userVotesMap)
    );
  } catch (err) {
    console.error("Error fetching community posts from Supabase:", err);
    return [];
  }
}

/**
 * Insert a new community post in Supabase
 */
export async function insertCommunityPostInDb(
  post: Omit<CommunityPost, "id" | "author" | "createdAt" | "likesCount" | "comments">,
  authorId: string
): Promise<CommunityPost | null> {
  try {
    const payload: any = {
      type: post.type,
      title: post.title,
      content: post.content || null,
      category: post.category,
      tags: post.tags || [],
      images: post.images || [],
      author_id: authorId,
      likes_count: 0,
    };

    if (post.type === "ab_test" && post.abTest) {
      payload.ab_test_option_a_label = post.abTest.optionA.label;
      payload.ab_test_option_a_image = post.abTest.optionA.imageUrl || null;
      payload.ab_test_option_a_votes = 0;
      payload.ab_test_option_b_label = post.abTest.optionB.label;
      payload.ab_test_option_b_image = post.abTest.optionB.imageUrl || null;
      payload.ab_test_option_b_votes = 0;
    } else if (post.type === "poll" && post.poll) {
      payload.poll_question = post.poll.question;
      payload.poll_options = post.poll.options;
      payload.poll_total_votes = 0;
    }

    const { data, error } = await supabase
      .from("community_posts")
      .insert(payload)
      .select(`
        *,
        author:profiles!author_id(*)
      `)
      .single();

    if (error || !data) {
      console.error("Error inserting community post in Supabase:", error?.message || error);
      return null;
    }

    return mapCommunityPostRow(data, authorId);
  } catch (err) {
    console.error("Failed to insert community post:", err);
    return null;
  }
}

/**
 * Claps / Likes for a community post in Supabase
 */
export async function toggleCommunityLikeInDb(
  postId: string,
  userId: string,
  clapsCount: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("community_likes")
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          claps_count: clapsCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "post_id,user_id" }
      );

    if (error) {
      console.warn("Notice updating community_likes in Supabase:", error.message);
      return false;
    }

    // Increment likes_count on post
    await supabase.rpc("increment_community_likes", {
      target_post_id: postId,
      increment_by: 1,
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Vote for an A/B test or Poll choice in Supabase
 */
export async function voteCommunityPostInDb(
  postId: string,
  userId: string,
  optionId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("community_votes")
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          option_id: optionId,
        },
        { onConflict: "post_id,user_id" }
      );

    if (error) {
      console.warn("Notice updating community_votes in Supabase:", error.message);
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Add a comment to a community post in Supabase
 */
export async function insertCommunityCommentInDb(
  postId: string,
  authorId: string,
  content: string
): Promise<CommunityComment | null> {
  try {
    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: postId,
        author_id: authorId,
        content,
      })
      .select(`
        *,
        author:profiles!author_id(*)
      `)
      .single();

    if (error || !data) {
      console.warn("Notice inserting community comment in Supabase:", error?.message || error);
      return null;
    }

    return mapCommunityCommentRow(data);
  } catch (err) {
    console.error("Failed to insert community comment:", err);
    return null;
  }
}

/**
 * Update an existing community post in Supabase
 */
export async function updateCommunityPostInDb(
  postId: string,
  updates: Partial<CommunityPost>
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updatePayload.title = updates.title;
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.category !== undefined) updatePayload.category = updates.category;
    if (updates.tags !== undefined) updatePayload.tags = updates.tags;
    if (updates.images !== undefined) updatePayload.images = updates.images;

    if (updates.abTest) {
      updatePayload.ab_test_option_a_label = updates.abTest.optionA.label;
      updatePayload.ab_test_option_a_image = updates.abTest.optionA.imageUrl;
      updatePayload.ab_test_option_b_label = updates.abTest.optionB.label;
      updatePayload.ab_test_option_b_image = updates.abTest.optionB.imageUrl;
    }

    if (updates.poll) {
      updatePayload.poll_question = updates.poll.question;
      updatePayload.poll_options = updates.poll.options;
    }

    const { error } = await supabase
      .from("community_posts")
      .update(updatePayload)
      .eq("id", postId);

    if (error) {
      console.warn("Notice updating community post in Supabase:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to update community post in Supabase:", err);
    return false;
  }
}

/**
 * Delete a community post from Supabase
 */
export async function deleteCommunityPostInDb(postId: string): Promise<boolean> {
  try {
    // Delete associated records first
    await supabase.from("community_likes").delete().eq("post_id", postId);
    await supabase.from("community_votes").delete().eq("post_id", postId);
    await supabase.from("community_comments").delete().eq("post_id", postId);

    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.warn("Notice deleting community post in Supabase:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to delete community post from Supabase:", err);
    return false;
  }
}



