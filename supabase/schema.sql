-- =============================================================================
-- CRAFT PLATFORM — COMPLETE SUPABASE DATABASE SCHEMA & ALL 16 LIVE SEED PROJECTS
-- =============================================================================
-- Execute this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ttjobsgglwgyioqlldqj/sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE (Creators & Independent Studios)
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
-- 2. PROJECTS TABLE (Design Monographs & Visual Artifacts)
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
    categories TEXT[] DEFAULT '{}',
    sub_category TEXT,
    sub_categories TEXT[] DEFAULT '{}',
    medium TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    tools TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    appreciations_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 3. APPRECIATIONS TABLE (Likes & Hearts)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.appreciations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_user_appreciation UNIQUE(project_id, user_id)
);

-- =============================================================================
-- 4. COMMENTS TABLE (Critique & Discussion Stream)
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
-- 6. NOTIFICATIONS TABLE (Live Activity Feed)
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
-- 7. STORAGE BUCKETS (High-Res Media & Avatars)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('project-media', 'project-media', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =============================================================================
-- INDEXES FOR FAST PERFORMANCE & HIGH-SPEED SEARCH
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_published_at ON public.projects(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appreciations_project ON public.appreciations(project_id);
CREATE INDEX IF NOT EXISTS idx_appreciations_user_id ON public.appreciations(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id, read);

-- Ensure metrics columns exist idempotently on existing databases
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS appreciations_count INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Atomic increment for project views (Security Definer RPC)
CREATE OR REPLACE FUNCTION public.increment_project_views(p_project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.projects
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_project_views(UUID) TO anon, authenticated, service_role;

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
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public projects are viewable by everyone" ON public.projects;
CREATE POLICY "Public projects are viewable by everyone" ON public.projects FOR SELECT USING (published = true OR true);

DROP POLICY IF EXISTS "Appreciations are viewable by everyone" ON public.appreciations;
CREATE POLICY "Appreciations are viewable by everyone" ON public.appreciations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Notifications are viewable by recipient" ON public.notifications;
CREATE POLICY "Notifications are viewable by recipient" ON public.notifications FOR SELECT USING (true);

-- Allow Insert / Update / Delete via Anon / Authenticated for Platform
DROP POLICY IF EXISTS "Allow all profile mutations" ON public.profiles;
CREATE POLICY "Allow all profile mutations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all project mutations" ON public.projects;
CREATE POLICY "Allow all project mutations" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all appreciation mutations" ON public.appreciations;
CREATE POLICY "Allow all appreciation mutations" ON public.appreciations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all comment mutations" ON public.comments;
CREATE POLICY "Allow all comment mutations" ON public.comments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all follow mutations" ON public.follows;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public projects read" ON public.projects;
CREATE POLICY "Public projects read" ON public.projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Public appreciations read" ON public.appreciations;
CREATE POLICY "Public appreciations read" ON public.appreciations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert appreciations" ON public.appreciations;
CREATE POLICY "Users can insert appreciations" ON public.appreciations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete appreciations" ON public.appreciations;
CREATE POLICY "Users can delete appreciations" ON public.appreciations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public comments read" ON public.comments;
CREATE POLICY "Public comments read" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Public follows read" ON public.follows;
CREATE POLICY "Public follows read" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert follows" ON public.follows;
CREATE POLICY "Users can insert follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete follows" ON public.follows;
CREATE POLICY "Users can delete follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- =============================================================================
-- 8. STORAGE BUCKETS & POLICIES (Hard Delete, Upload & Read)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public storage read" ON storage.objects;
CREATE POLICY "Public storage read" ON storage.objects 
FOR SELECT USING (bucket_id IN ('project-media', 'avatars'));

DROP POLICY IF EXISTS "Public storage insert" ON storage.objects;
CREATE POLICY "Public storage insert" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id IN ('project-media', 'avatars'));

DROP POLICY IF EXISTS "Public storage update" ON storage.objects;
CREATE POLICY "Public storage update" ON storage.objects 
FOR UPDATE USING (bucket_id IN ('project-media', 'avatars')) 
WITH CHECK (bucket_id IN ('project-media', 'avatars'));

DROP POLICY IF EXISTS "Public storage delete" ON storage.objects;
CREATE POLICY "Public storage delete" ON storage.objects 
FOR DELETE USING (bucket_id IN ('project-media', 'avatars'));

-- =============================================================================
-- INITIAL LIVE SEED DATA (ALL 6 CREATORS)
-- =============================================================================

INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, location, city, website, skills, is_verified, is_online, followers_count)
VALUES
(
    'a0000001-0000-4000-8000-000000000001',
    'elena_v',
    'Elena Vance',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'Principal brand designer and spatial typographer exploring tactile digital surfaces and minimal editorial identity systems.',
    'Berlin, Germany',
    'Berlin',
    'https://elenavance.design',
    ARRAY['Brand Identity', 'Type Design & Lettering', 'Motion Design', 'Typography Scale'],
    true,
    true,
    0
),
(
    'a0000002-0000-4000-8000-000000000002',
    'kai_sato',
    'Kai Sato',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'Product architect & UI engineer designing high-density interfaces, fluid interactions, and generative design tools.',
    'Tokyo, Japan',
    'Tokyo',
    'https://sato.works',
    ARRAY['User Interface Design (UI)', 'User Experience Design (UX)', 'Design Systems', 'Prototyping'],
    true,
    true,
    0
),
(
    'a0000003-0000-4000-8000-000000000003',
    'maya_lin',
    'Maya Lin',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'Architectural photographer and 3D visual artist capturing the interplay of concrete, brutalist forms, and natural sunlight.',
    'London, United Kingdom',
    'London',
    'https://mayalin.studio',
    ARRAY['3D Design', 'AR/VR & Spatial Design', '3D Rendering', 'Architectural Visualization'],
    true,
    false,
    0
),
(
    'a0000004-0000-4000-8000-000000000004',
    'marcus_k',
    'Marcus Keller',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'Editorial art director and printmaker focused on independent monograph publishing, risograph editions, and book craft.',
    'Zurich, Switzerland',
    'Zurich',
    'https://keller-editions.ch',
    ARRAY['Graphic Design', 'Print Design', 'Editorial & Magazine Design', 'Book Design'],
    true,
    true,
    0
),
(
    'a0000005-0000-4000-8000-000000000005',
    'sophia_chen',
    'Sophia Chen',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop&q=80',
    'Industrial designer & audio-hardware architect crafting tactile synthesizers, CNC machined enclosures, and physical interfaces.',
    'New York, USA',
    'New York',
    'https://sophiachen.audio',
    ARRAY['Industrial & Physical Product Design', 'Consumer Electronics', 'Rapid Prototyping', 'CMF (Color, Materials, Finish)'],
    false,
    false,
    0
),
(
    'a0000006-0000-4000-8000-000000000006',
    'david_nord',
    'David Nordström',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    'Spatial architect & pavilion researcher exploring Scandinavian timber joints, daylight acoustics, and passive geothermal structures.',
    'Stockholm, Sweden',
    'Stockholm',
    'https://nordstrom-ark.se',
    ARRAY['3D Design', 'AR/VR & Spatial Design', 'Environment Design', 'Spatial Interfaces'],
    true,
    false,
    0
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    skills = EXCLUDED.skills,
    is_verified = EXCLUDED.is_verified,
    is_online = EXCLUDED.is_online;

-- =============================================================================
-- INITIAL LIVE SEED DATA (ALL 16 PROJECTS)
-- =============================================================================

INSERT INTO public.projects (id, slug, title, summary, body, cover_image, gallery_images, category, sub_category, medium, tags, tools, published, featured, creator_id, appreciations_count, published_at)
VALUES
(
    'b0000001-0000-4000-8000-000000000001',
    'kinfolk-sanctuary',
    'Sanctuary: Architectural Monograph & Spatial Identity',
    'A tactile spatial monograph and editorial identity celebrating raw timber, poured concrete, and quiet domestic spaces.',
    'Sanctuary investigates the liminal boundary between built environment and untamed organic topography. Commissioned as both an architectural record and a bespoke monograph series, the identity centers on restraint, tactile paper stocks, and deliberate silence.\n\nWe developed a custom grotesque typeface with carved incised terminals to echo stone-masonry techniques, paired with a monochrome palette disrupted only by subtle moss-tone pigments.\n\nThe publication spans 280 pages of Japanese smyth-sewn binding, featuring extensive duotone photography shot on large-format 4x5 film. Every spread is engineered with asymmetrical grid structures that breathe with the architectural cadence of the structures themselves.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&auto=format&fit=crop&q=85'
    ],
    'Brand Identity',
    'Brand Guidelines',
    'PDF/Case study',
    ARRAY['Brand Marks', 'Style Guides', 'Color Palettes', 'Typography Hierarchy'],
    ARRAY['Adobe Illustrator', 'Adobe InDesign', 'Figma', 'Glyphs'],
    true,
    true,
    'a0000001-0000-4000-8000-000000000001',
    0,
    NOW() - INTERVAL '2 days'
),
(
    'b0000002-0000-4000-8000-000000000002',
    'aurora-interface-os',
    'Aurora OS: High-Density Canvas for Creative Engineers',
    'An expansive spatial operating canvas designed for node-based visual programming and real-time audio-visual synthesis.',
    'Aurora OS rethinks how creative coders interact with multidimensional data streams. Rather than boxing users into rigid windowing paradigms, Aurora presents an infinite canvas with zoom-independent vector density and contextual micro-surfaces.\n\nBuilt with bespoke rendering shaders and strict sub-pixel typography guidelines, the UI maintains 120fps fluid transitions even when handling tens of thousands of concurrent data nodes.\n\nThe design system incorporates custom color calibration tokens that reduce eye strain during 10-hour deep synthesis sessions, featuring subtle lime and forest highlights against crisp neutral bases.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1400&auto=format&fit=crop&q=85'
    ],
    'User Interface Design (UI)',
    'Dashboard & SaaS Design',
    'Prototype',
    ARRAY['Design Tokens', 'Auto-layout', 'Component Architecture', 'Dark Mode', 'Micro-interactions'],
    ARRAY['Figma', 'Framer', 'VS Code', 'Zeplin'],
    true,
    true,
    'a0000002-0000-4000-8000-000000000002',
    0,
    NOW() - INTERVAL '3 days'
),
(
    'b0000003-0000-4000-8000-000000000003',
    'brutalist-concrete-silence',
    'Brutalist Silence: Monolithic Forms in Light & Dust',
    'A high-contrast photographic study documenting raw brutalist architecture across European capitals at dawn.',
    'Brutalist Silence is an ongoing archive investigating how monolithic post-war concrete facades weather under varying atmospheric conditions.\n\nShot exclusively during blue hour using natural ambient illumination and long exposures, the series highlights structural textures, shuttering seams, and the poetic geometry of intentional concrete weight.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=85'
    ],
    '3D Design',
    'Architectural Visualization',
    'Image',
    ARRAY['Lighting', 'Texturing', 'Photorealism', 'PBR Materials'],
    ARRAY['Blender', 'Cinema 4D', 'OctaneRender', 'V-Ray'],
    true,
    true,
    'a0000003-0000-4000-8000-000000000003',
    0,
    NOW() - INTERVAL '5 days'
),
(
    'b0000004-0000-4000-8000-000000000004',
    'bauhaus-risograph-monograph',
    'Typographic Resonance: 4-Color Risograph Folio',
    'A limited-edition risograph publication exploring asymmetric grid structures and grotesque typographic scale.',
    'Produced on a vintage two-drum GR-series Risograph press using fluorescent pink, cornflower blue, sunflower yellow, and soy black inks.\n\nEach spread challenges standard margins, running glyph specimens into the gutter and across full bleeds.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85'
    ],
    'Graphic Design',
    'Editorial & Magazine Design',
    'PDF/Case study',
    ARRAY['Grid Systems', 'Layout Composition', 'Print Production', 'Visual Hierarchy'],
    ARRAY['Adobe InDesign', 'Adobe Illustrator', 'Adobe Photoshop'],
    true,
    false,
    'a0000004-0000-4000-8000-000000000004',
    0,
    NOW() - INTERVAL '6 days'
),
(
    'b0000005-0000-4000-8000-000000000005',
    'tactile-analog-synthesizer',
    'Aura 04: CNC Machined Modular Synthesizer Interface',
    'Solid bead-blasted aluminum hardware synth enclosure with custom knurled rotary encoders and OLED display surfaces.',
    'Aura 04 merges physical analog synthesis with surgical tactile ergonomics. Every knob is CNC-milled from 6061 aerospace-grade aluminum and anodized in matte obsidian.\n\nThe weighted rotary resistance is tuned with custom high-viscosity damping grease to provide zero play and infinite resolution tactile precision.',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400&auto=format&fit=crop&q=85'
    ],
    'Industrial & Physical Product Design',
    'Consumer Electronics',
    '3D',
    ARRAY['CMF (Color, Materials, Finish)', 'Ergonomics', 'Rapid Prototyping', 'User-Centered Hardware'],
    ARRAY['SolidWorks', 'Fusion 360', 'KeyShot', 'Rhino'],
    true,
    false,
    'a0000005-0000-4000-8000-000000000005',
    0,
    NOW() - INTERVAL '8 days'
),
(
    'b0000006-0000-4000-8000-000000000006',
    'scandinavian-timber-pavilion',
    'Nordic Daylight Pavilion: Interlocking Timber Joints',
    'A seasonal daylight observatory constructed from sustainable slow-growth spruce without metallic fasteners.',
    'Developed as a public contemplation shelter in Stockholm''s archipelago, this pavilion utilizes traditional Japanese and Nordic joinery methods.\n\nThe roof louvers are mathematically oriented to trace the summer solstice sun arc, creating dynamic shadow patterns throughout the day.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85'
    ],
    '3D Design',
    'Environment Design',
    'PDF/Case study',
    ARRAY['3D Modeling', 'Photorealism', 'Shading', 'ArchViz'],
    ARRAY['Rhino', 'Blender', 'KeyShot', 'AutoCAD'],
    true,
    false,
    'a0000006-0000-4000-8000-000000000006',
    0,
    NOW() - INTERVAL '10 days'
),
(
    'b0000007-0000-4000-8000-000000000007',
    'kinetic-variable-typeface',
    'Kinesis Variable: Fluid Optical Axis & Generative Glyphs',
    'An experimental variable font system responding to real-time audio frequencies and cursor proximity.',
    'Kinesis pushes the boundary of modern OpenType variable font axes. Featuring 4 custom axes: Weight, Width, Tension, and Gravity.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85'
    ],
    'Type Design & Lettering',
    'Font Creation',
    'Prototype',
    ARRAY['Variable Fonts', 'Kerning', 'Ligatures', 'Glyphs', 'Typographic Scales'],
    ARRAY['Glyphs', 'FontForge', 'RoboFont', 'FontLab'],
    true,
    false,
    'a0000001-0000-4000-8000-000000000001',
    0,
    NOW() - INTERVAL '12 days'
),
(
    'b0000008-0000-4000-8000-000000000008',
    'monolith-exhibition-catalogue',
    'Monolith: Brutalist Identity & Cast Concrete Catalogue',
    'A heavyweight custom publication featuring blind debossing and custom display grotesques.',
    'Monolith explores concrete architecture through tactile, dense print design. Screen-printed in 3 Pantone metallic passes on recycled greyboard.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85'
    ],
    'Graphic Design',
    'Print Design',
    'PDF/Case study',
    ARRAY['Layout Composition', 'Grid Systems', 'Visual Hierarchy', 'Die-cut'],
    ARRAY['Adobe InDesign', 'Adobe Illustrator', 'Adobe Photoshop'],
    true,
    false,
    'a0000004-0000-4000-8000-000000000004',
    0,
    NOW() - INTERVAL '14 days'
),
(
    'b0000009-0000-4000-8000-000000000009',
    'aether-generative-audio-canvas',
    'Aether: Real-time Audio-Visual Synthesis Canvas',
    'A GPU-accelerated web interface for real-time shader generation and frequency mapping.',
    'Aether bridges WebGL shader programming with low-latency WebAudio oscillators to deliver responsive ambient visualizers.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=85'
    ],
    'User Interface Design (UI)',
    'Web Design',
    'Prototype',
    ARRAY['Auto-layout', 'Design Tokens', 'Micro-interactions', 'Dark Mode'],
    ARRAY['Figma', 'VS Code', 'Framer'],
    true,
    true,
    'a0000002-0000-4000-8000-000000000002',
    0,
    NOW() - INTERVAL '16 days'
),
(
    'b0000010-0000-4000-8000-000000000010',
    'terra-timber-joinery-study',
    'Terra: Japanese Hand-Hewn Cedar Pavilion & Joints',
    'A research archive of complex wooden joinery prototypes and daylight meditation shelters.',
    'Constructed in Kyoto using centuries-old Kanawa-tsugi joinery without screws or adhesives, demonstrating structural resonance and flex.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85'
    ],
    '3D Design',
    '3D Modeling',
    'PDF/Case study',
    ARRAY['Hard Surface Modeling', 'Texturing', 'UV Mapping', 'ArchViz'],
    ARRAY['Rhino', 'Blender', 'KeyShot'],
    true,
    false,
    'a0000006-0000-4000-8000-000000000006',
    0,
    NOW() - INTERVAL '18 days'
),
(
    'b0000011-0000-4000-8000-000000000011',
    'nexus-design-system',
    'Nexus System: Multi-Brand Component Engine & Tokens',
    'A unified cross-platform design token architecture supporting high-density dark mode and fluid type scaling.',
    'Nexus formalizes component primitives across Web, iOS, and Figma plugins with synchronized semantic token bindings.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85'
    ],
    'User Interface Design (UI)',
    'Design Systems',
    'Prototype',
    ARRAY['Design Tokens', 'Component Architecture', '8-Point Grid', 'Auto-layout'],
    ARRAY['Figma', 'VS Code', 'Relume'],
    true,
    false,
    'a0000002-0000-4000-8000-000000000002',
    0,
    NOW() - INTERVAL '20 days'
),
(
    'b0000012-0000-4000-8000-000000000012',
    'prism-raymarching-canvas',
    'Prism: Real-time SDF Raymarching & Shading Environment',
    'An interactive browser-based compute shader engine for procedural geometric forms and refraction materials.',
    'Prism compiles custom fragment shaders in real-time, allowing designers to sculpt generative light fields with zero setup.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=85'
    ],
    'Motion Design',
    'UI Animation',
    'Prototype',
    ARRAY['Transitions', 'Easing Curves', 'Compositing', 'Dynamic Graphics'],
    ARRAY['Cinema 4D', 'Rive', 'Spline', 'After Effects'],
    true,
    false,
    'a0000002-0000-4000-8000-000000000002',
    0,
    NOW() - INTERVAL '22 days'
),
(
    'b0000013-0000-4000-8000-000000000013',
    'verve-kinetic-identity',
    'Verve: Kinetic Swiss Typography & Dynamic Posters',
    'An expressive visual identity exploring mathematical typographic grids and reactive motion behaviours.',
    'Commissioned for an experimental sound symposium, Verve balances rigorous modernist structure with playful kinetic unpredictability.',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85'
    ],
    'Brand Identity',
    'Visual Strategy',
    'Image',
    ARRAY['Brand Marks', 'Tone of Voice', 'Visual Language', 'Pattern Design'],
    ARRAY['Adobe Illustrator', 'Adobe After Effects', 'Glyphs'],
    true,
    false,
    'a0000001-0000-4000-8000-000000000001',
    0,
    NOW() - INTERVAL '24 days'
),
(
    'b0000014-0000-4000-8000-000000000014',
    'aperture-monograph-journal',
    'Aperture Vol. 03: Large-Format Editorial on Brutalism',
    'A tactile printed journal featuring hand-tipped plates, exposed spine binding, and cold-foil accents.',
    'Printed in limited run of 500 copies on Munken Lynx 150gsm with metallic silver duotone printing.',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1400&auto=format&fit=crop&q=85'
    ],
    'Graphic Design',
    'Book Design',
    'PDF/Case study',
    ARRAY['Layout Composition', 'Grid Systems', 'Pre-press', 'Typography Hierarchy'],
    ARRAY['Adobe InDesign', 'Adobe Illustrator', 'Affinity Designer'],
    true,
    false,
    'a0000004-0000-4000-8000-000000000004',
    0,
    NOW() - INTERVAL '26 days'
),
(
    'b0000015-0000-4000-8000-000000000015',
    'solarium-timber-observatory',
    'Solarium: Curved Glulam Timber & Daylight Acoustics',
    'An off-grid alpine observatory utilizing steam-bent timber ribs and acoustic dampening moss walls.',
    'Engineered using algorithmic structural optimization to withstand extreme snowfall while maximizing winter solar heat gain.',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85'
    ],
    'AR/VR & Spatial Design',
    'Spatial Interfaces',
    'PDF/Case study',
    ARRAY['Spatial Computing', '360 Environments', 'Immersive Experience'],
    ARRAY['Unity', 'Spline', 'ShapesXR', 'Unreal Engine'],
    true,
    false,
    'a0000006-0000-4000-8000-000000000006',
    0,
    NOW() - INTERVAL '28 days'
),
(
    'b0000016-0000-4000-8000-000000000016',
    'concrete-forms-photobook',
    'Forms in Shadow: Post-War Concrete Monoliths Photobook',
    'Monochrome medium-format film documentation of forgotten concrete monuments and architectural scale.',
    'A hardbound 200-page monograph documenting brutalist monuments throughout Eastern Europe.',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop&q=85',
    ARRAY[
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop&q=85'
    ],
    'Graphic Design',
    'Poster Design',
    'Image',
    ARRAY['Layout Composition', 'Color Theory', 'Print Production'],
    ARRAY['Adobe InDesign', 'Adobe Photoshop', 'Capture One'],
    true,
    false,
    'a0000003-0000-4000-8000-000000000003',
    0,
    NOW() - INTERVAL '30 days'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    body = EXCLUDED.body,
    cover_image = EXCLUDED.cover_image,
    gallery_images = EXCLUDED.gallery_images,
    category = EXCLUDED.category,
    medium = EXCLUDED.medium,
    tags = EXCLUDED.tags,
    tools = EXCLUDED.tools,
    published = EXCLUDED.published,
    featured = EXCLUDED.featured,
    creator_id = EXCLUDED.creator_id,
    appreciations_count = EXCLUDED.appreciations_count;

-- =============================================================================
-- INITIAL COMMENTS SEED
-- =============================================================================

INSERT INTO public.comments (id, project_id, author_id, content, created_at)
VALUES
(
    'c0000001-0000-4000-8000-000000000001',
    'b0000001-0000-4000-8000-000000000001',
    'a0000002-0000-4000-8000-000000000002',
    'The balance of white space and weight in the type specimen is breathtaking. Superb craft on the debossed cover treatment.',
    NOW() - INTERVAL '2 days'
),
(
    'c0000002-0000-4000-8000-000000000002',
    'b0000001-0000-4000-8000-000000000001',
    'a0000003-0000-4000-8000-000000000003',
    'The tonal sensitivity of the film photography complements the binding choice effortlessly. Beautiful work, Elena.',
    NOW() - INTERVAL '1 day'
),
(
    'c0000003-0000-4000-8000-000000000003',
    'b0000001-0000-4000-8000-000000000001',
    'a0000004-0000-4000-8000-000000000004',
    'That incised grotesque terminal detail is pure gold. Would love to see the physical test prints!',
    NOW() - INTERVAL '4 hours'
),
(
    'c0000004-0000-4000-8000-000000000004',
    'b0000002-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'The spring dynamics on node snapping feel so organic. Incredible work on the density tokens Kai.',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- INITIAL NOTIFICATIONS SEED
-- =============================================================================

INSERT INTO public.notifications (id, recipient_id, actor_id, type, project_id, content, read, created_at)
VALUES
(
    'd0000001-0000-4000-8000-000000000001',
    'a0000001-0000-4000-8000-000000000001',
    'a0000002-0000-4000-8000-000000000002',
    'appreciation',
    'b0000001-0000-4000-8000-000000000001',
    'Kai Sato appreciated your project Sanctuary',
    false,
    NOW() - INTERVAL '2 hours'
),
(
    'd0000002-0000-4000-8000-000000000002',
    'a0000001-0000-4000-8000-000000000001',
    'a0000004-0000-4000-8000-000000000004',
    'comment',
    'b0000001-0000-4000-8000-000000000001',
    'That incised grotesque terminal detail is pure gold. Would love to see the physical test prints!',
    false,
    NOW() - INTERVAL '5 hours'
),
(
    'd0000003-0000-4000-8000-000000000003',
    'a0000001-0000-4000-8000-000000000001',
    'a0000003-0000-4000-8000-000000000003',
    'follow',
    NULL,
    'Maya Lin started following you',
    false,
    NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- AUTOMATED AUTH TRIGGER (Create profile in public.profiles when user signs up)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    candidate_username TEXT;
    temp_username TEXT;
    counter INT := 1;
BEGIN
    -- Derive clean base username from metadata or email
    candidate_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9_]', '_', 'g')
    );
    
    IF candidate_username IS NULL OR length(candidate_username) < 2 THEN
        candidate_username := 'creator';
    END IF;

    temp_username := candidate_username;

    -- Ensure uniqueness in public.profiles table
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = temp_username AND id <> NEW.id) LOOP
        temp_username := candidate_username || '_' || counter;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        avatar_url,
        bio,
        skills,
        is_verified,
        is_online,
        followers_count
    )
    VALUES (
        NEW.id,
        temp_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        '',
        ARRAY[]::TEXT[],
        false,
        true,
        0
    )
    ON CONFLICT (id) DO UPDATE SET
        username = COALESCE(public.profiles.username, EXCLUDED.username),
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-sync is_verified when auth.users.email_confirmed_at is set/updated
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at <> NEW.email_confirmed_at) THEN
        UPDATE public.profiles
        SET is_verified = true
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- =============================================================================
-- HARD DELETE ACCOUNT RPC (Completely Purges auth.users & public tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated or user session missing.';
    END IF;

    -- 1. Delete all user data from public tables
    DELETE FROM public.notifications WHERE recipient_id = current_user_id OR actor_id = current_user_id;
    DELETE FROM public.follows WHERE follower_id = current_user_id OR following_id = current_user_id;
    DELETE FROM public.appreciations WHERE user_id = current_user_id;
    DELETE FROM public.comments WHERE author_id = current_user_id;
    DELETE FROM public.projects WHERE creator_id = current_user_id;
    DELETE FROM public.profiles WHERE id = current_user_id;

    -- 2. Hard delete authentication record from auth.users
    DELETE FROM auth.users WHERE id = current_user_id;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO anon;
