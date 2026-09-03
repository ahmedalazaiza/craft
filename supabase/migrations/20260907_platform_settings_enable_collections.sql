-- =============================================================================
-- Migration: Add enable_collections toggle to public.platform_settings
-- Allows hiding or showing the Curated Collections feature from the database/dashboard
-- =============================================================================

ALTER TABLE public.platform_settings 
  ADD COLUMN IF NOT EXISTS enable_collections BOOLEAN DEFAULT false;

-- Ensure default global row has enable_collections set to false (off now)
UPDATE public.platform_settings 
SET enable_collections = false 
WHERE id = 'global';
