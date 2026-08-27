import { supabase } from "./client";
import { Project, Creator, Comment, mockProjects, mockUsers } from "@/lib/mock";

// =============================================================================
// TYPE MAPPERS
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileToCreator(row: any): Creator {
  if (!row) {
    return mockUsers[0];
  }
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    bio: row.bio || "",
    location: row.location || "",
    city: row.city || row.location || "",
    website: row.website || undefined,
    skills: row.skills || [],
    isVerified: Boolean(row.is_verified),
    isOnline: row.is_online ?? false,
    followersCount: row.followers_count ?? 0,
    isCurrentUser: row.username === "elena_v",
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
export function mapProjectRow(row: any): Project {
  const creator = mapProfileToCreator(row.creator || row.profiles);
  const comments = Array.isArray(row.comments)
    ? row.comments.map(mapCommentRow)
    : [];

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
    medium: row.medium,
    published: row.published ?? true,
    publishedAt: formatTimeAgo(new Date(row.published_at || row.created_at || Date.now())),
    appreciations: row.appreciations_count ?? 0,
    comments,
    featured: row.featured ?? false,
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
// DATABASE QUERIES
// =============================================================================

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
 * Fetch all projects from Supabase with relations
 */
export async function fetchProjects(options: FetchProjectsOptions = {}): Promise<Project[]> {
  try {
    let query = supabase
      .from("projects")
      .select(`
        *,
        creator:profiles!creator_id(*),
        comments(*, author:profiles!author_id(*))
      `);

    if (options.publishedOnly !== false) {
      query = query.eq("published", true);
    }

    if (options.category && options.category !== "All") {
      query = query.eq("category", options.category);
    }

    if (options.medium) {
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

    if (error || !data || data.length === 0) {
      // Return local fallback if Supabase table is not yet seeded
      return filterLocalProjects(mockProjects, options);
    }

    let projects = data.map(mapProjectRow);

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

    return projects;
  } catch (err) {
    console.error("Error fetching projects from Supabase:", err);
    return filterLocalProjects(mockProjects, options);
  }
}

function filterLocalProjects(list: Project[], options: FetchProjectsOptions): Project[] {
  let result = [...list];
  if (options.publishedOnly !== false) {
    result = result.filter((p) => p.published);
  }
  if (options.category && options.category !== "All") {
    result = result.filter((p) => p.category === options.category);
  }
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.creator.displayName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (options.sort === "appreciated") {
    result.sort((a, b) => b.appreciations - a.appreciations);
  } else {
    result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
  return result;
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
        comments(*, author:profiles!author_id(*))
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      const fallback = mockProjects.find((p) => p.slug === slug);
      return fallback || null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with slug '${slug}':`, err);
    return mockProjects.find((p) => p.slug === slug) || null;
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
        comments(*, author:profiles!author_id(*))
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const fallback = mockProjects.find((p) => p.id === id);
      return fallback || null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error(`Error fetching project with id '${id}':`, err);
    return mockProjects.find((p) => p.id === id) || null;
  }
}

/**
 * Fetch all creators from Supabase
 */
export async function fetchCreators(): Promise<Creator[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("followers_count", { ascending: false });

    if (error || !data || data.length === 0) {
      return mockUsers;
    }

    return data.map(mapProfileToCreator);
  } catch (err) {
    console.error("Error fetching creators from Supabase:", err);
    return mockUsers;
  }
}

/**
 * Fetch a single creator by username
 */
export async function fetchCreatorByUsername(username: string): Promise<Creator | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      return mockUsers.find((u) => u.username === username) || null;
    }

    return mapProfileToCreator(data);
  } catch (err) {
    console.error(`Error fetching creator '@${username}':`, err);
    return mockUsers.find((u) => u.username === username) || null;
  }
}

/**
 * Create a new project in Supabase
 */
export async function insertProject(project: Partial<Project> & { creatorId: string }): Promise<Project | null> {
  try {
    const row = {
      slug: project.slug || `project-${Date.now()}`,
      title: project.title,
      summary: project.summary || "",
      body: project.body || "",
      cover_image: project.coverImage,
      gallery_images: project.galleryImages || [project.coverImage],
      category: project.category || "UI",
      medium: project.medium || "Image",
      tags: project.tags || [],
      tools: project.tools || [],
      published: project.published ?? true,
      featured: project.featured ?? false,
      creator_id: project.creatorId,
      appreciations_count: 0,
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects")
      .insert(row)
      .select(`
        *,
        creator:profiles!creator_id(*)
      `)
      .single();

    if (error) {
      console.error("Error inserting project into Supabase:", error);
      return null;
    }

    return mapProjectRow(data);
  } catch (err) {
    console.error("Error inserting project:", err);
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
      return false;
    } else {
      // Add appreciation
      await supabase.from("appreciations").insert({ project_id: projectId, user_id: userId });
      return true;
    }
  } catch (err) {
    console.error("Error toggling appreciation:", err);
    return false;
  }
}

/**
 * Update creator profile
 */
export async function updateProfileInDb(id: string, updates: Partial<Creator>): Promise<boolean> {
  try {
    const payload: Record<string, unknown> = {};
    if (updates.displayName !== undefined) payload.display_name = updates.displayName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.skills !== undefined) payload.skills = updates.skills;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);

    return !error;
  } catch (err) {
    console.error("Error updating profile in Supabase:", err);
    return false;
  }
}

/**
 * Fetch list of creator IDs that a user follows
 */
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
 * Toggle follow status between two creators in Supabase
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

      // Decrement followers_count on following creator
      const { data: profile } = await supabase
        .from("profiles")
        .select("followers_count")
        .eq("id", followingId)
        .maybeSingle();

      if (profile) {
        const currentCount = profile.followers_count ?? 0;
        await supabase
          .from("profiles")
          .update({ followers_count: Math.max(0, currentCount - 1) })
          .eq("id", followingId);
      }
      return false; // Not following anymore
    } else {
      // Follow: insert row
      await supabase.from("follows").insert({
        follower_id: followerId,
        following_id: followingId,
      });

      // Increment followers_count on following creator
      const { data: profile } = await supabase
        .from("profiles")
        .select("followers_count")
        .eq("id", followingId)
        .maybeSingle();

      if (profile) {
        const currentCount = profile.followers_count ?? 0;
        await supabase
          .from("profiles")
          .update({ followers_count: currentCount + 1 })
          .eq("id", followingId);
      }
      return true; // Now following
    }
  } catch (err) {
    console.error("Error toggling follow in Supabase:", err);
    return false;
  }
}
