-- Complete Realtime Chat Initialization (Project 3)
-- How to run:
--   Option A (psql/CLI, recommended): psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql
--   Option B (Supabase SQL Editor): Copy all contents, paste+run in SQL Editor.
-- Notes: This script is idempotent and safe to run multiple times.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Disable RLS for public access
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Clean up old policies if they exist
DROP POLICY IF EXISTS "chat read auth" ON public.chat_messages;
DROP POLICY IF EXISTS "chat write auth" ON public.chat_messages;
DROP POLICY IF EXISTS "chat read public" ON public.chat_messages;
DROP POLICY IF EXISTS "chat write public" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages;

-- Grant public access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO anon;

-- Enable realtime replication
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- Reload schema cache
SELECT pg_notify('pgrst', 'reload schema');

SELECT 'Realtime chat initialization complete' AS status;