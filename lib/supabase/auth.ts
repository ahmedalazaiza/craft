import { supabase } from "./client";
import { Creator } from "@/lib/mock";
import { mapProfileToCreator } from "./queries";

export interface AuthResponse {
  success: boolean;
  user?: Creator;
  error?: string;
}

/**
 * Sign up a new user with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  username?: string
): Promise<AuthResponse> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();
    const cleanUsername = (username || cleanDisplayName.toLowerCase().replace(/[^a-z0-9_]/g, "")).trim();

    // 1. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          display_name: cleanDisplayName,
          username: cleanUsername,
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
      username: cleanUsername,
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
