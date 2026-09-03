import { supabase } from "./client";
import { Project, Creator, Comment, Notification, NotificationType, PlatformSettings, Collection, LegalDocument, LegalSection } from "@/lib/types";
import { DEFAULT_AVATAR_URL } from "@/lib/avatar";
import { getAuthRedirectUrl } from "@/lib/seo";
import { deleteStorageFiles } from "./storage";
import { CategoryTaxonomyItem, FALLBACK_TAXONOMY } from "@/lib/taxonomy";

// =============================================================================
// TYPE MAPPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCategoryRow(row: any): CategoryTaxonomyItem {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name || row.name,
    description: row.description || "",
    subCategories: Array.isArray(row.sub_categories) ? row.sub_categories : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    tools: Array.isArray(row.tools) ? row.tools : [],
  };
}

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
    followersCount: liveFollowers,
    isCurrentUser: currentUserId ? row.id === currentUserId : false,
    role: row.role || "member",
    isFeatured: Boolean(row.is_featured),
    badge: row.badge || undefined,
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
    typeof row.appreciations_count === "number"
      ? row.appreciations_count
      : Array.isArray(row.appreciations) && row.appreciations.length > 0 && typeof row.appreciations[0].count === "number"
      ? row.appreciations[0].count
      : 0;

  const liveViews =
    typeof row.views_count === "number"
      ? row.views_count
      : typeof row.views === "number"
      ? row.views
      : 0;

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
    category: row.category || (Array.isArray(row.categories) && row.categories[0]) || "User Interface Design (UI)",
    categories: Array.isArray(row.categories) && row.categories.length > 0 ? row.categories : (row.category ? [row.category] : []),
    subCategory: row.sub_category || (Array.isArray(row.sub_categories) && row.sub_categories[0]) || undefined,
    subCategories: Array.isArray(row.sub_categories) && row.sub_categories.length > 0 ? row.sub_categories : (row.sub_category ? [row.sub_category] : []),
    medium: row.medium,
    published: row.published ?? true,
    publishedAt: formatTimeAgo(new Date(row.published_at || row.created_at || Date.now())),
    createdAt: row.created_at || row.published_at,
    updatedAt: row.updated_at,
    appreciations: liveAppreciations,
    views: liveViews,
    comments,
    featured: row.featured ?? false,
    featuredOrder: typeof row.featured_order === "number" ? row.featured_order : undefined,
    badge: row.badge || undefined,
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

    const finalCategories = project.categories && project.categories.length > 0
      ? project.categories
      : [project.category || "User Interface Design (UI)"];

    const finalSubCategories = project.subCategories && project.subCategories.length > 0
      ? project.subCategories
      : (project.subCategory ? [project.subCategory] : []);

    const finalTags = Array.from(
      new Set([
        ...finalSubCategories,
        ...(project.tags && project.tags.length > 0 ? project.tags : ["Design"]),
      ])
    );

    const row = {
      slug: finalSlug,
      title: project.title || "Untitled Project",
      summary: project.summary || "",
      body: project.body || "",
      cover_image: finalCover,
      gallery_images: finalGallery.length > 0 ? finalGallery : [finalCover],
      category: finalCategories[0] || project.category || "User Interface Design (UI)",
      categories: finalCategories,
      sub_category: finalSubCategories[0] || project.subCategory || null,
      sub_categories: finalSubCategories,
      medium: project.medium || "Image",
      tags: finalTags,
      tools: project.tools && project.tools.length > 0 ? project.tools : ["Figma"],
      published: project.published ?? true,
      featured: project.featured ?? false,
      creator_id: finalCreatorId,
      appreciations_count: 0,
      views_count: 0,
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
    if (updates.categories !== undefined) {
      payload.categories = updates.categories;
      if (updates.categories.length > 0 && !updates.category) {
        payload.category = updates.categories[0];
      }
    }
    if (updates.subCategory !== undefined) payload.sub_category = updates.subCategory;
    if (updates.subCategories !== undefined) {
      payload.sub_categories = updates.subCategories;
      if (updates.subCategories.length > 0 && !updates.subCategory) {
        payload.sub_category = updates.subCategories[0];
      }
    }
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
 * Delete a project and purge its cloud media files from Supabase Storage
 */
export async function deleteProjectFromDb(id: string): Promise<boolean> {
  try {
    // 1. Fetch images to purge from Supabase storage
    const { data: projectRow } = await supabase
      .from("projects")
      .select("cover_image, gallery_images")
      .eq("id", id)
      .maybeSingle();

    if (projectRow) {
      const mediaUrls: string[] = [];
      if (projectRow.cover_image) mediaUrls.push(projectRow.cover_image);
      if (Array.isArray(projectRow.gallery_images)) {
        mediaUrls.push(...projectRow.gallery_images);
      }
      if (mediaUrls.length > 0) {
        await deleteStorageFiles(mediaUrls, "project-media");
      }
    }

    // 2. Explicitly hard delete associated comments and appreciations
    await Promise.allSettled([
      supabase.from("comments").delete().eq("project_id", id),
      supabase.from("appreciations").delete().eq("project_id", id),
    ]);

    // 3. Delete the project database record
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
 * Real-time username validation and database availability check
 */
export interface UsernameCheckResult {
  available: boolean;
  status: "available" | "taken" | "invalid" | "reserved" | "current";
  message: string;
}

export const RESERVED_USERNAMES = new Set([
  "admin", "administrator", "layerat", "craft", "explore", "creators",
  "settings", "login", "signup", "api", "about", "team", "me", "search",
  "terms", "privacy", "guidelines", "auth", "help", "support", "dashboard",
  "user", "profile", "app", "studio", "root", "null", "undefined"
]);

export async function checkUsernameAvailability(
  rawUsername: string,
  currentUserId?: string
): Promise<UsernameCheckResult> {
  const clean = rawUsername.trim().toLowerCase().replace(/^@+/, "");

  if (!clean) {
    return {
      available: false,
      status: "invalid",
      message: "Username cannot be empty."
    };
  }

  // Format validation: 3 to 30 alphanumeric + underscores
  const regex = /^[a-z0-9_]{3,30}$/;
  if (!regex.test(clean)) {
    if (clean.length < 3) {
      return {
        available: false,
        status: "invalid",
        message: "Username must be at least 3 characters."
      };
    }
    if (clean.length > 30) {
      return {
        available: false,
        status: "invalid",
        message: "Username cannot exceed 30 characters."
      };
    }
    return {
      available: false,
      status: "invalid",
      message: "Only lowercase letters, numbers, and underscores allowed."
    };
  }

  // Reserved handles check
  if (RESERVED_USERNAMES.has(clean)) {
    return {
      available: false,
      status: "reserved",
      message: `@${clean} is a reserved system handle.`
    };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", clean)
      .maybeSingle();

    if (error) {
      console.warn("Notice querying username availability:", error.message || error);
    }

    if (data) {
      if (currentUserId && data.id === currentUserId) {
        return {
          available: true,
          status: "current",
          message: "This is your current handle."
        };
      }
      return {
        available: false,
        status: "taken",
        message: `@${clean} is already taken.`
      };
    }

    return {
      available: true,
      status: "available",
      message: `@${clean} is available!`
    };
  } catch (err) {
    console.warn("Failed to check username availability:", err);
    return {
      available: true,
      status: "available",
      message: `@${clean} appears available.`
    };
  }
}

/**
 * Update creator profile
 */
export async function updateProfileInDb(id: string, updates: Partial<Creator>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.username !== undefined) {
      payload.username = updates.username.toLowerCase().trim().replace(/^@+/, "");
    }
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.avatarUrl !== undefined) {
      payload.avatar_url = updates.avatarUrl;
      // Fetch previous avatar to hard delete old file from Supabase storage
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", id)
        .maybeSingle();

      if (
        existingProfile?.avatar_url &&
        existingProfile.avatar_url !== updates.avatarUrl
      ) {
        deleteStorageFiles([existingProfile.avatar_url], "avatars").catch((err) =>
          console.warn("Failed to delete old avatar from storage:", err)
        );
      }
    }

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
 * Permanently delete a user account, storage media, and all associated data from Supabase
 * Cascades to all projects, appreciations, comments, follows, and notifications.
 */
export async function deleteUserAccountInDb(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    // 1. Purge all project media belonging to this user
    try {
      const { data: userProjects } = await supabase
        .from("projects")
        .select("cover_image, gallery_images")
        .eq("creator_id", userId);

      if (userProjects && userProjects.length > 0) {
        const mediaUrls: string[] = [];
        userProjects.forEach((p) => {
          if (p.cover_image) mediaUrls.push(p.cover_image);
          if (Array.isArray(p.gallery_images)) {
            mediaUrls.push(...p.gallery_images);
          }
        });
        if (mediaUrls.length > 0) {
          await deleteStorageFiles(mediaUrls, "project-media");
        }
      }

      // Purge avatar from avatars bucket
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (userProfile?.avatar_url) {
        await deleteStorageFiles([userProfile.avatar_url], "avatars");
      }
    } catch (storageErr) {
      console.warn("Storage purge warning during account deletion:", storageErr);
    }

    // 2. Call secure PostgreSQL RPC to purge user from auth.users and all tables
    const { error: rpcError } = await supabase.rpc("delete_user_account");

    if (rpcError) {
      console.warn("RPC delete_user_account notice (fallback to direct table delete):", rpcError.message);
      // Fallback: Explicitly hard delete all user records across all tables
      await Promise.allSettled([
        supabase.from("notifications").delete().or(`recipient_id.eq.${userId},actor_id.eq.${userId}`),
        supabase.from("follows").delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`),
        supabase.from("appreciations").delete().eq("user_id", userId),
        supabase.from("comments").delete().eq("author_id", userId),
        supabase.from("projects").delete().eq("creator_id", userId),
      ]);

      // Delete the profile record from public.profiles table
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileDeleteError) {
        console.error("Error deleting profile record from Supabase:", profileDeleteError);
        return { success: false, error: profileDeleteError.message };
      }
    }

    // 3. Invalidate application cache and sign out session
    invalidateAppCache();
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

    const redirectUrl = getAuthRedirectUrl("/settings?reset_password=true");

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

/**
 * Increment view count for a project in Supabase
 */
export async function incrementProjectViewsInDb(projectId: string): Promise<void> {
  try {
    if (!projectId) return;
    await supabase.rpc("increment_project_views", {
      p_project_id: projectId,
    });
  } catch {
    // Non-blocking view increment
  }
}

/**
 * Fetch dynamic creative disciplines & categories taxonomy from Supabase public.categories
 * Automatically falls back to FALLBACK_TAXONOMY if table does not exist or network error occurs.
 */
export async function fetchCategories(): Promise<CategoryTaxonomyItem[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_TAXONOMY;
    }

    return data.map(mapCategoryRow);
  } catch (err) {
    console.warn("Categories fetch fallback:", err);
    return FALLBACK_TAXONOMY;
  }
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: "global",
  announcementBannerText: "",
  announcementBannerLink: "",
  announcementBannerActive: false,
  allowSignups: true,
  maintenanceMode: false,
  maintenanceMessage: "Layerat is currently undergoing scheduled platform upgrades. We will be back online shortly.",
  maxUploadSizeMb: 25,
  enableCollections: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPlatformSettingsRow(row: any): PlatformSettings {
  if (!row) return DEFAULT_PLATFORM_SETTINGS;
  return {
    id: row.id || "global",
    announcementBannerText: row.announcement_banner_text || "",
    announcementBannerLink: row.announcement_banner_link || "",
    announcementBannerActive: Boolean(row.announcement_banner_active),
    allowSignups: row.allow_signups ?? true,
    maintenanceMode: Boolean(row.maintenance_mode),
    maintenanceMessage: row.maintenance_message || DEFAULT_PLATFORM_SETTINGS.maintenanceMessage,
    maxUploadSizeMb: typeof row.max_upload_size_mb === "number" ? row.max_upload_size_mb : 25,
    enableCollections: Boolean(row.enable_collections),
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch dynamic platform settings from Supabase public.platform_settings
 * Automatically falls back to DEFAULT_PLATFORM_SETTINGS if table does not exist or error occurs.
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  try {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PLATFORM_SETTINGS;
    }

    return mapPlatformSettingsRow(data);
  } catch (err) {
    console.warn("Platform settings fetch fallback:", err);
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

// =============================================================================
// COLLECTIONS (THEMATIC CURATIONS)
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCollectionRow(row: any): Collection {
  const projectIds = Array.isArray(row.project_ids) ? row.project_ids : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || "",
    coverImage: row.cover_image,
    projectIds,
    projectsCount: projectIds.length,
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch all curated collections ordered by sort_order ASC, created_at DESC
 */
export async function fetchCollections(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(mapCollectionRow);
  } catch (err) {
    console.warn("fetchCollections error:", err);
    return [];
  }
}

/**
 * Fetch a single curated collection by slug and populate its project records
 */
export async function fetchCollectionBySlug(
  slug: string
): Promise<{ collection: Collection; projects: Project[] } | null> {
  try {
    const { data: collectionRow, error } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !collectionRow) {
      return null;
    }

    const collection = mapCollectionRow(collectionRow);

    if (!collection.projectIds || collection.projectIds.length === 0) {
      return { collection, projects: [] };
    }

    // Fetch the actual project rows for these IDs
    const { data: projectsData, error: projError } = await supabase
      .from("projects")
      .select(`
        *,
        creator:profiles(*),
        appreciations:appreciations(count),
        comments:comments(*, author:profiles(*))
      `)
      .in("id", collection.projectIds)
      .eq("published", true);

    if (projError || !projectsData) {
      return { collection, projects: [] };
    }

    const mappedProjects = projectsData.map((row) => mapProjectRow(row));

    // Preserve collection's defined order
    const sortedProjects = collection.projectIds
      .map((id) => mappedProjects.find((p) => p.id === id))
      .filter((p): p is Project => Boolean(p));

    return { collection, projects: sortedProjects };
  } catch (err) {
    console.warn("fetchCollectionBySlug error:", err);
    return null;
  }
}

// =============================================================================
// CONTENT MODERATION & ABUSE REPORTS
// =============================================================================

export async function submitReportInDb(params: {
  projectId?: string;
  reportedCreatorId?: string;
  reason: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const reporterId = authData.user?.id || null;

    const { error } = await supabase.from("reports").insert({
      reporter_id: reporterId,
      project_id: params.projectId || null,
      reported_creator_id: params.reportedCreatorId || null,
      reason: params.reason,
      notes: params.notes || "",
      status: "pending",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit report",
    };
  }
}

// =============================================================================
// LEGAL & POLICY DOCUMENTS (DYNAMIC TERMS, PRIVACY & GUIDELINES)
// =============================================================================

export const DEFAULT_LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms: {
    id: "terms",
    title: "Terms of Use",
    subtitle: "Legal Agreement",
    version: "2026.1",
    summary: "By publishing or browsing on Layerat, you enter into a binding agreement protecting your original intellectual property and ensuring respectful peer interactions.",
    isPublished: true,
    publishedAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
    sections: [
      {
        title: "1. Ownership & Original Creative Authorship",
        content: "You retain 100% ownership, copyright, and moral rights to all creative monographs, images, case studies, and assets you publish on Layerat. We never claim ownership of your work. By uploading, you grant Layerat a non-exclusive, worldwide license solely to display, format, and distribute your work across the platform.",
        bullets: [
          "Layerat does not sell, sublicense, or license your portfolio works to third parties.",
          "Your work will never be utilized to train proprietary generative AI visual models without your explicit, opt-in written consent.",
          "You affirm that you hold all necessary copyrights or studio permissions for works published under your profile."
        ]
      },
      {
        title: "2. Creator Accounts & Session Security",
        content: "You are responsible for safeguarding your account credentials. You agree to provide accurate identification and maintain truthful attribution for all studio collaborations.",
        bullets: [
          "One account per creator or registered design agency.",
          "Impersonation of existing designers, studios, or brands is strictly prohibited and results in immediate account suspension.",
          "You are liable for all actions taken under your authenticated session."
        ]
      },
      {
        title: "3. Platform Conduct & Prohibited Practices",
        content: "Layerat is designed as a sanctuary for serious visual craft. We maintain zero tolerance for abuse, plagiarism, or malicious activity.",
        bullets: [
          "No uploading of stolen case studies, uncredited derivative templates, or deceptive portfolio entries.",
          "No automated scraping, botting of appreciations, artificial view inflation, or commercial spam in critiques.",
          "No harassment, hate speech, defamation, or graphic illegal content."
        ]
      },
      {
        title: "4. Content Moderation & Takedown Notices",
        content: "We respect the intellectual property rights of all artists. If you believe your copyrighted work has been copied in a manner that constitutes infringement, you may submit a report through our in-platform moderation reporting tool or contact our legal team.",
        bullets: [
          "We review and take action on verified copyright notices promptly.",
          "Repeat infringers will have their accounts permanently terminated.",
          "False or bad-faith takedown notices may incur legal liability."
        ]
      },
      {
        title: "5. Limitation of Liability & Warranties",
        content: "Layerat is provided on an as-is and as-available basis. While we strive for 99.99% uptime and bulletproof data persistence, we do not warrant that the service will be uninterrupted or error-free. Under no circumstances will Layerat be liable for indirect, incidental, or consequential damages arising from platform usage."
      }
    ]
  },
  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "Privacy & Security",
    version: "2026.1",
    summary: "Layerat is built on a zero data-selling pledge. We only collect the minimal session information required to render your portfolio and provide a high-signal discovery experience.",
    isPublished: true,
    publishedAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
    sections: [
      {
        title: "1. Zero Data-Selling Guarantee",
        content: "We have never sold, rented, or monetized your personal information, contact details, or portfolio metrics to third-party data brokers or advertising networks. Our business model is aligned entirely with supporting creators, not harvesting user attention.",
        bullets: [
          "No tracking pixels or third-party behavioral advertising scripts.",
          "No data bundling for external programmatic ad auctions.",
          "Your email address is confidential and never displayed publicly unless you explicitly add it to your bio."
        ]
      },
      {
        title: "2. What Information We Collect",
        content: "We collect only the essential information necessary to maintain your authenticated session and display your public studio profile.",
        bullets: [
          "Account Data: Email address, encrypted authentication tokens, username, display name, and avatar.",
          "Profile Metadata: Bio, location, city, website link, and creative skill tags provided voluntarily by you.",
          "Publishing Data: Project monographs, gallery images, descriptions, categories, software tags, and associated metrics.",
          "Technical Diagnostics: Anonymized request logs, response latency, and error traces to maintain platform health and uptime."
        ]
      },
      {
        title: "3. Storage & Cryptographic Security",
        content: "All data in transit is encrypted via TLS 1.3. User authentication is governed by Supabase Auth with bcrypt password hashing and secure HTTP-only session cookies. Sensitive database records are protected by PostgreSQL Row Level Security (RLS) policies enforcing cryptographic ownership checks.",
        bullets: [
          "Media assets stored on enterprise CDN with global edge caching.",
          "Automated continuous database backups with point-in-time recovery.",
          "Strict principle of least privilege across internal infrastructure."
        ]
      },
      {
        title: "4. Cookies & Local Session Storage",
        content: "Layerat uses functional cookies and browser storage strictly to keep you signed in, remember your dark/light theme preference, and cache dismissible system banners.",
        bullets: [
          "Essential Cookies: Authentication session and CSRF mitigation.",
          "Preference Storage: Theme mode (light/dark) and dismissal tokens for announcements.",
          "No third-party cross-site tracking cookies."
        ]
      },
      {
        title: "5. Your Rights: Export & Total Account Deletion",
        content: "You have full control over your digital footprint. Under GDPR, CCPA, and global privacy standards, you have the right to inspect, export, or permanently delete your account and all associated portfolio data.",
        bullets: [
          "Instant self-service account deletion available directly in Settings.",
          "Upon deletion, all projects, appreciation records, comments, and uploaded storage files are permanently erased from our production database."
        ]
      }
    ]
  },
  guidelines: {
    id: "guidelines",
    title: "Community Guidelines",
    subtitle: "Peer & Curation Standards",
    version: "2026.1",
    summary: "Layerat is a sanctuary for thoughtful creative craft. These standards outline our expectations for original authorship, constructive critique, and professional integrity.",
    isPublished: true,
    publishedAt: "2026-08-31T00:00:00.000Z",
    updatedAt: "2026-08-31T00:00:00.000Z",
    sections: [
      {
        title: "1. Authentic Authorship & Creative Integrity",
        content: "Publish only work that you created, art directed, or contributed to meaningfully. Layerat celebrates genuine craft over volume.",
        bullets: [
          "Always credit collaborators, creative directors, photographers, and studios involved in the project.",
          "Commercial agency client work must have proper client release authorization.",
          "Template repackaging or posting generic stock graphics as original case studies is not permitted."
        ]
      },
      {
        title: "2. Thoughtful Peer Critique & Discourse",
        content: "Feedback on Layerat should elevate the craft. When commenting on another designer's monograph, offer actionable, constructive critique.",
        bullets: [
          "Focus feedback on typography, layout hierarchy, ergonomics, interaction, and conceptual execution.",
          "No generic copy-paste spam or solicitation (e.g. follow-for-follow, check my profile).",
          "Disagreements must remain professional, respectful, and focused on the work, never personal attacks."
        ]
      },
      {
        title: "3. Curation Standards for Curated Collections",
        content: "Projects featured on the homepage, in category showcases, or in editorial collections are chosen based on execution quality and storytelling completeness.",
        bullets: [
          "High-resolution cover imagery without compression artifacts or cluttered watermarks.",
          "Comprehensive monographs with process insights, typography specimens, or interface walkthroughs.",
          "Correct categorization into one of Layerat's 13 canonical design disciplines."
        ]
      },
      {
        title: "4. Zero Tolerance for Harassment & Discrimination",
        content: "Layerat is an inclusive global creative network. Discrimination, hate speech, targeted harassment, or exclusionary conduct based on race, gender, nationality, sexual orientation, disability, or religion will result in immediate and permanent account removal."
      },
      {
        title: "5. Enforcement & Community Reporting",
        content: "Our moderation team actively monitors flags submitted through the in-platform reporting system. Violations may result in formal warnings, project unpublishing, or permanent account revocation depending on severity."
      }
    ]
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLegalDocumentRow(row: any): LegalDocument {
  const rawSections = Array.isArray(row.sections) ? row.sections : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections: LegalSection[] = rawSections.map((s: any) => ({
    title: s.title || "",
    content: s.content || "",
    bullets: Array.isArray(s.bullets) ? s.bullets : undefined,
  }));

  return {
    id: row.id,
    title: row.title || "",
    subtitle: row.subtitle || "",
    version: row.version || "1.0",
    summary: row.summary || "",
    sections,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.published_at || new Date().toISOString(),
  };
}

/**
 * Fetch a legal/policy document from public.legal_documents by ID.
 * Falls back to DEFAULT_LEGAL_DOCUMENTS if the database row does not exist.
 */
export async function fetchLegalDocument(
  id: "terms" | "privacy" | "guidelines" | string
): Promise<LegalDocument> {
  try {
    const { data, error } = await supabase
      .from("legal_documents")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_LEGAL_DOCUMENTS[id] || {
        id,
        title: id,
        subtitle: "Policy Document",
        version: "1.0",
        summary: "",
        sections: [],
        isPublished: true,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return mapLegalDocumentRow(data);
  } catch (err) {
    console.warn(`fetchLegalDocument error for ${id}:`, err);
    return DEFAULT_LEGAL_DOCUMENTS[id];
  }
}






