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
 * Returns a valid avatar URL or falls back to the minimalist default avatar.
 */
export function getValidAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl || !avatarUrl.trim()) {
    return DEFAULT_AVATAR_URL;
  }
  return avatarUrl.trim();
}
