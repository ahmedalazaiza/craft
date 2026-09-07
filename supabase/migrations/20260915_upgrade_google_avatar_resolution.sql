-- =============================================================================
-- Migration: Upgrade Google OAuth Avatar Resolution to High Definition
-- Date: 2026-09-15
-- Description:
--   By default, Google OAuth metadata returns profile pictures at 96x96 pixels (=s96-c),
--   which appear pixelated and blurry on High-DPI/Retina screens and profile cards.
--   This migration:
--   1. Updates handle_new_user() trigger function to sanitize and upscale Google avatar
--      URLs from =s96-c to =s400-c automatically upon registration.
--   2. Backfills and upgrades all existing Google avatars in public.profiles.
-- =============================================================================

-- 1. UPDATE handle_new_user() TRIGGER FUNCTION
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

    -- Upgrade Google OAuth avatars from low-res (e.g. =s96-c) to high-res (=s400-c)
    IF v_avatar_url LIKE '%googleusercontent.com%' THEN
        IF v_avatar_url ~ '=s[0-9]+' THEN
            v_avatar_url := regexp_replace(v_avatar_url, '=s[0-9]+.*$', '=s400-c');
        ELSIF v_avatar_url ~ '/s[0-9]+(-[a-z0-9-]+)*/' THEN
            v_avatar_url := regexp_replace(v_avatar_url, '/s[0-9]+(-[a-z0-9-]+)*/', '/s400-c/');
        ELSIF position('?' in v_avatar_url) = 0 AND position('=' in v_avatar_url) = 0 THEN
            v_avatar_url := v_avatar_url || '=s400-c';
        END IF;
    END IF;

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
        avatar_url = CASE 
            WHEN public.profiles.avatar_url IS NULL OR public.profiles.avatar_url = '' OR public.profiles.avatar_url LIKE '%=s96%'
            THEN EXCLUDED.avatar_url 
            ELSE public.profiles.avatar_url 
        END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RETROACTIVELY UPGRADE ALL EXISTING GOOGLE AVATAR URLS IN PROFILES TABLE
UPDATE public.profiles
SET avatar_url = regexp_replace(avatar_url, '=s[0-9]+.*$', '=s400-c')
WHERE avatar_url LIKE '%googleusercontent.com%'
  AND avatar_url ~ '=s[0-9]+';
