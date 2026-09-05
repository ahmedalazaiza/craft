-- =============================================================================
-- 20260911_platform_cms_pages.sql
-- LAYERAT PLATFORM CMS TABLES & POLICIES (IDEMPOTENT MIGRATION)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.cms_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Index on slug for rapid lookups
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);

-- Enable Row Level Security
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view published CMS page content
DROP POLICY IF EXISTS "Public can view cms pages" ON public.cms_pages;
CREATE POLICY "Public can view cms pages"
  ON public.cms_pages
  FOR SELECT
  USING (true);

-- 2. Authenticated Admins / Curators can insert, update, or delete CMS pages
DROP POLICY IF EXISTS "Admins can manage cms pages" ON public.cms_pages;
CREATE POLICY "Admins can manage cms pages"
  ON public.cms_pages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'curator', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'curator', 'super_admin')
    )
  );

-- 3. Seed Initial Content for About Us, Our Team, and Community Guidelines
INSERT INTO public.cms_pages (slug, title, subtitle, content)
VALUES
  (
    'about',
    'About Us',
    'Our Story & Mission',
    '{
      "headline": "The modern home for great design.",
      "mission": "We built Layerat because creative work deserves a fast, focused, and ad-free space. Here, high-resolution craftsmanship speaks for itself.",
      "pillar1Title": "High Resolution",
      "pillar1Desc": "Upload full project case studies in crisp, uncompressed quality with custom image layouts, process notes, and typography.",
      "pillar2Title": "No Algorithms",
      "pillar2Desc": "No social feed noise or algorithmic feeds. Discoveries are driven purely by design quality and authentic peer appreciation.",
      "pillar3Title": "100% Creator Ownership",
      "pillar3Desc": "You retain full intellectual property rights to your work. Share your portfolio and story completely on your own terms."
    }'::jsonb
  ),
  (
    'team',
    'Our Team',
    'Curators & Builders',
    '{
      "headline": "Built by makers, for makers.",
      "subtitle": "We are a distributed collective of designers, engineers, and typographers dedicated to building the premier home for digital craftsmanship.",
      "members": [
        {
          "id": "ahmed-alazaiza",
          "name": "Ahmed Al-Azaiza",
          "role": "Founder & Lead Architect",
          "location": "Global",
          "bio": "Obsessed with micro-interactions, high-speed UI architecture, and typographic perfection.",
          "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85",
          "discipline": "Product & Architecture",
          "socials": {
            "github": "https://github.com",
            "twitter": "https://x.com",
            "linkedin": "https://linkedin.com",
            "website": "https://layerat.com"
          }
        },
        {
          "id": "elena-rostova",
          "name": "Elena Rostova",
          "role": "Head of Editorial & Curation",
          "location": "Berlin, DE",
          "bio": "Ex-art director at Monolith Design. Curates standout visual monographs and oversees typography standards.",
          "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=85",
          "discipline": "Editorial Direction",
          "socials": {
            "twitter": "https://x.com",
            "linkedin": "https://linkedin.com",
            "website": "https://layerat.com"
          }
        },
        {
          "id": "marcus-vance",
          "name": "Marcus Vance",
          "role": "Creative Technologist & 3D Lead",
          "location": "Tokyo, JP",
          "bio": "Pioneering spatial computing interfaces, real-time shaders, and immersive interactive graphics.",
          "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
          "discipline": "3D & Motion",
          "socials": {
            "github": "https://github.com",
            "twitter": "https://x.com",
            "linkedin": "https://linkedin.com"
          }
        },
        {
          "id": "maya-lin",
          "name": "Maya Lin",
          "role": "Brand Identity & Specimen Curator",
          "location": "London, UK",
          "bio": "Specializing in timeless identity systems, foundry specimens, and minimalist packaging.",
          "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=85",
          "discipline": "Brand & Typography",
          "socials": {
            "twitter": "https://x.com",
            "linkedin": "https://linkedin.com",
            "website": "https://layerat.com"
          }
        }
      ]
    }'::jsonb
  ),
  (
    'guidelines',
    'Community Guidelines',
    'Peer & Curation Standards',
    '{
      "headline": "Community Guidelines",
      "subtitle": "Peer & Curation Standards",
      "clauses": [
        {
          "id": "authorship",
          "title": "1. Authentic Authorship & Creative Integrity",
          "content": "Publish only work that you created, art directed, or contributed to meaningfully. Layerat celebrates genuine craft over volume."
        },
        {
          "id": "critique",
          "title": "2. Thoughtful Peer Critique & Discourse",
          "content": "Feedback on Layerat should elevate the craft. When commenting on another designer''s monograph, offer actionable, constructive critique."
        },
        {
          "id": "curation",
          "title": "3. Curation Standards for Curated Collections",
          "content": "Projects featured on the homepage, in category showcases, or in editorial collections are chosen based on execution quality and storytelling completeness."
        }
      ]
    }'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;
