-- =============================================================================
-- Complete Reset Script for Chat Tables
-- =============================================================================
-- This script performs a complete reset: cleanup old tables + create new ones
-- Use this for a fresh start with correct table structure

-- -----------------------------------------------------------------------------
-- STEP 1: CLEANUP OLD TABLES
-- -----------------------------------------------------------------------------
SELECT '🧹 Starting cleanup of old tables...' AS step;

DO $$
BEGIN
  IF to_regclass('public.chat_messages') IS NOT NULL THEN
    -- Drop all existing RLS policies (only if table exists)
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

    -- Drop table completely
    EXECUTE 'DROP TABLE IF EXISTS public.chat_messages CASCADE';
  ELSE
    RAISE NOTICE 'public.chat_messages does not exist; skipping policy/revoke/drop.';
  END IF;
END $$;

-- Clean up any remaining objects (safe even if they do not exist)
DROP VIEW IF EXISTS public.chat_messages_view CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_chat_message() CASCADE;

SELECT '✅ Cleanup completed!' AS step;

-- -----------------------------------------------------------------------------
-- STEP 2: CREATE NEW TABLE WITH CORRECT STRUCTURE
-- -----------------------------------------------------------------------------
SELECT '🏗️ Creating new table with correct structure...' AS step;

-- Ensure required extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create chat_messages table with correct structure
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  username text NOT NULL,  -- ✅ Correct field name
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

SELECT '✅ Table created successfully!' AS step;

-- -----------------------------------------------------------------------------
-- STEP 3: CONFIGURE PERMISSIONS (NO AUTH REQUIRED)
-- -----------------------------------------------------------------------------
SELECT '🔐 Configuring permissions...' AS step;

-- Disable Row Level Security for public access
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Grant public access permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON public.chat_messages TO anon;

SELECT '✅ Permissions configured!' AS step;

-- -----------------------------------------------------------------------------
-- STEP 4: VERIFY SETUP
-- -----------------------------------------------------------------------------
SELECT '🔍 Verifying setup...' AS step;

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = false THEN '✅ RLS Disabled (Public Access)'
    ELSE '⚠️ RLS Enabled'
  END AS rls_status
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- Check permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'chat_messages'
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- -----------------------------------------------------------------------------
-- STEP 5: FINAL INSTRUCTIONS
-- -----------------------------------------------------------------------------
-- Add table to Realtime publication if not already present
SELECT '📡 Ensuring Realtime publication contains chat_messages...' AS step;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages';
  END IF;
END $$;

-- Reload PostgREST schema cache to reflect new table/privileges
SELECT pg_notify('pgrst', 'reload schema');

SELECT '🎉 Reset completed successfully!' AS step;
SELECT '📋 Next steps:' AS instruction;
SELECT '1. Go to Supabase Dashboard > Database > Replication' AS instruction;
SELECT '2. Ensure realtime replication is enabled (script attempted to add it automatically)' AS instruction;
SELECT '3. Refresh your application and test messaging' AS instruction;
