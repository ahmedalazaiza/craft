-- =============================================================================
-- MIGRATION: 20260914_add_auth_provider_to_profiles.sql
-- DESCRIPTION: Adds auth_provider tracking (google vs email) to public.profiles,
--              backfills existing records, and updates handle_new_user() trigger
-- =============================================================================

-- 1. ADD COLUMN auth_provider TO public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- 2. CREATE INDEX FOR FAST FILTERING AND DASHBOARD AUDITING
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles (auth_provider);

-- 3. BACKFILL EXISTING PROFILES FROM auth.users
UPDATE public.profiles p
SET auth_provider = COALESCE(
  CASE 
    WHEN u.raw_app_meta_data->>'provider' = 'google' THEN 'google'
    WHEN u.raw_app_meta_data->>'providers' ILIKE '%google%' THEN 'google'
    ELSE 'email'
  END,
  'email'
)
FROM auth.users u
WHERE p.id = u.id;

-- 4. UPDATE handle_new_user() TRIGGER FUNCTION TO CAPTURE auth_provider & GOOGLE DATA
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    candidate_username TEXT;
    temp_username TEXT;
    counter INT := 1;
    v_auth_provider TEXT;
    v_avatar_url TEXT;
    v_display_name TEXT;
    v_is_verified BOOLEAN;
BEGIN
    -- Determine authentication provider (google vs email)
    v_auth_provider := COALESCE(
        NEW.raw_app_meta_data->>'provider',
        CASE WHEN NEW.raw_app_meta_data->>'providers' ILIKE '%google%' THEN 'google' ELSE 'email' END
    );

    v_display_name := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        NULLIF(NEW.raw_user_meta_data->>'name', ''),
        split_part(NEW.email, '@', 1)
    );

    v_avatar_url := COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(NEW.raw_user_meta_data->>'picture', ''),
        ''
    );

    v_is_verified := CASE 
        WHEN NEW.email_confirmed_at IS NOT NULL THEN true 
        WHEN v_auth_provider = 'google' THEN true
        ELSE false 
    END;

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
        followers_count,
        auth_provider
    )
    VALUES (
        NEW.id,
        temp_username,
        v_display_name,
        NEW.email,
        v_avatar_url,
        COALESCE(NEW.raw_user_meta_data->>'bio', ''),
        '{}',
        v_is_verified,
        false,
        false,
        'member',
        0,
        v_auth_provider
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        auth_provider = COALESCE(EXCLUDED.auth_provider, public.profiles.auth_provider),
        is_verified = CASE WHEN EXCLUDED.is_verified = true THEN true ELSE public.profiles.is_verified END,
        avatar_url = CASE WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
