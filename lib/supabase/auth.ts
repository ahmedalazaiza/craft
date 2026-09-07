import { supabase } from "./client";
import { Creator } from "@/lib/types";
import { mapProfileToCreator } from "./queries";
import { DEFAULT_AVATAR_URL, upgradeGoogleAvatarUrl } from "@/lib/avatar";
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
  email?: string
): Promise<string> {
  const baseCandidate =
    slugifyUsername(displayName) ||
    (email ? slugifyUsername(email.split("@")[0]) : "") ||
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

    let authUser = authData?.user;

    // If user already exists in auth.users (e.g. administrative dashboard user),
    // check if they don't yet have a public.profiles creator profile on Layerat!
    const isAlreadyRegistered =
      authError?.message?.toLowerCase().includes("already registered") ||
      authError?.message?.toLowerCase().includes("already exists") ||
      Boolean(authUser?.identities && authUser.identities.length === 0);

    if (isAlreadyRegistered) {
      // Verify credentials by attempting to sign in with the provided password
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (signInErr || !signInData.user) {
        return {
          success: false,
          error:
            "An account with this email address already exists. If you own this account, please enter the correct password to initialize your designer profile.",
        };
      }

      // Check if they already have a creator profile
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", signInData.user.id)
        .maybeSingle();

      if (existingProfile) {
        return {
          success: false,
          error: "A creator account with this email already exists on Layerat. Please log in directly.",
        };
      }

      authUser = signInData.user;
    } else if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authUser) {
      return { success: false, error: "Failed to create user account." };
    }

    const isEmailConfirmed = Boolean(authUser.email_confirmed_at);

    // 2. Ensure profile exists in public.profiles table
    const profileRow = {
      id: authUser.id,
      username: finalUsername,
      display_name: cleanDisplayName,
      email: cleanEmail,
      avatar_url: DEFAULT_AVATAR_URL,
      bio: "",
      location: "Worldwide",
      city: "Global",
      skills: [],
      is_verified: isEmailConfirmed,
      followers_count: 0,
      auth_provider: "email",
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

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("craft_cached_profile", JSON.stringify(creator));
        localStorage.setItem("craft_last_registered_email", cleanEmail);
        sessionStorage.removeItem("layerat_session_terminated");
      } catch {
        // ignore storage errors
      }
    }

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
    if (!profileData) {
      // User is authenticated in Supabase Auth (e.g. administrative dashboard user),
      // but has NOT registered as a creator on the Layerat public platform.
      // Strictly maintain total separation: Do NOT auto-create a creator profile!
      await supabase.auth.signOut().catch(() => {});
      return {
        success: false,
        error:
          "No creator profile found on Layerat with this email. If this is an administrative account, please Sign Up on Layerat to initialize your designer profile.",
      };
    }

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
    // 1. Verify authenticated user with Supabase Auth server
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user ?? null;

    if (user && !userErr) {
      const isEmailConfirmed = Boolean(user.email_confirmed_at);

      // 2. Query public.profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.is_suspended) {
          await supabase.auth.signOut().catch(() => {});
          if (typeof window !== "undefined") {
            localStorage.removeItem("craft_cached_profile");
            sessionStorage.setItem("layerat_session_terminated", "account_deleted");
          }
          return null;
        }

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

      // Check if user is an authentic Google user whose profile initialization was interrupted
      const isGoogleUser =
        user.app_metadata?.provider === "google" ||
        user.app_metadata?.providers?.includes("google") ||
        Boolean(user.user_metadata?.picture || user.user_metadata?.avatar_url);

      if (isGoogleUser) {
        try {
          const email = user.email?.trim().toLowerCase() || "";
          const fullName =
            user.user_metadata?.full_name?.trim() ||
            user.user_metadata?.name?.trim() ||
            (email ? email.split("@")[0] : "Creator");
          const rawAvatarUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            DEFAULT_AVATAR_URL;
          const avatarUrl = upgradeGoogleAvatarUrl(rawAvatarUrl, 400);
          const uniqueUsername = await generateUniqueUsername(fullName, email);

          const autoProfile = {
            id: user.id,
            username: uniqueUsername,
            display_name: fullName,
            email: email,
            avatar_url: avatarUrl,
            bio: "",
            location: "Worldwide",
            city: "Global",
            skills: [],
            is_online: false,
            is_verified: true,
            auth_provider: "google",
            followers_count: 0,
          };

          const { data: createdProfile } = await supabase
            .from("profiles")
            .upsert(autoProfile, { onConflict: "id" })
            .select("*")
            .maybeSingle();

          if (createdProfile) {
            const creator = mapProfileToCreator(createdProfile);
            creator.isCurrentUser = true;
            creator.email = email;
            creator.isVerified = true;
            return creator;
          }
        } catch (e) {
          console.warn("Could not auto-create Google profile fallback:", e);
        }
      }

      // IF PROFILE DOES NOT EXIST IN DATABASE:
      // The account was deleted by administration or self-purged.
      console.warn("Current user profile does not exist in database (deleted). Terminating local session.");
      await supabase.auth.signOut().catch(() => {});
      if (typeof window !== "undefined") {
        localStorage.removeItem("craft_cached_profile");
        sessionStorage.setItem("layerat_session_terminated", "account_deleted");
      }
      return null;
    }

    // 3. If no active Supabase Auth session token (e.g. newly registered user awaiting email confirmation):
    // Check if there is a cached profile in localStorage that exists in the database
    if (typeof window !== "undefined") {
      const cachedRaw = localStorage.getItem("craft_cached_profile");
      if (cachedRaw) {
        try {
          const cachedUser = JSON.parse(cachedRaw);
          if (cachedUser && cachedUser.id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", cachedUser.id)
              .maybeSingle();

            if (profile) {
              if (profile.is_suspended) {
                localStorage.removeItem("craft_cached_profile");
                sessionStorage.setItem("layerat_session_terminated", "account_deleted");
                return null;
              }

              const creator = mapProfileToCreator(profile);
              creator.isCurrentUser = true;
              creator.email = cachedUser.email || profile.email;
              creator.isVerified = Boolean(profile.is_verified);
              return creator;
            } else {
              // Profile record was genuinely deleted from the database
              localStorage.removeItem("craft_cached_profile");
              sessionStorage.setItem("layerat_session_terminated", "account_deleted");
              return null;
            }
          }
        } catch {
          localStorage.removeItem("craft_cached_profile");
        }
      }
    }

    return null;
  } catch (err) {
    console.warn("Notice getting current auth user:", err);
    return null;
  }
}

/**
 * Sign in or sign up with Google OAuth
 */
export async function signInWithGoogle(redirectPath: string = "/"): Promise<{ error?: string }> {
  try {
    const callbackUrl = getAuthRedirectUrl(`/auth/callback?redirect=${encodeURIComponent(redirectPath)}`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to initiate Google sign in.";
    return { error: errorMsg };
  }
}
