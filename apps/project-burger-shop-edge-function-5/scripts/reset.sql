-- ============================================================================
-- Edge Functions Demo - Database Reset Script
-- ============================================================================
--
-- This script safely removes all Edge Functions demo data and structures.
-- WARNING: This will delete all data and cannot be undone!
--
-- Usage: Copy and paste this script in Supabase SQL Editor and execute
-- ============================================================================

-- ============================================================================
-- 1. Disable Triggers
-- ============================================================================

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists update_invite_codes_updated_at on public.invite_codes;
drop trigger if exists update_profiles_updated_at on public.profiles;

-- ============================================================================
-- 2. Drop Custom Functions
-- ============================================================================

drop function if exists public.update_updated_at_column();
drop function if exists public.handle_new_user();
drop function if exists public.use_invite_code(text, uuid);
drop function if exists public.generate_avatar_url(text);
drop function if exists public.generate_invite_code(integer);
drop function if exists public.get_edge_function_status();
drop function if exists public.get_system_stats();
drop function if exists public.cleanup_old_audit_logs();
drop function if exists public.cleanup_processed_emails();

-- ============================================================================
-- 3. Drop Views
-- ============================================================================

drop view if exists public.edge_functions_info;

-- ============================================================================
-- 4. Drop Tables (in correct order due to dependencies)
-- ============================================================================

-- Drop tables with foreign key dependencies first
drop table if exists public.email_queue;
drop table if exists public.audit_logs;
drop table if exists public.profiles;
drop table if exists public.invite_codes;

-- ============================================================================
-- 5. Remove Comments and Cleanup
-- ============================================================================

-- Comments are automatically dropped when tables/functions are dropped

-- ============================================================================
-- Reset Complete!
-- ============================================================================
--
-- ✅ Edge Functions database structures have been completely removed.
--
-- What was removed:
-- • All database tables (invite_codes, profiles, audit_logs, email_queue)
-- • All custom functions and triggers
-- • All views and utility functions
-- • All RLS policies
--
-- To reinstall:
-- 1. Run scripts/init.sql again
-- 2. Redeploy Edge Functions
-- 3. Configure environment variables
--
-- ============================================================================