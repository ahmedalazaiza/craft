-- =============================================================================
-- Migration: 20260912_create_boards_tables.sql
-- Description: Creates the 'boards' and 'board_items' tables for user-curated moodboards
-- =============================================================================

-- 1. Create boards table
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create board_items table (junction table between boards and projects)
CREATE TABLE IF NOT EXISTS public.board_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_board_project UNIQUE (board_id, project_id)
);

-- 3. Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON public.boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON public.boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_items_board_id ON public.board_items(board_id);
CREATE INDEX IF NOT EXISTS idx_board_items_project_id ON public.board_items(project_id);
CREATE INDEX IF NOT EXISTS idx_board_items_created_at ON public.board_items(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for boards
DROP POLICY IF EXISTS "Boards are viewable by owner or public if not private" ON public.boards;
CREATE POLICY "Boards are viewable by owner or public if not private"
  ON public.boards FOR SELECT
  USING (is_private = false OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
CREATE POLICY "Users can insert their own boards"
  ON public.boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards"
  ON public.boards FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards"
  ON public.boards FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS Policies for board_items
DROP POLICY IF EXISTS "Board items viewable by board viewers" ON public.board_items;
CREATE POLICY "Board items viewable by board viewers"
  ON public.board_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND (b.is_private = false OR b.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert into their own boards" ON public.board_items;
CREATE POLICY "Users can insert into their own boards"
  ON public.board_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete from their own boards" ON public.board_items;
CREATE POLICY "Users can delete from their own boards"
  ON public.board_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.boards b
      WHERE b.id = board_id AND b.user_id = auth.uid()
    )
  );

-- 7. Add tables to realtime publication idempotently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      WHERE p.pubname = 'supabase_realtime' AND c.relname = 'boards'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      WHERE p.pubname = 'supabase_realtime' AND c.relname = 'board_items'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.board_items;
    END IF;
  END IF;
END $$;

