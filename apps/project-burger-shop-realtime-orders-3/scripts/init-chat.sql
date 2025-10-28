-- =============================================================================
-- Complete Chat Initialization Script for Realtime Orders Demo (Project 3)
-- =============================================================================
-- This script contains all necessary SQL commands to set up the chat functionality
-- including table creation, RLS policies, and security settings.

-- -----------------------------------------------------------------------------
-- 1. Create chat_messages table
-- -----------------------------------------------------------------------------
-- Chat messages table for realtime demo (-3)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  user_id text NOT NULL,  -- Changed to text for anonymous users
  user_name text NOT NULL, -- Added missing user_name field
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. Create RLS Policies
-- -----------------------------------------------------------------------------
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "chat read auth" ON public.chat_messages;
DROP POLICY IF EXISTS "chat write auth" ON public.chat_messages;

-- RLS policies: only authenticated users can read/insert
CREATE POLICY "chat read auth" ON public.chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "chat write auth" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 3. Grant necessary permissions (optional, for completeness)
-- -----------------------------------------------------------------------------
-- Grant usage on the table to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Completion status
-- -----------------------------------------------------------------------------
SELECT 'Chat initialization complete - table created, RLS enabled, policies set' AS status;

