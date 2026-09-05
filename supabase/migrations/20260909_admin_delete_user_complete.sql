-- =============================================================================
-- MIGRATION: 20260909_admin_delete_user_complete.sql
-- DESCRIPTION: Super Admin Hard Deletion RPC for Complete User & Asset Purge
-- AUTHORIZATION: Only active Super Admins / Admins
-- TARGET: Purges public tables (projects, comments, likes, follows, notifications,
--         reports, profile, admin_users) AND auth.users credentials.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_delete_user_complete(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    caller_id UUID;
    caller_email TEXT;
    is_caller_authorized BOOLEAN := false;
    deleted_project_ids UUID[] := '{}'::uuid[];
    deleted_media_urls TEXT[] := '{}'::text[];
    creator_avatar_url TEXT;
    project_rec RECORD;
    res JSONB;
BEGIN
    caller_id := auth.uid();
    
    -- 1. Security check: Caller must be authenticated
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated.';
    END IF;

    -- 2. Guard: Prevent self-deletion via admin endpoint
    IF caller_id = target_user_id THEN
        RAISE EXCEPTION 'Safety Violation: Administrators cannot delete their own account from the admin dashboard.';
    END IF;

    -- 3. Check authorization: is_super_admin, is_admin, or matches root admin email
    SELECT email INTO caller_email FROM auth.users WHERE id = caller_id;
    
    IF caller_email = 'ahmedazy.uxui@gmail.com' THEN
        is_caller_authorized := true;
    ELSIF EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE user_id = caller_id AND status = 'active' AND role IN ('super_admin', 'editorial_director', 'admin')
    ) THEN
        is_caller_authorized := true;
    ELSIF EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = caller_id AND role = 'admin'
    ) THEN
        is_caller_authorized := true;
    END IF;

    IF NOT is_caller_authorized THEN
        RAISE EXCEPTION 'Forbidden: Insufficient privileges to perform complete user purge.';
    END IF;

    -- 4. Guard against deleting root super admin
    IF EXISTS (
        SELECT 1 FROM auth.users WHERE id = target_user_id AND email = 'ahmedazy.uxui@gmail.com'
    ) THEN
        RAISE EXCEPTION 'Safety Violation: The Root Super Admin account cannot be deleted.';
    END IF;

    -- 5. Collect all media URLs for storage cleanup
    SELECT avatar_url INTO creator_avatar_url FROM public.profiles WHERE id = target_user_id;
    
    IF creator_avatar_url IS NOT NULL AND creator_avatar_url <> '' THEN
        deleted_media_urls := array_append(deleted_media_urls, creator_avatar_url);
    END IF;

    FOR project_rec IN 
        SELECT id, cover_image, gallery_images FROM public.projects WHERE creator_id = target_user_id
    LOOP
        deleted_project_ids := array_append(deleted_project_ids, project_rec.id);
        IF project_rec.cover_image IS NOT NULL AND project_rec.cover_image <> '' THEN
            deleted_media_urls := array_append(deleted_media_urls, project_rec.cover_image);
        END IF;
        IF project_rec.gallery_images IS NOT NULL AND array_length(project_rec.gallery_images, 1) > 0 THEN
            deleted_media_urls := deleted_media_urls || project_rec.gallery_images;
        END IF;
    END LOOP;

    -- 6. Remove target's projects from curated collections
    IF deleted_project_ids IS NOT NULL AND array_length(deleted_project_ids, 1) > 0 THEN
        UPDATE public.collections
        SET project_ids = (
            SELECT COALESCE(array_agg(p_id), '{}'::uuid[])
            FROM unnest(project_ids) AS p_id
            WHERE p_id <> ALL(deleted_project_ids)
        )
        WHERE project_ids && deleted_project_ids;
    END IF;

    -- 7. Purge related social/activity records
    DELETE FROM public.notifications 
    WHERE recipient_id = target_user_id OR actor_id = target_user_id;

    DELETE FROM public.follows 
    WHERE follower_id = target_user_id OR following_id = target_user_id;

    DELETE FROM public.appreciations 
    WHERE user_id = target_user_id 
       OR (deleted_project_ids IS NOT NULL AND array_length(deleted_project_ids, 1) > 0 AND project_id = ANY(deleted_project_ids));

    DELETE FROM public.comments 
    WHERE author_id = target_user_id 
       OR (deleted_project_ids IS NOT NULL AND array_length(deleted_project_ids, 1) > 0 AND project_id = ANY(deleted_project_ids));

    DELETE FROM public.reports 
    WHERE reporter_id = target_user_id 
       OR reported_creator_id = target_user_id 
       OR (deleted_project_ids IS NOT NULL AND array_length(deleted_project_ids, 1) > 0 AND project_id = ANY(deleted_project_ids));

    -- 8. Delete all projects
    DELETE FROM public.projects WHERE creator_id = target_user_id;

    -- 9. Delete from admin_users if present
    DELETE FROM public.admin_users WHERE user_id = target_user_id;

    -- 10. Delete profile
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- 11. Hard delete authentication record from auth.users (destroys email and credentials)
    DELETE FROM auth.users WHERE id = target_user_id;

    res := jsonb_build_object(
        'success', true,
        'purged_user_id', target_user_id,
        'deleted_projects_count', COALESCE(array_length(deleted_project_ids, 1), 0),
        'media_urls', deleted_media_urls
    );

    RETURN res;
END;
$$;

-- Grant execution to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.admin_delete_user_complete(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user_complete(UUID) TO service_role;
