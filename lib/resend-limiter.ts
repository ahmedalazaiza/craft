import { supabase } from "./supabase/client";

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes window
const MAX_ATTEMPTS = 3; // Max 3 resends per 5 minutes
const MIN_INTERVAL_MS = 60 * 1000; // 60s cooldown between consecutive clicks

interface LimiterStatus {
  canResend: boolean;
  remainingCooldownSeconds: number;
  attemptsLeft: number;
  message?: string;
}

function getStorageKey(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  return `craft_resend_attempts_${cleanEmail}`;
}

function getStoredTimestamps(email: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(email));
    if (!raw) return [];
    const parsed: number[] = JSON.parse(raw);
    const now = Date.now();
    // Filter timestamps within the 5-minute rolling window
    return parsed.filter((t) => now - t < WINDOW_MS);
  } catch {
    return [];
  }
}

function saveTimestamps(email: string, timestamps: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(email), JSON.stringify(timestamps));
  } catch {
    // ignore
  }
}

/**
 * Check if the user is allowed to resend verification email right now
 */
export function getResendStatus(email: string): LimiterStatus {
  if (!email) {
    return {
      canResend: false,
      remainingCooldownSeconds: 0,
      attemptsLeft: 0,
      message: "No email specified",
    };
  }

  const timestamps = getStoredTimestamps(email);
  const now = Date.now();
  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - validTimestamps.length);

  if (validTimestamps.length >= MAX_ATTEMPTS) {
    const oldest = validTimestamps[0];
    const msUntilExpiry = WINDOW_MS - (now - oldest);
    const remainingSeconds = Math.ceil(Math.max(0, msUntilExpiry) / 1000);
    return {
      canResend: false,
      remainingCooldownSeconds: remainingSeconds,
      attemptsLeft: 0,
      message: `Rate limit reached. Try again in ${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s.`,
    };
  }

  if (validTimestamps.length > 0) {
    const mostRecent = validTimestamps[validTimestamps.length - 1];
    const msSinceLast = now - mostRecent;
    if (msSinceLast < MIN_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((MIN_INTERVAL_MS - msSinceLast) / 1000);
      return {
        canResend: false,
        remainingCooldownSeconds: remainingSeconds,
        attemptsLeft,
        message: `Please wait ${remainingSeconds}s before requesting another email.`,
      };
    }
  }

  return {
    canResend: true,
    remainingCooldownSeconds: 0,
    attemptsLeft,
  };
}

/**
 * Trigger Supabase resend verification email with rate limiting
 */
export async function sendVerificationEmail(email: string): Promise<{
  success: boolean;
  error?: string;
  remainingCooldownSeconds?: number;
}> {
  const status = getResendStatus(email);
  if (!status.canResend) {
    return {
      success: false,
      error: status.message || "Please wait before resending.",
      remainingCooldownSeconds: status.remainingCooldownSeconds,
    };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Record this attempt
    const now = Date.now();
    const timestamps = getStoredTimestamps(email);
    timestamps.push(now);
    saveTimestamps(email, timestamps);

    return {
      success: true,
      remainingCooldownSeconds: 60,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send verification email.";
    return { success: false, error: msg };
  }
}
