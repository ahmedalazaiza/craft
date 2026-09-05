-- =============================================================================
-- MIGRATION: 20260910_production_ready_admin_audit.sql
-- DESCRIPTION: Complete Production-Ready Database Schema Alignment & Security Hardening
-- 1. Adds missing is_suspended & email columns to public.profiles
-- 2. Backfills real registered emails from auth.users into public.profiles
-- 3. Updates handle_new_user() trigger to automatically synchronize email
-- 4. Adds resolution_notes column to public.reports
-- 5. Provisions Admin RLS Policies for Profiles, Projects & Comments
-- 6. Enforces suspension security (suspended users blocked from creating projects/comments)
-- =============================================================================

-- 1. PUBLIC.PROFILES — ADD MISSING PRODUCTION COLUMNS
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles (is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. BACKFILL REAL EMAILS FROM AUTH.USERS INTO PUBLIC.PROFILES
-- Automatically syncs all existing authentic accounts with their real emails
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 3. UPDATE HANDLE_NEW_USER TRIGGER TO SYNC EMAIL & SUSPENSION DEFAULTS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    candidate_username TEXT;
    temp_username TEXT;
    counter INT := 1;
BEGIN
    candidate_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9_]', '_', 'g')
    );
    
    IF candidate_username IS NULL OR length(candidate_username) < 2 THEN
        candidate_username := 'creator';
    END IF;

    temp_username := candidate_username;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = temp_username AND id <> NEW.id) LOOP
        temp_username := candidate_username || '_' || counter;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        email,
        avatar_url,
        bio,
        skills,
        is_verified,
        is_online,
        is_suspended,
        role,
        followers_count
    )
    VALUES (
        NEW.id,
        temp_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', temp_username),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'bio', ''),
        '{}',
        false,
        false,
        false,
        'member',
        0
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PUBLIC.REPORTS — ADD RESOLUTION_NOTES COLUMN
ALTER TABLE public.reports 
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT DEFAULT '';

-- 5. ADMIN RLS POLICIES FOR PROFILES, PROJECTS & COMMENTS
-- Enables authorized Super Admins to curate, verify, suspend, badge, and moderate
-- Helper: Checks if caller is active admin or root owner
CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT (
    auth.jwt() ->> 'email' = 'ahmedazy.uxui@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND role IN ('super_admin', 'editorial_director', 'curator', 'community_moderator')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated;

-- Policy: Admins can update any profile (verify, suspend, role, badge)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

-- Policy: Admins can update any project (feature order, badges, publish toggle)
DROP POLICY IF EXISTS "Admins can update any project" ON public.projects;
CREATE POLICY "Admins can update any project"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (public.is_authorized_admin())
  WITH CHECK (public.is_authorized_admin());

-- Policy: Admins can delete any project (moderation removal)
DROP POLICY IF EXISTS "Admins can delete any project" ON public.projects;
CREATE POLICY "Admins can delete any project"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (public.is_authorized_admin());

-- Policy: Admins can delete any comment (moderation removal)
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
CREATE POLICY "Admins can delete any comment"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (public.is_authorized_admin());

-- 6. SUSPENSION ENFORCEMENT ON PROJECTS & COMMENTS
-- Suspended users cannot insert new monographs
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" 
  ON public.projects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_suspended = true
    )
  );

-- Suspended users cannot insert comments
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
CREATE POLICY "Users can insert comments" 
  ON public.comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_suspended = true
    )
  );
