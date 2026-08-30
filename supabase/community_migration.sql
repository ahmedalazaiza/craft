-- =============================================================================
-- CRAFT / LAYERAT — COMMUNITY HUB DATABASE SCHEMA & MIGRATION SCRIPT
-- =============================================================================
-- Execute this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ttjobsgglwgyioqlldqj/sql
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. COMMUNITY POSTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'ab_test', 'poll')),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    -- A/B Test fields
    ab_test_option_a_label TEXT,
    ab_test_option_a_image TEXT,
    ab_test_option_a_votes INTEGER DEFAULT 0,
    ab_test_option_b_label TEXT,
    ab_test_option_b_image TEXT,
    ab_test_option_b_votes INTEGER DEFAULT 0,
    -- Poll fields
    poll_question TEXT,
    poll_options JSONB DEFAULT '[]'::jsonb,
    poll_total_votes INTEGER DEFAULT 0,
    -- Author & Meta
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. COMMUNITY COMMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 3. COMMUNITY LIKES (CLAPPING) TABLE (Supports up to 10 claps per user)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    claps_count INTEGER DEFAULT 1 CHECK (claps_count >= 1 AND claps_count <= 10),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_community_post_user_like UNIQUE(post_id, user_id)
);

-- =============================================================================
-- 4. COMMUNITY VOTES (A/B Test & Poll choice tracking)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.community_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    option_id TEXT NOT NULL, -- 'A', 'B', 'opt-1', 'opt-2', etc.
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_community_post_user_vote UNIQUE(post_id, user_id)
);

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

-- 5.1 Community Posts RLS
DROP POLICY IF EXISTS "Public can view community posts" ON public.community_posts;
CREATE POLICY "Public can view community posts" ON public.community_posts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create community posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create community posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their community posts" ON public.community_posts;
CREATE POLICY "Authors can update their community posts" ON public.community_posts
    FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their community posts" ON public.community_posts;
CREATE POLICY "Authors can delete their community posts" ON public.community_posts
    FOR DELETE USING (auth.uid() = author_id);

-- 5.2 Community Comments RLS
DROP POLICY IF EXISTS "Public can view community comments" ON public.community_comments;
CREATE POLICY "Public can view community comments" ON public.community_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can post community comments" ON public.community_comments;
CREATE POLICY "Authenticated users can post community comments" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete their community comments" ON public.community_comments;
CREATE POLICY "Authors can delete their community comments" ON public.community_comments
    FOR DELETE USING (auth.uid() = author_id);

-- 5.3 Community Likes RLS
DROP POLICY IF EXISTS "Public can view community likes" ON public.community_likes;
CREATE POLICY "Public can view community likes" ON public.community_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can clap for posts" ON public.community_likes;
CREATE POLICY "Authenticated users can clap for posts" ON public.community_likes
    FOR ALL USING (auth.uid() = user_id);

-- 5.4 Community Votes RLS
DROP POLICY IF EXISTS "Public can view community votes" ON public.community_votes;
CREATE POLICY "Public can view community votes" ON public.community_votes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can cast votes" ON public.community_votes;
CREATE POLICY "Authenticated users can cast votes" ON public.community_votes
    FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- 6. REALTIME SUBSCRIPTION ENABLING
-- =============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_votes;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

-- =============================================================================
-- 7. SEED COMMUNITY DATA (With Existing Creator Foreign Keys)
-- =============================================================================
INSERT INTO public.community_posts (
    id,
    type,
    title,
    content,
    category,
    tags,
    ab_test_option_a_label,
    ab_test_option_a_image,
    ab_test_option_a_votes,
    ab_test_option_b_label,
    ab_test_option_b_image,
    ab_test_option_b_votes,
    poll_question,
    poll_options,
    poll_total_votes,
    author_id,
    likes_count,
    created_at
)
SELECT
    'c0000001-0000-4000-8000-000000000001'::uuid,
    'ab_test',
    'Dot Cinema Checkout UX: Bottom Sheet vs Full-Screen Modal?',
    'We are redesigning the seat selection and ticket payment flow for Dot Cinema iOS. Which variant provides higher conversion without cognitive overload?',
    'UI/UX Design',
    ARRAY['iOS', 'A/B Testing', 'Mobile UX', 'FinTech'],
    'Option A: Native Bottom Sheet Modal',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=80',
    42,
    'Option B: Immersive Full-Screen Step Flow',
    'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=1000&auto=format&fit=crop&q=80',
    18,
    NULL,
    '[]'::jsonb,
    0,
    p.id,
    64,
    NOW() - INTERVAL '45 minutes'
FROM public.profiles p
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.community_posts (
    id,
    type,
    title,
    content,
    category,
    tags,
    poll_question,
    poll_options,
    poll_total_votes,
    author_id,
    likes_count,
    created_at
)
SELECT
    'c0000002-0000-4000-8000-000000000002'::uuid,
    'poll',
    'What primary tool is powering your UI component libraries in 2026?',
    'Curious how teams across the region are architecting design tokens and component synchronization between Figma, code, and token engines.',
    'Design Systems',
    ARRAY['Figma', 'Tokens', 'Design Systems', 'Code'],
    'What primary tool is powering your UI component libraries in 2026?',
    '[
        {"id": "opt-1", "text": "Figma Variables & Modes", "votesCount": 54},
        {"id": "opt-2", "text": "Tokens Studio + Style Dictionary", "votesCount": 29},
        {"id": "opt-3", "text": "Code-First (Tailwind / CSS Tokens)", "votesCount": 16},
        {"id": "opt-4", "text": "Framer Component Pipelines", "votesCount": 8}
    ]'::jsonb,
    107,
    p.id,
    91,
    NOW() - INTERVAL '2 hours'
FROM public.profiles p
LIMIT 1
ON CONFLICT (id) DO NOTHING;
