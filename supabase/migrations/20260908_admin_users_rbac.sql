-- =============================================================================
-- MIGRATION: 20260908_admin_users_rbac.sql
-- DESCRIPTION: Dedicated RBAC Administration System for Layerat Platform
-- CREATES: public.admin_users table, PostgreSQL security functions, and RLS policies
-- =============================================================================

-- 1. Create the dedicated admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'community_moderator' CHECK (
    role IN ('super_admin', 'editorial_director', 'curator', 'community_moderator')
  ),
  permissions JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'invited', 'suspended')
  ),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT admin_users_user_id_key UNIQUE (user_id)
);

-- 2. Indexes for high-performance role checks and queries
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users (role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users (status);

-- 3. Security Definer helper functions to avoid recursive RLS checks
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
      AND role = 'super_admin'
      AND status = 'active'
  );
$$;

-- Grant execution to authenticated and anon users for permission evaluations
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated, anon, service_role;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies for admin_users
-- Policy A: Only active admins can view the admin roster
DROP POLICY IF EXISTS "Active admins can view admin users" ON public.admin_users;
CREATE POLICY "Active admins can view admin users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Policy B: Only SuperAdmins can add new admin members
DROP POLICY IF EXISTS "Only SuperAdmins can insert admin members" ON public.admin_users;
CREATE POLICY "Only SuperAdmins can insert admin members"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Policy C: Only SuperAdmins can update admin roles, permissions, and status
DROP POLICY IF EXISTS "Only SuperAdmins can update admin members" ON public.admin_users;
CREATE POLICY "Only SuperAdmins can update admin members"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Policy D: Only SuperAdmins can remove admin members (cannot delete oneself)
DROP POLICY IF EXISTS "Only SuperAdmins can delete admin members" ON public.admin_users;
CREATE POLICY "Only SuperAdmins can delete admin members"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (
    public.is_super_admin(auth.uid()) 
    AND user_id != auth.uid()
  );

-- 6. Trigger to automatically keep updated_at in sync
CREATE OR REPLACE FUNCTION public.handle_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER tr_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_users_updated_at();

-- 7. Seed Root SuperAdmin safely from auth.users
-- Automatically detects your owner email (ahmedazy.uxui@gmail.com) and binds SuperAdmin role
INSERT INTO public.admin_users (user_id, email, role, status)
SELECT id, email, 'super_admin', 'active'
FROM auth.users
WHERE email = 'ahmedazy.uxui@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET role = 'super_admin', status = 'active', updated_at = NOW();

-- Also ensure public.profiles reflects admin role for UI convenience
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT user_id FROM public.admin_users WHERE role = 'super_admin'
);
