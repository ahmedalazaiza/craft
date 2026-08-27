import { supabase } from "./client";
import { Creator } from "@/lib/mock";
import { mapProfileToCreator } from "./queries";

export interface AuthResponse {
  success: boolean;
  user?: Creator;
  error?: string;
}

/**
 * Generate a guaranteed unique username based on full name and email
 */
export async function generateUniqueUsername(displayName: string, email: string): Promise<string> {
  // 1. Derive base slug from Display Name or Email
  let base = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  if (!base || base.length < 2) {
    const emailPrefix = email.split("@")[0] || "creator";
    base = emailPrefix
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  // Ensure base length is within bounds (max 16 chars)
  base = base.slice(0, 16) || "creator";

  // 2. Check existence against Supabase profiles table
  try {
    const { data: existingProfiles } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", `${base}%`);

    if (!existingProfiles || existingProfiles.length === 0) {
      return base;
    }

    const takenUsernames = new Set(
      existingProfiles.map((p) => (p.username || "").toLowerCase())
    );

    if (!takenUsernames.has(base.toLowerCase())) {
      return base;
    }

    // Try suffixes _1, _2, ...
    for (let i = 1; i <= 50; i++) {
      const candidate = `${base}_${i}`;
      if (!takenUsernames.has(candidate.toLowerCase())) {
        return candidate;
      }
    }

    // If all sequential slots are occupied, append 3 random digits
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${base}_${randomSuffix}`;
  } catch (err) {
    console.warn("Could not query profiles for username collision check:", err);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${base}_${randomSuffix}`;
  }
}

/**
 * Sign up a new user with Email and Password
 * Username is automatically generated and guaranteed unique!
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  customUsername?: string
): Promise<AuthResponse> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    // Generate unique username automatically if not provided or to ensure uniqueness
    let finalUsername = customUsername?.trim();
    if (!finalUsername) {
      finalUsername = await generateUniqueUsername(cleanDisplayName, cleanEmail);
    } else {
      // Clean custom username and verify uniqueness
      finalUsername = finalUsername.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const { data: collision } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", finalUsername)
        .maybeSingle();

      if (collision) {
        finalUsername = await generateUniqueUsername(cleanDisplayName, cleanEmail);
      }
    }

    // 1. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          display_name: cleanDisplayName,
          username: finalUsername,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { success: false, error: "Failed to create user account." };
    }

    // 2. Ensure profile exists in public.profiles table
    const profileRow = {
      id: authUser.id,
      username: finalUsername,
      display_name: cleanDisplayName,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
      bio: "Independent designer & creative practitioner.",
      location: "Worldwide",
      city: "Global",
      skills: ["Design", "Art Direction"],
      is_verified: false,
      is_online: true,
      followers_count: 0,
    };

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert(profileRow)
      .select("*")
      .single();

    if (profileError && !profileData) {
      console.warn("Profile upsert warning:", profileError.message);
    }

    const creator = mapProfileToCreator(profileData || profileRow);
    creator.isCurrentUser = true;

    return {
      success: true,
      user: creator,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during signup.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign in existing user with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { success: false, error: "User session could not be established." };
    }

    // 2. Fetch profile from public.profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    let creator: Creator;
    if (profileData) {
      creator = mapProfileToCreator(profileData);
    } else {
      // Create fallback profile if not found
      const fallbackUsername = authUser.user_metadata?.username || authUser.email?.split("@")[0] || "creator";
      const fallbackName = authUser.user_metadata?.display_name || authUser.email?.split("@")[0] || "Creator";
      creator = {
        id: authUser.id,
        username: fallbackUsername,
        displayName: fallbackName,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
        bio: "Independent designer & creative practitioner.",
        location: "Worldwide",
        city: "Global",
        skills: ["Design"],
        isVerified: false,
        isOnline: true,
        followersCount: 0,
        isCurrentUser: true,
      };

      // Create in db
      await supabase.from("profiles").upsert({
        id: authUser.id,
        username: fallbackUsername,
        display_name: fallbackName,
        is_verified: false,
        is_online: true,
      });
    }

    creator.isCurrentUser = true;

    return {
      success: true,
      user: creator,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during login.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to sign out.";
    return { success: false, error: errorMsg };
  }
}

/**
 * Get current authenticated user and profile
 */
export async function getCurrentAuthUser(): Promise<Creator | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      const creator = mapProfileToCreator(profile);
      creator.isCurrentUser = true;
      return creator;
    }

    const fallbackUsername = user.user_metadata?.username || user.email?.split("@")[0] || "creator";
    const fallbackName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Creator";
    return {
      id: user.id,
      username: fallbackUsername,
      displayName: fallbackName,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`,
      bio: "Independent designer & creative practitioner.",
      location: "Worldwide",
      city: "Global",
      skills: ["Design"],
      isVerified: false,
      isOnline: true,
      followersCount: 0,
      isCurrentUser: true,
    };
  } catch (err) {
    console.error("Error getting current auth user:", err);
    return null;
  }
}
