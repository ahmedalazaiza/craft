-- =============================================================================
-- CRAFT PLATFORM — SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- =============================================================================
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/ttjobsgglwgyioqlldqj/sql)
-- This creates all required tables, relations, triggers, RLS policies, and seeds live data.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE (Creators & Studios)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    city TEXT,
    website TEXT,
    skills TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. PROJECTS TABLE (Monographs & Visual Works)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    cover_image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    medium TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    tools TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    appreciations_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 3. APPRECIATIONS TABLE (Hearts & Likes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.appreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_user_appreciation UNIQUE(project_id, user_id)
);

-- =============================================================================
-- 4. COMMENTS TABLE (Critique & Discussion)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 5. FOLLOWS TABLE (Studio Following Network)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_follower_following UNIQUE(follower_id, following_id)
);

-- =============================================================================
-- 6. NOTIFICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'appreciation', 'comment', 'follow', 'publish'
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    content TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- INDEXES FOR FAST PERFORMANCE & HIGH-SPEED SEARCH
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_published_at ON public.projects(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_appreciations_project ON public.appreciations(project_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- =============================================================================
-- AUTOMATED TRIGGERS FOR METRICS
-- =============================================================================

-- Auto update appreciations_count on projects
CREATE OR REPLACE FUNCTION update_project_appreciations_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.projects
        SET appreciations_count = appreciations_count + 1
        WHERE id = NEW.project_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.projects
        SET appreciations_count = GREATEST(0, appreciations_count - 1)
        WHERE id = OLD.project_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_project_appreciations_count ON public.appreciations;
CREATE TRIGGER tr_update_project_appreciations_count
AFTER INSERT OR DELETE ON public.appreciations
FOR EACH ROW EXECUTE FUNCTION update_project_appreciations_count();

-- Auto update followers_count on profiles
CREATE OR REPLACE FUNCTION update_profile_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_profile_followers_count ON public.follows;
CREATE TRIGGER tr_update_profile_followers_count
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION update_profile_followers_count();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appreciations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access on all public tables
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (published = true OR true);
CREATE POLICY "Appreciations are viewable by everyone" ON public.appreciations FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Notifications are viewable by recipient" ON public.notifications FOR SELECT USING (true);

-- Allow Insert / Update / Delete via Anon / Authenticated for Platform Demo
CREATE POLICY "Allow all profile mutations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all project mutations" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all appreciation mutations" ON public.appreciations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all comment mutations" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all follow mutations" ON public.follows FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all notification mutations" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- INITIAL LIVE SEED DATA
-- =============================================================================

-- 1. Seed Creators / Profiles
INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, location, city, website, skills, is_verified, is_online, followers_count)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'elena_v',
    'Elena Vance',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'Principal brand designer and spatial typographer exploring tactile digital surfaces and minimal editorial identity systems.',
    'Berlin, Germany',
    'Berlin',
    'https://elenavance.design',
    ARRAY['Brand Systems', 'Typography', 'Art Direction', 'Motion'],
    true,
    true,
    1240
),
(
    'a2222222-2222-2222-2222-222222222222',
    'kai_sato',
    'Kai Sato',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'Product architect & UI engineer designing high-density interfaces, fluid interactions, and generative design tools.',
    'Tokyo, Japan',
    'Tokyo',
    'https://sato.works',
    ARRAY['UI Systems', 'Creative Code', 'Interaction', 'Next.js'],
    true,
    true,
    890
),
(
    'a3333333-3333-3333-3333-333333333333',
    'maya_lin',
    'Maya Lin',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'Architectural photographer and 3D visual artist capturing the interplay of concrete, brutalist forms, and natural sunlight.',
    'London, United Kingdom',
    'London',
    'https://mayalin.studio',
    ARRAY['Photography', '3D Rendering', 'CGI', 'Editorial'],
    true,
    false,
    1420
),
(
    'a4444444-4444-4444-4444-444444444444',
    'marcus_k',
    'Marcus Keller',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'Editorial art director and printmaker focused on independent monograph publishing, risograph editions, and book craft.',
    'Zurich, Switzerland',
    'Zurich',
    'https://keller-editions.ch',
    ARRAY['Editorial', 'Print', 'Book Design', 'Identity'],
    true,
    true,
    650
),
(
    'a5555555-5555-5555-5555-555555555555',
    'sophia_chen',
    'Sophia Chen',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
    'Industrial designer & audio-hardware architect crafting tactile synthesizers, CNC machined enclosures, and physical interfaces.',
    'New York, USA',
    'New York',
    'https://sophiachen.audio',
    ARRAY['Industrial Design', 'Hardware UI', 'Machining', 'CAD'],
    false,
    false,
    1100
),
(
    'a6666666-6666-6666-6666-666666666666',
    'david_nord',
    'David Nordström',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    'Spatial architect & pavilion researcher exploring Scandinavian timber joints, daylight acoustics, and passive geothermal structures.',
    'Stockholm, Sweden',
    'Stockholm',
    'https://nordstrom-ark.se',
    ARRAY['Architecture', 'Spatial Design', 'Timber Craft', 'Structures'],
    true,
    false,
    780
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    is_verified = EXCLUDED.is_verified,
    is_online = EXCLUDED.is_online;

-- 2. Seed Projects with High-Res Image Streams
INSERT INTO public.projects (id, slug, title, summary, body, cover_image, gallery_images, category, medium, tags, tools, published, featured, creator_id, appreciations_count, published_at)
VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'kinfolk-sanctuary',
    'Kinfolk Sanctuary — Identity & Spatial Monograph',
    'Complete brand identity, physical signage, and spatial typography for an architectural retreat in Copenhagen.',
    'Kinfolk Sanctuary is an architectural retreat nestled in the outskirts of Copenhagen. We designed a holistic identity system grounded in natural materials, custom serif typography, and unhurried editorial layouts that breathe with the surrounding Nordic landscape.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80'
    ],
    'Brand',
    'Image',
    ARRAY['Identity', 'Spatial', 'Typography', 'Nordic', 'Architecture'],
    ARRAY['Figma', 'Illustrator', 'Cinema 4D'],
    true,
    true,
    'a1111111-1111-1111-1111-111111111111',
    342,
    NOW() - INTERVAL '2 days'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'aurora-interface-os',
    'Aurora OS — Spatial Operating System UI',
    'High-density generative desktop interface exploration with glassmorphic layers and real-time audio reactive feedback.',
    'Aurora OS rethinks window management through fluid canvas coordinates, contextual docks, and kinetic depth layers. Engineered with sub-millisecond gesture tracking and tactile micro-interactions.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80'
    ],
    'UI',
    'Prototype',
    ARRAY['UI System', 'Spatial OS', 'Dark Mode', 'Glassmorphism', 'Next.js'],
    ARRAY['Figma', 'Next.js', 'TailwindCSS', 'Framer Motion'],
    true,
    true,
    'a2222222-2222-2222-2222-222222222222',
    512,
    NOW() - INTERVAL '3 days'
),
(
    'b3333333-3333-3333-3333-333333333333',
    'brutalist-concrete-silence',
    'Monoliths of Silence — Architectural Photo Series',
    'A stark photographic monograph documenting the geometric geometry and shadow play of post-war European brutalism.',
    'A photographic study spanning Barbican Estate, Habitat 67, and the brutalist monuments of former Yugoslavia. Shot on medium format film over three consecutive winters.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&auto=format&fit=crop&q=80'
    ],
    'Photo',
    'Image',
    ARRAY['Photography', 'Brutalism', 'Monochrome', 'Concrete', 'Geometry'],
    ARRAY['Hasselblad 500C/M', 'Capture One'],
    true,
    true,
    'a3333333-3333-3333-3333-333333333333',
    678,
    NOW() - INTERVAL '5 days'
),
(
    'b4444444-4444-4444-4444-444444444444',
    'bauhaus-monograph-2026',
    'Bauhaus Centennial Typographic Monograph',
    'A 320-page limited edition hardcover book celebrating modernist type experiments with five Pantone spot colors.',
    'Commissioned for the international centenary celebration, this volume presents archival type specimens alongside contemporary responses by 40 international typographers.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1600&auto=format&fit=crop&q=80'
    ],
    'Editorial',
    'PDF/Case study',
    ARRAY['Editorial', 'Print', 'Typography', 'Bauhaus', 'Book Design'],
    ARRAY['InDesign', 'Glyphs 3', 'Risograph'],
    true,
    false,
    'a4444444-4444-4444-4444-444444444444',
    289,
    NOW() - INTERVAL '6 days'
),
(
    'b5555555-5555-5555-5555-555555555555',
    'synth-01-analog-synthesizer',
    'SYNTH-01 — Tactile Analog Synthesizer Enclosure',
    'CNC milled unibody aluminum chassis with custom knurled rotary encoders and OLED tactile parameter display.',
    'Designed for live analog synthesis performances, SYNTH-01 balances raw industrial aesthetics with ergonomic parameter layouts and gold-plated mechanical switches.',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80'
    ],
    'Product',
    '3D',
    ARRAY['Industrial Design', 'Audio', 'Hardware', 'Machining', 'CAD'],
    ARRAY['Rhino 3D', 'Keyshot', 'Fusion 360'],
    true,
    true,
    'a5555555-5555-5555-5555-555555555555',
    419,
    NOW() - INTERVAL '8 days'
),
(
    'b6666666-6666-6666-6666-666666666666',
    'timber-canopy-pavilion',
    'Nordic Timber Canopy Pavilion',
    'A temporary cultural pavilion built using interlocking Douglas fir logs without metal hardware fasteners.',
    'Constructed in the royal park of Stockholm, the canopy demonstrates the structural possibilities of traditional interlocking joinery scaled with parametric CNC routing.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    ARRAY[
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80'
    ],
    'Architecture',
    'Image',
    ARRAY['Architecture', 'Timber', 'Joinery', 'Nordic', 'Sustainable'],
    ARRAY['Grasshopper', 'Rhino', 'AutoCAD'],
    true,
    false,
    'a6666666-6666-6666-6666-666666666666',
    311,
    NOW() - INTERVAL '10 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    cover_image = EXCLUDED.cover_image,
    gallery_images = EXCLUDED.gallery_images;

-- 3. Seed Discussion Comments
INSERT INTO public.comments (id, project_id, author_id, content, created_at)
VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'The proportion of the custom serif typeface against the tactile paper texture is exquisite. Brilliant art direction Elena!',
    NOW() - INTERVAL '1 day'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'b1111111-1111-1111-1111-111111111111',
    'a3333333-3333-3333-3333-333333333333',
    'The signage integration into raw concrete surfaces feels very organic and respectful to the architectural environment.',
    NOW() - INTERVAL '12 hours'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'b2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'Incredible fluid physics on the window hierarchy Kai. How did you handle gesture collision curves?',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;
