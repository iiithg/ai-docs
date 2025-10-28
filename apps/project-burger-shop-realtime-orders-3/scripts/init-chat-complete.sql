-- =============================================================================
-- Complete Chat Initialization Script for Realtime Orders Demo (Project 3)
-- =============================================================================
-- This script contains all necessary SQL commands to set up the chat functionality
-- including table creation, RLS policies, and security settings.

-- -----------------------------------------------------------------------------
-- 1. Create chat_messages table
-- -----------------------------------------------------------------------------
-- Chat messages table for realtime demo (-3) - No Auth Required
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Disable Row Level Security for public access
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Drop any existing RLS Policies (since we're removing auth)
-- -----------------------------------------------------------------------------
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "chat read auth" ON public.chat_messages;
DROP POLICY IF EXISTS "chat write auth" ON public.chat_messages;

-- No RLS policies needed - public access allowed

-- -----------------------------------------------------------------------------
-- 3. Grant public access permissions
-- -----------------------------------------------------------------------------
-- Grant usage on the table to anonymous users (public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO anon;

-- -----------------------------------------------------------------------------
-- 4. Completion status
-- -----------------------------------------------------------------------------
-- Force PostgREST to reload schema cache (avoids "not found in schema cache")
-- This is safe to run on Supabase projects.
select pg_notify('pgrst', 'reload schema');

-- Quick sanity checks
select to_regclass('public.chat_messages') as exists_in_db;  -- should be public.chat_messages

SELECT 'Chat initialization complete - table created, public access granted, schema cache reloaded' AS status;
