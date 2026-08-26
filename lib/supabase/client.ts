import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ttjobsgglwgyioqlldqj.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0am9ic2dnbHdneWlvcWxsZHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzIxMjIsImV4cCI6MjEwMzM0ODEyMn0.gJPw6lkAoYCQkIaw8uv0iDtou_XO-OzLQY368qA2FBA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
