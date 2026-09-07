export const DEFAULT_AVATAR_URL = "/default-avatar.svg";

/**
 * Extracts 1-2 initials from a display name or username.
 * e.g., "Ahmed Alazaiza" -> "AA", "John Doe" -> "JD", "Layerat" -> "LA"
 */
export function getInitials(name?: string | null, fallback: string = ""): string {
  if (!name || !name.trim()) return fallback;
  const clean = name.trim().replace(/^@/, "");
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Upgrades Google OAuth avatar URLs from the default low-res 96x96 thumbnail (=s96-c)
 * to crystal-clear high-definition (e.g. =s400-c).
 * Google's CDN dynamically generates the requested resolution on the fly.
 */
export function upgradeGoogleAvatarUrl(url?: string | null, size: number = 400): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed.includes("googleusercontent.com")) return trimmed;

  // Pattern 1: =s96-c or =s96 or =s96-c-k-no query/suffix parameter
  if (/=s\d+/i.test(trimmed)) {
    return trimmed.replace(/=s\d+.*$/i, `=s${size}-c`);
  }

  // Pattern 2: /s96-c/ path segment pattern
  if (/\/s\d+(-[a-z0-9-]+)*\//i.test(trimmed)) {
    return trimmed.replace(/\/s\d+(-[a-z0-9-]+)*\//i, `/s${size}-c/`);
  }

  // Pattern 3: Bare Google usercontent URL without sizing parameter
  if (!trimmed.includes("?") && !trimmed.includes("=")) {
    return `${trimmed}=s${size}-c`;
  }

  return trimmed;
}

/**
 * Returns a valid avatar URL or falls back to the minimalist default avatar.
 * Automatically upscales low-res Google OAuth avatars to high resolution.
 */
export function getValidAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl || !avatarUrl.trim()) {
    return DEFAULT_AVATAR_URL;
  }
  const cleanUrl = avatarUrl.trim();
  return upgradeGoogleAvatarUrl(cleanUrl, 400);
}

