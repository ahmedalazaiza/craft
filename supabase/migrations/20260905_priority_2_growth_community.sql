-- =============================================================================
-- Migration: Priority 2 — Growth & Community Engagement
-- Tables: public.collections (Thematic Curations) & public.reports (Abuse/Content Flags)
-- =============================================================================

-- 1. Create public.collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image TEXT NOT NULL,
  project_ids UUID[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections (slug);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON public.collections (is_featured, sort_order);

-- Enable Row Level Security on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Allow public read access to collections
DROP POLICY IF EXISTS "Allow public read access to collections" ON public.collections;
CREATE POLICY "Allow public read access to collections"
  ON public.collections
  FOR SELECT
  USING (true);

-- Allow authenticated admins full access
DROP POLICY IF EXISTS "Allow authenticated full access to collections" ON public.collections;
CREATE POLICY "Allow authenticated full access to collections"
  ON public.collections
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable Realtime publication for collections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'collections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
  END IF;
END $$;

-- Seed initial curated editorial collections dynamically linking existing projects
INSERT INTO public.collections (slug, title, description, cover_image, is_featured, sort_order, project_ids)
SELECT
  'brand-visual-systems',
  'Brand Architecture & Visual Systems',
  'A curated editorial index of identities, design systems, and cohesive visual language monographs.',
  'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop',
  true,
  1,
  COALESCE(ARRAY(SELECT id FROM public.projects WHERE published = true LIMIT 6), '{}'::uuid[])
WHERE NOT EXISTS (SELECT 1 FROM public.collections WHERE slug = 'brand-visual-systems');

INSERT INTO public.collections (slug, title, description, cover_image, is_featured, sort_order, project_ids)
SELECT
  'digital-interfaces-craft',
  'Digital Interfaces & Interaction Craft',
  'High-fidelity user interface design, micro-interactions, and computational ergonomics.',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
  true,
  2,
  COALESCE(ARRAY(SELECT id FROM public.projects WHERE published = true OFFSET 3 LIMIT 6), '{}'::uuid[])
WHERE NOT EXISTS (SELECT 1 FROM public.collections WHERE slug = 'digital-interfaces-craft');


-- 2. Create public.reports table (Abuse, Copyright & Content Moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  reported_creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('copyright', 'inappropriate_content', 'spam', 'harassment', 'other')),
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes on reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON public.reports (project_id);
CREATE INDEX IF NOT EXISTS idx_reports_creator_id ON public.reports (reported_creator_id);

-- Enable Row Level Security on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow any user (authenticated or anonymous) to insert a report
DROP POLICY IF EXISTS "Allow insertion to reports" ON public.reports;
CREATE POLICY "Allow insertion to reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users with admin role to view and manage reports
DROP POLICY IF EXISTS "Allow authenticated management of reports" ON public.reports;
CREATE POLICY "Allow authenticated management of reports"
  ON public.reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
