-- =============================================================================
-- Migration: Priority 1 — Core Operations & Editorial Flexibility
-- Table: public.platform_settings, alterations to public.projects & public.profiles
-- =============================================================================

-- 1. Create public.platform_settings singleton table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  announcement_banner_text TEXT DEFAULT '',
  announcement_banner_link TEXT DEFAULT '',
  announcement_banner_active BOOLEAN DEFAULT false,
  allow_signups BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Layerat is currently undergoing scheduled platform upgrades. We will be back online shortly.',
  max_upload_size_mb INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to platform settings
DROP POLICY IF EXISTS "Allow public read access to platform_settings" ON public.platform_settings;
CREATE POLICY "Allow public read access to platform_settings"
  ON public.platform_settings
  FOR SELECT
  USING (true);

-- Allow authenticated update access to platform settings
DROP POLICY IF EXISTS "Allow authenticated update to platform_settings" ON public.platform_settings;
CREATE POLICY "Allow authenticated update to platform_settings"
  ON public.platform_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Realtime publication for platform_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'platform_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
  END IF;
END $$;

-- Seed default singleton row if not exists
INSERT INTO public.platform_settings (
  id,
  announcement_banner_text,
  announcement_banner_link,
  announcement_banner_active,
  allow_signups,
  maintenance_mode,
  max_upload_size_mb
)
VALUES (
  'global',
  '',
  '',
  false,
  true,
  false,
  25
)
ON CONFLICT (id) DO NOTHING;

-- 2. Alter public.projects for editorial ranking and badges
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL;

-- Index on featured_order for high-speed curated queries
CREATE INDEX IF NOT EXISTS idx_projects_featured_order ON public.projects (featured, featured_order);

-- 3. Alter public.profiles for role-based access and creator badges
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL;

-- Index on profile role and featured status
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_featured ON public.profiles (is_featured);
