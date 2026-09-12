-- =============================================================================
-- Migration: 20260919_fix_board_permissions_rls.sql
-- Description: Fix RLS policies for boards and board_items to allow private boards
-- =============================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE IF EXISTS public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.board_items ENABLE ROW LEVEL SECURITY;

-- 2. Boards SELECT Policy: Public boards are viewable by all; private boards viewable by owner or admin
DROP POLICY IF EXISTS "Boards are viewable by owner or public if not private" ON public.boards;
CREATE POLICY "Boards are viewable by owner or public if not private"
  ON public.boards FOR SELECT
  USING (
    COALESCE(is_private, false) = false 
    OR auth.uid() = user_id 
    OR (SELECT public.is_admin(auth.uid()))
  );

-- 3. Boards INSERT Policy: Authenticated users can insert their own boards
DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
CREATE POLICY "Users can insert their own boards"
  ON public.boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Boards UPDATE Policy: Owners or admins can update boards
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards"
  ON public.boards FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (SELECT public.is_admin(auth.uid()))
  );

-- 5. Boards DELETE Policy: Owners or admins can delete boards
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards"
  ON public.boards FOR DELETE
  USING (
    auth.uid() = user_id 
    OR (SELECT public.is_admin(auth.uid()))
  );

-- 6. Board Items SELECT Policy: Viewable if the parent board is viewable
DROP POLICY IF EXISTS "Board items viewable by board viewers" ON public.board_items;
CREATE POLICY "Board items viewable by board viewers"
  ON public.board_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id 
        AND (
          COALESCE(b.is_private, false) = false 
          OR b.user_id = auth.uid() 
          OR (SELECT public.is_admin(auth.uid()))
        )
    )
  );

-- 7. Board Items INSERT Policy: Only the board owner or admin can add items
DROP POLICY IF EXISTS "Users can insert into their own boards" ON public.board_items;
CREATE POLICY "Users can insert into their own boards"
  ON public.board_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id 
        AND (b.user_id = auth.uid() OR (SELECT public.is_admin(auth.uid())))
    )
  );

-- 8. Board Items DELETE Policy: Only the board owner or admin can remove items
DROP POLICY IF EXISTS "Users can delete from their own boards" ON public.board_items;
CREATE POLICY "Users can delete from their own boards"
  ON public.board_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id 
        AND (b.user_id = auth.uid() OR (SELECT public.is_admin(auth.uid())))
    )
  );
