-- =============================================================================
-- Migration: 20260916_enable_full_realtime_and_notification_triggers.sql
-- Description:
--   1. Enables REPLICA IDENTITY FULL on notifications, projects, appreciations,
--      comments, follows, and profiles so Realtime CDC filters work properly.
--   2. Adds notifications, projects, appreciations, comments, follows, and profiles
--      to the supabase_realtime publication so events stream instantly over WebSocket.
--   3. Sets up RLS policies on public.notifications ensuring Realtime CDC broadcasts
--      to authenticated recipients.
--   4. Creates automated PostgreSQL database triggers for instant notifications
--      on appreciations (likes), comments, and follows directly in the database.
--   5. Creates automated trigger for profile followers_count on follows INSERT/DELETE.
-- =============================================================================

-- 1. SET REPLICA IDENTITY FULL FOR REALTIME CDC FILTERING
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.appreciations REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.follows REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- 2. ENSURE RLS & REALTIME SELECT POLICIES ON NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_select_recipient'
    ) THEN
        CREATE POLICY notifications_select_recipient ON public.notifications
        FOR SELECT TO authenticated
        USING (recipient_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_update_recipient'
    ) THEN
        CREATE POLICY notifications_update_recipient ON public.notifications
        FOR UPDATE TO authenticated
        USING (recipient_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_insert_authenticated'
    ) THEN
        CREATE POLICY notifications_insert_authenticated ON public.notifications
        FOR INSERT TO authenticated
        WITH CHECK (actor_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'notifications' AND policyname = 'notifications_delete_recipient_or_actor'
    ) THEN
        CREATE POLICY notifications_delete_recipient_or_actor ON public.notifications
        FOR DELETE TO authenticated
        USING (recipient_id = auth.uid() OR actor_id = auth.uid());
    END IF;
END $$;

-- 3. ADD ALL ACTION & NOTIFICATION TABLES TO supabase_realtime PUBLICATION
DO $$
BEGIN
    -- notifications
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;

    -- projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    END IF;

    -- appreciations
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'appreciations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.appreciations;
    END IF;

    -- comments
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
    END IF;

    -- follows
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'follows'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
    END IF;

    -- profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
END $$;

-- 4. AUTOMATIC DATABASE TRIGGER: APPRECIATION (LIKE) NOTIFICATION & COUNTER
CREATE OR REPLACE FUNCTION public.handle_appreciation_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_id UUID;
    v_project_title TEXT;
    v_actor_name TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Find creator and title of the project
        SELECT creator_id, title INTO v_creator_id, v_project_title
        FROM public.projects
        WHERE id = NEW.project_id;

        -- Strict business rule: never notify self
        IF v_creator_id IS NOT NULL AND v_creator_id <> NEW.user_id THEN
            -- Get actor display name
            SELECT COALESCE(NULLIF(display_name, ''), NULLIF(username, ''), 'Someone') INTO v_actor_name
            FROM public.profiles
            WHERE id = NEW.user_id;

            -- Deduplicate: insert only if no unread notification exists for this user/project
            IF NOT EXISTS (
                SELECT 1 FROM public.notifications
                WHERE recipient_id = v_creator_id
                  AND actor_id = NEW.user_id
                  AND project_id = NEW.project_id
                  AND type = 'appreciation'
                  AND read = false
            ) THEN
                INSERT INTO public.notifications (
                    id,
                    recipient_id,
                    actor_id,
                    type,
                    project_id,
                    content,
                    read,
                    created_at
                )
                VALUES (
                    gen_random_uuid(),
                    v_creator_id,
                    NEW.user_id,
                    'appreciation',
                    NEW.project_id,
                    v_actor_name || ' appreciated your project "' || COALESCE(v_project_title, 'Untitled') || '"',
                    false,
                    NOW()
                );
            END IF;
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        -- If user un-likes, clean up the unread notification immediately
        SELECT creator_id INTO v_creator_id
        FROM public.projects
        WHERE id = OLD.project_id;

        IF v_creator_id IS NOT NULL THEN
            DELETE FROM public.notifications
            WHERE recipient_id = v_creator_id
              AND actor_id = OLD.user_id
              AND project_id = OLD.project_id
              AND type = 'appreciation'
              AND read = false;
        END IF;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_appreciation_notification ON public.appreciations;
CREATE TRIGGER tr_appreciation_notification
AFTER INSERT OR DELETE ON public.appreciations
FOR EACH ROW EXECUTE FUNCTION public.handle_appreciation_notification();

-- 5. AUTOMATIC DATABASE TRIGGER: COMMENT NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_id UUID;
    v_project_title TEXT;
    v_actor_name TEXT;
    v_snippet TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT creator_id, title INTO v_creator_id, v_project_title
        FROM public.projects
        WHERE id = NEW.project_id;

        -- Never notify self
        IF v_creator_id IS NOT NULL AND v_creator_id <> NEW.author_id THEN
            SELECT COALESCE(NULLIF(display_name, ''), NULLIF(username, ''), 'Someone') INTO v_actor_name
            FROM public.profiles
            WHERE id = NEW.author_id;

            v_snippet := substring(COALESCE(NEW.content, '') from 1 for 60);

            INSERT INTO public.notifications (
                id,
                recipient_id,
                actor_id,
                type,
                project_id,
                content,
                read,
                created_at
            )
            VALUES (
                gen_random_uuid(),
                v_creator_id,
                NEW.author_id,
                'comment',
                NEW.project_id,
                v_actor_name || ' commented on "' || COALESCE(v_project_title, 'Untitled') || '": "' || v_snippet || '"',
                false,
                NOW()
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.notifications
        WHERE actor_id = OLD.author_id
          AND project_id = OLD.project_id
          AND type = 'comment'
          AND read = false;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_comment_notification ON public.comments;
CREATE TRIGGER tr_comment_notification
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notification();

-- 6. AUTOMATIC DATABASE TRIGGER: FOLLOW NOTIFICATION
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_name TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Never notify self
        IF NEW.follower_id <> NEW.following_id THEN
            SELECT COALESCE(NULLIF(display_name, ''), NULLIF(username, ''), 'Someone') INTO v_actor_name
            FROM public.profiles
            WHERE id = NEW.follower_id;

            INSERT INTO public.notifications (
                id,
                recipient_id,
                actor_id,
                type,
                project_id,
                content,
                read,
                created_at
            )
            VALUES (
                gen_random_uuid(),
                NEW.following_id,
                NEW.follower_id,
                'follow',
                NULL,
                v_actor_name || ' started following your studio',
                false,
                NOW()
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.notifications
        WHERE recipient_id = OLD.following_id
          AND actor_id = OLD.follower_id
          AND type = 'follow'
          AND read = false;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_follow_notification ON public.follows;
CREATE TRIGGER tr_follow_notification
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_follow_notification();

-- 7. AUTOMATIC DATABASE TRIGGER: KEEP PROFILES.FOLLOWERS_COUNT ACCURATE
CREATE OR REPLACE FUNCTION public.update_creator_followers_count()
RETURNS TRIGGER AS $$
DECLARE
    target_creator_id UUID;
    real_count INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        target_creator_id := NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        target_creator_id := OLD.following_id;
    END IF;

    IF target_creator_id IS NOT NULL THEN
        SELECT count(*) INTO real_count
        FROM public.follows
        WHERE following_id = target_creator_id;

        UPDATE public.profiles
        SET followers_count = COALESCE(real_count, 0)
        WHERE id = target_creator_id;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_update_creator_followers_count ON public.follows;
CREATE TRIGGER tr_update_creator_followers_count
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.update_creator_followers_count();
