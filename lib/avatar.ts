export const DEFAULT_AVATAR_URL = "/default-avatar.svg";

/**
 * Returns a valid avatar URL or falls back to the minimalist default avatar.
 */
export function getValidAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl || !avatarUrl.trim()) {
    return DEFAULT_AVATAR_URL;
  }
  const clean = avatarUrl.trim();
  if (clean === "/avatars/ahmed.png") {
    return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80";
  }
  if (clean === "/avatars/ameera.png") {
    return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80";
  }
  return clean;
}
