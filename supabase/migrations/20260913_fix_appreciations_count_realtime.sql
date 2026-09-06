-- =============================================================================
-- Migration: 20260913_fix_appreciations_count_realtime.sql
-- Description: Fixes appreciations counter trigger to be SECURITY DEFINER,
-- calculates true exact count directly from public.appreciations rows,
-- and resynchronizes all projects with real counts.
-- =============================================================================

-- 1. Create or replace the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_project_appreciations_count()
RETURNS TRIGGER AS $$
DECLARE
    target_project_id UUID;
    real_count INTEGER;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        target_project_id := NEW.project_id;
    ELSIF (TG_OP = 'DELETE') THEN
        target_project_id := OLD.project_id;
    END IF;

    IF target_project_id IS NOT NULL THEN
        -- Accurately count exact appreciation rows for this project
        SELECT count(*) INTO real_count
        FROM public.appreciations
        WHERE project_id = target_project_id;

        -- Update projects table with the real count (bypasses RLS because SECURITY DEFINER)
        UPDATE public.projects
        SET appreciations_count = COALESCE(real_count, 0)
        WHERE id = target_project_id;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure trigger is attached to public.appreciations
DROP TRIGGER IF EXISTS tr_update_project_appreciations_count ON public.appreciations;
CREATE TRIGGER tr_update_project_appreciations_count
AFTER INSERT OR DELETE ON public.appreciations
FOR EACH ROW EXECUTE FUNCTION public.update_project_appreciations_count();

-- 3. Resynchronize all existing projects appreciations_count to match exact rows in appreciations table
UPDATE public.projects p
SET appreciations_count = (
    SELECT count(*)
    FROM public.appreciations a
    WHERE a.project_id = p.id
);
