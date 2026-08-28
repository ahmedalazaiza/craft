/**
 * Environment Variables Schema & Safe Runtime Validation
 * Prevents silent crashes and provides clear diagnostic error messages in production.
 */

export interface AppEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  NODE_ENV: "development" | "production" | "test";
  IS_PRODUCTION: boolean;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[DevOps Alert] Missing critical environment variable: ${key}`);
    }
    return "";
  }
  return value;
}

export const env: AppEnv = {
  SUPABASE_URL: getEnvVar(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://ttjobsgglwgyioqlldqj.supabase.co"
  ),
  SUPABASE_ANON_KEY: getEnvVar(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0am9ic2dnbHdneWlvcWxsZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzIxMjIsImV4cCI6MjEwMzM0ODEyMn0.gJPw6lkAoYCQkIaw8uv0iDtou_XO-OzLQY368qA2FBA"
  ),
  NODE_ENV: (process.env.NODE_ENV as AppEnv["NODE_ENV"]) || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

/**
 * Validates that all production-grade environment variables are sound.
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", val: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  ];

  const missing = required.filter((item) => !item.val).map((item) => item.key);

  return {
    valid: missing.length === 0,
    missing,
  };
}
