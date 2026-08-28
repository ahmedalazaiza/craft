export const DEFAULT_AVATAR_URL = "/default-avatar.svg";

/**
 * Returns a valid avatar URL or falls back to the minimalist default avatar.
 */
export function getValidAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl || !avatarUrl.trim()) {
    return DEFAULT_AVATAR_URL;
  }
  return avatarUrl.trim();
}
