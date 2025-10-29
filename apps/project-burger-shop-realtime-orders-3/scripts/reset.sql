-- Complete Reset for Realtime Chat (Project 3)
-- This script completely removes and recreates chat functionality
-- Use for a fresh start when troubleshooting

SELECT '🧹 Starting complete reset...' AS step;

-- Clean up everything
DO $$
BEGIN
  IF to_regclass('public.chat_messages') IS NOT NULL THEN
    -- Drop all policies
    EXECUTE 'DROP POLICY IF EXISTS "chat read auth" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "chat write auth" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "chat read public" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "chat write public" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages';
    EXECUTE 'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages';

    -- Revoke all permissions
    EXECUTE 'REVOKE ALL ON public.chat_messages FROM anon';
    EXECUTE 'REVOKE ALL ON public.chat_messages FROM authenticated';
    EXECUTE 'REVOKE ALL ON public.chat_messages FROM public';

    -- Remove from realtime publication
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.chat_messages';

    -- Drop table
    EXECUTE 'DROP TABLE IF EXISTS public.chat_messages CASCADE';
  END IF;
END $$;

-- Clean up any remaining objects
DROP VIEW IF EXISTS public.chat_messages_view CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_chat_message() CASCADE;

SELECT '✅ Cleanup completed!' AS step;
SELECT '🏗️ Creating fresh table...' AS step;

-- Create table from scratch
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Configure for public access
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO anon;

-- Enable realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

SELECT '🎉 Reset completed successfully!' AS step;
SELECT '📋 Table ready for realtime chat functionality' AS status;