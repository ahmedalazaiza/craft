import { supabase } from "./client";
import { Creator } from "@/lib/types";
import { mapProfileToCreator } from "./queries";
import { DEFAULT_AVATAR_URL } from "@/lib/avatar";
import { getAuthRedirectUrl } from "@/lib/seo";

export { getAuthRedirectUrl };


export interface AuthResponse {
  success: boolean;
  user?: Creator;
  error?: string;
}

/**
 * Clean and normalize username candidate string
 */
export function slugifyUsername(raw: string): string {
  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized.length > 0 ? normalized : "creator";
}

/**
 * Generate a guaranteed unique username by checking Supabase profiles table
 */
export async function generateUniqueUsername(
  displayName: string,
  email: string
): Promise<string> {
  const baseCandidate =
    slugifyUsername(displayName) ||
    slugifyUsername(email.split("@")[0]) ||
    "creator";

  try {
    // 1. Check if baseCandidate itself is completely free
    const { data: directMatch } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", baseCandidate)
      .maybeSingle();

    if (!directMatch) {
      return baseCandidate;
    }

    // 2. Find all existing matching prefixes to guarantee unique sequential suffix
    const { data: existing, error } = await supabase
      .from("profiles")
      .select("username")
      .ilike("username", `${baseCandidate}%`);

    if (error || !existing || existing.length === 0) {
      return `${baseCandidate}_1`;
    }

    const takenUsernames = new Set(
      existing.map((row) => (row.username as string).toLowerCase())
    );

    let counter = 1;
    while (takenUsernames.has(`${baseCandidate}_${counter}`.toLowerCase())) {
      counter++;
    }

    return `${baseCandidate}_${counter}`;
  } catch (err) {
    console.error("Error generating unique username:", err);
    return `${baseCandidate}_${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

/**
 * Sign up a new user with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  customUsername?: string
): Promise<AuthResponse> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim() || cleanEmail.split("@")[0];

    // Determine unique username
    let finalUsername = "";
    if (customUsername && customUsername.trim()) {
      finalUsername = slugifyUsername(customUsername);
    } else {
      finalUsername = await generateUniqueUsername(cleanDisplayName, cleanEmail);
    }

    // Verify uniqueness of finalUsername
    const { data: collisionCheck } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", finalUsername)
      .maybeSingle();

    if (collisionCheck) {
      finalUsername = await generateUniqueUsername(cleanDisplayName, cleanEmail);
    }

    // 1. Supabase Auth Sign Up with explicit redirect to /auth/verify
    const redirectUrl = getAuthRedirectUrl("/auth/verify");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        emailRedirectTo: redirectUrl,
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

    // In Supabase, if email confirmation is enabled and the user is already registered, identities is []
    if (authUser.identities && authUser.identities.length === 0) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in or reset your password.",
      };
    }

    const isEmailConfirmed = Boolean(authUser.email_confirmed_at);

    // 2. Ensure profile exists in public.profiles table
    const profileRow = {
      id: authUser.id,
      username: finalUsername,
      display_name: cleanDisplayName,
      avatar_url: DEFAULT_AVATAR_URL,
      bio: "",
      location: "Worldwide",
      city: "Global",
      skills: [],
      is_verified: isEmailConfirmed,
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
    creator.email = cleanEmail;
    creator.isVerified = isEmailConfirmed;

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

    // 1. Supabase Auth Sign In
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

    const isEmailConfirmed = Boolean(authUser.email_confirmed_at);

    // 2. Fetch profile from public.profiles table
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    let creator: Creator;
    if (profileData) {
      creator = mapProfileToCreator(profileData);
      if (isEmailConfirmed || profileData.is_verified) {
        creator.isVerified = true;
        // Sync database if it wasn't marked verified yet
        if (!profileData.is_verified) {
          supabase.from("profiles").update({ is_verified: true }).eq("id", authUser.id).then();
        }
      } else {
        creator.isVerified = false;
      }
    } else {
      // Create fallback profile if not found
      const fallbackUsername = authUser.user_metadata?.username || authUser.email?.split("@")[0] || "creator";
      const fallbackName = authUser.user_metadata?.display_name || authUser.email?.split("@")[0] || "Creator";
      creator = {
        id: authUser.id,
        username: fallbackUsername,
        displayName: fallbackName,
        email: cleanEmail,
        avatarUrl: DEFAULT_AVATAR_URL,
        bio: "Independent designer & creative practitioner.",
        location: "Worldwide",
        city: "Global",
        skills: ["Design"],
        isVerified: isEmailConfirmed,
        followersCount: 0,
        isCurrentUser: true,
      };

      // Create in db
      await supabase.from("profiles").upsert({
        id: authUser.id,
        username: fallbackUsername,
        display_name: fallbackName,
        is_verified: isEmailConfirmed,
      });
    }

    creator.isCurrentUser = true;
    creator.email = cleanEmail;

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
    // 1. Ensure stored session is loaded and automatically refreshed if expired
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user ?? null;

    // 2. Fallback to getUser() if session has not finished resolving
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user ?? null;
    }

    if (!user) {
      return null;
    }

    const isEmailConfirmed = Boolean(user.email_confirmed_at);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      const creator = mapProfileToCreator(profile);
      creator.isCurrentUser = true;
      creator.email = user.email;
      if (isEmailConfirmed || profile.is_verified) {
        creator.isVerified = true;
        // Sync database if it wasn't marked verified yet
        if (!profile.is_verified) {
          supabase.from("profiles").update({ is_verified: true }).eq("id", user.id).then();
        }
      } else {
        creator.isVerified = false;
      }
      return creator;
    }

    const fallbackUsername = user.user_metadata?.username || user.email?.split("@")[0] || "creator";
    const fallbackName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Creator";
    
    const newProfileRow = {
      id: user.id,
      username: fallbackUsername,
      display_name: fallbackName,
      avatar_url: DEFAULT_AVATAR_URL,
      bio: "Independent designer & creative practitioner.",
      location: "Worldwide",
      city: "Global",
      skills: ["Design"],
      is_verified: isEmailConfirmed,
      followers_count: 0,
    };

    // Auto-create in public.profiles
    await supabase.from("profiles").upsert(newProfileRow);

    return {
      id: user.id,
      username: fallbackUsername,
      displayName: fallbackName,
      email: user.email,
      avatarUrl: newProfileRow.avatar_url,
      bio: newProfileRow.bio,
      location: newProfileRow.location,
      city: newProfileRow.city,
      skills: newProfileRow.skills,
      isVerified: isEmailConfirmed,
      followersCount: 0,
      isCurrentUser: true,
    };
  } catch (err) {
    console.warn("Notice getting current auth user:", err);
    return null;
  }
}
