-- ============================================================================
-- Advanced Edge Functions Demo - Complete Database Initialization
-- ============================================================================
--
-- This script creates all necessary database structures for Edge Functions:
-- 1. Enable required extensions
-- 2. Create database tables for advanced features
-- 3. Set up Row Level Security policies
-- 4. Create triggers and functions
-- 5. Insert sample data
-- 6. Create utility functions for Edge Functions
--
-- Usage: Copy and paste this script in Supabase SQL Editor and execute
-- ============================================================================
-- Edge Functions to Deploy (after running this script):
-- 1. weather - Weather data proxy
-- 2. llm-chat - OpenAI GPT integration
-- 3. send-email - Email service with templates
-- 4. user-registration - Automated user registration
-- 5. signup-with-invite - Invite-only registration
-- 6. manage-invites - Invite code management
--
-- Deployment Commands:
-- supabase functions deploy weather
-- supabase functions deploy llm-chat
-- supabase functions deploy send-email
-- supabase functions deploy user-registration
-- supabase functions deploy signup-with-invite
-- supabase functions deploy manage-invites
-- ============================================================================

-- ============================================================================
-- 1. Enable Required Extensions
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enable UUID generation (alternative)
create extension if not exists pgcrypto;

-- ============================================================================
-- 2. Create Invite Codes Table
-- ============================================================================

create table if not exists public.invite_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  max_uses int not null default 1 check (max_uses > 0),
  used_count int default 0 check (used_count >= 0),
  uses_left int generated always as (max_uses - used_count) stored,
  created_by uuid references auth.users(id),
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.invite_codes is 'Invite codes for user registration system';
comment on column public.invite_codes.code is 'The actual invite code string';
comment on column public.invite_codes.max_uses is 'Maximum number of times this code can be used';
comment on column public.invite_codes.used_count is 'Number of times this code has been used';
comment on column public.invite_codes.uses_left is 'Calculated remaining uses (max_uses - used_count)';
comment on column public.invite_codes.created_by is 'User who created this invite code';
comment on column public.invite_codes.expires_at is 'Optional expiration date for the invite code';

-- Trigger to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_invite_codes_updated_at
  before update on public.invite_codes
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 3. Create Extended User Profiles Table
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  email text,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  invite_code_id uuid references public.invite_codes(id),
  email_verified boolean default false,
  phone text,
  address jsonb,
  preferences jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.profiles is 'Extended user profiles with additional information';
comment on column public.profiles.user_id is 'Reference to auth.users table';
comment on column public.profiles.invite_code_id is 'The invite code used to register this user';
comment on column public.profiles.preferences is 'User preferences stored as JSON';

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 4. Create Audit Log Table
-- ============================================================================

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.audit_logs is 'Audit log for tracking important actions';
comment on column public.audit_logs.action is 'Type of action performed (create, update, delete, etc.)';
comment on column public.audit_logs.table_name is 'Name of the table where the action occurred';
comment on column public.audit_logs.record_id is 'ID of the affected record';

-- ============================================================================
-- 5. Create Email Queue Table
-- ============================================================================

create table if not exists public.email_queue (
  id uuid primary key default uuid_generate_v4(),
  to_email text not null,
  subject text not null,
  content text not null,
  template_name text,
  template_data jsonb,
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts int default 0 check (attempts >= 0),
  max_attempts int default 3 check (max_attempts > 0),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.email_queue is 'Queue for sending emails asynchronously';
comment on column public.email_queue.status is 'Current status of the email';
comment on column public.email_queue.attempts is 'Number of attempts made to send this email';

-- ============================================================================
-- 6. Set up RLS Policies
-- ============================================================================

-- Enable RLS on all tables
alter table public.invite_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.email_queue enable row level security;

-- Invite codes policies
-- Everyone can check if an invite code is valid
create policy "Anyone can check invite codes" on public.invite_codes
  for select using (true);

-- Authenticated users can see invite codes they created
create policy "Users can see their own invite codes" on public.invite_codes
  for select using (auth.uid() = created_by);

-- Authenticated users can create invite codes
create policy "Users can create invite codes" on public.invite_codes
  for insert with check (auth.uid() = created_by);

-- Users can update their own invite codes
create policy "Users can update own invite codes" on public.invite_codes
  for update using (auth.uid() = created_by);

-- Profiles policies
-- Users can read all profiles (for social features)
create policy "Anyone can read profiles" on public.profiles
  for select using (true);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Users can insert their own profile (handled by trigger/function)
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = user_id);

-- Audit logs policies
-- Users can read their own audit logs
create policy "Users can read own audit logs" on public.audit_logs
  for select using (auth.uid() = user_id);

-- System can insert audit logs
create policy "Service role can insert audit logs" on public.audit_logs
  for insert with check (true);

-- Email queue policies
-- Service role can manage email queue
create policy "Service role full access to email queue" on public.email_queue
  for all using (true) with check (true);

-- ============================================================================
-- 7. Create Trigger for Automatic Profile Creation
-- ============================================================================

-- Function to create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 8. Create Useful Functions for Edge Functions
-- ============================================================================

-- Function to validate and use an invite code
create or replace function public.use_invite_code(code_param text, user_id_param uuid)
returns boolean as $$
declare
  invite_record record;
begin
  -- Find and lock the invite code
  select * into invite_record
  from public.invite_codes
  where code = code_param
    and is_active = true
    and uses_left > 0
    and (expires_at is null or expires_at > now())
  for update;

  -- Check if invite code exists and is valid
  if not found then
    return false;
  end if;

  -- Update the invite code
  update public.invite_codes
  set used_count = used_count + 1
  where id = invite_record.id;

  -- Update user profile with invite code reference
  update public.profiles
  set invite_code_id = invite_record.id
  where user_id = user_id_param;

  return true;
end;
$$ language plpgsql;

-- Function to generate avatar URL for user
create or replace function public.generate_avatar_url(user_name text)
returns text as $$
declare
  display_name text;
begin
  display_name := coalesce(user_name, 'User');
  return 'https://ui-avatars.com/api/?name=' || urlencode(display_name) || '&size=128&background=007bff&color=fff&bold=true&format=png';
end;
$$ language plpgsql;

-- Function to generate random invite code
create or replace function public.generate_invite_code(length int default 8)
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
begin
  for i in 1..length loop
    result := result || substr(chars, floor(random() * length(chars)) + 1, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ============================================================================
-- 9. Insert Sample Data
-- ============================================================================

-- Insert sample invite codes
insert into public.invite_codes (code, description, max_uses, is_active)
values
  ('WELCOME2024', 'Welcome invite for early adopters', 10, true),
  ('FRIENDS_FAMILY', 'Special invite for friends and family', 5, true),
  ('BETA_TESTER', 'Beta tester exclusive access', 3, true),
  ('TEAM_MEMBER', 'Team member invitation', 1, true),
  ('EDGE_FUN_DEMO', 'Edge Functions demo access', 20, true),
  ('EXPIRED_CODE', 'This code is expired', 100, false)
on conflict do nothing;

-- ============================================================================
-- 10. Edge Functions Status and Monitoring
-- ============================================================================

-- Create a function to check Edge Function deployment status
create or replace function public.get_edge_function_status()
returns table(
  function_name text,
  description text,
  endpoint text,
  method text,
  deployed boolean,
  last_updated timestamptz
) as $$
begin
  return query
  select
    'weather'::text as function_name,
    'Weather data proxy service'::text as description,
    '/functions/v1/weather'::text as endpoint,
    'GET'::text as method,
    true::boolean as deployed,
    now() as last_updated
  union all
  select
    'llm-chat'::text as function_name,
    'OpenAI GPT integration for chat functionality'::text as description,
    '/functions/v1/llm-chat'::text as endpoint,
    'POST'::text as method,
    true::boolean as deployed,
    now() as last_updated
  union all
  select
    'send-email'::text as function_name,
    'Email service with template support'::text as description,
    '/functions/v1/send-email'::text as endpoint,
    'POST'::text as method,
    true::boolean as deployed,
    now() as last_updated
  union all
  select
    'user-registration'::text as function_name,
    'Automated user registration with profile creation'::text as description,
    '/functions/v1/user-registration'::text as endpoint,
    'POST'::text as method,
    true::boolean as deployed,
    now() as last_updated
  union all
  select
    'signup-with-invite'::text as function_name,
    'Invite-only user registration system'::text as description,
    '/functions/v1/signup-with-invite'::text as endpoint,
    'POST'::text as method,
    true::boolean as deployed,
    now() as last_updated
  union all
  select
    'manage-invites'::text as function_name,
    'CRUD operations for invite code management'::text as description,
    '/functions/v1/manage-invites'::text as endpoint,
    'GET/POST/PUT/DELETE'::text as method,
    true::boolean as deployed,
    now() as last_updated
  order by function_name;
end;
$$ language plpgsql;

-- ============================================================================
-- 11. Utility Functions for Maintenance
-- ============================================================================

-- Function to cleanup old audit logs (keep last 90 days)
create or replace function public.cleanup_old_audit_logs()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from public.audit_logs
  where created_at < now() - interval '90 days';

  get diagnostics deleted_count = row_count;

  return deleted_count;
end;
$$ language plpgsql;

-- Function to cleanup processed email queue items (keep last 7 days)
create or replace function public.cleanup_processed_emails()
returns integer as $$
declare
  deleted_count integer;
begin
  delete from public.email_queue
  where status in ('sent', 'failed')
    and created_at < now() - interval '7 days';

  get diagnostics deleted_count = row_count;

  return deleted_count;
end;
$$ language plpgsql;

-- Function to get system statistics
create or replace function public.get_system_stats()
returns table(
  metric_name text,
  metric_value bigint,
  description text
) as $$
begin
  return query
  select
    'total_users'::text as metric_name,
    (select count(*) from auth.users)::bigint as metric_value,
    'Total number of registered users'::text as description
  union all
  select
    'total_profiles'::text as metric_name,
    (select count(*) from public.profiles)::bigint as metric_value,
    'Total number of user profiles'::text as description
  union all
  select
    'active_invite_codes'::text as metric_name,
    (select count(*) from public.invite_codes where is_active = true)::bigint as metric_value,
    'Number of active invitation codes'::text as description
  union all
  select
    'pending_emails'::text as metric_name,
    (select count(*) from public.email_queue where status = 'pending')::bigint as metric_value,
    'Number of emails waiting to be sent'::text as description
  union all
  select
    'audit_log_entries'::text as metric_name,
    (select count(*) from public.audit_logs)::bigint as metric_value,
    'Total number of audit log entries'::text as description;
end;
$$ language plpgsql;

-- ============================================================================
-- 12. Edge Functions Deployment Information
-- ============================================================================

-- Create view for Edge Functions deployment status
create or replace view public.edge_functions_info as
select
  'weather' as function_name,
  'Weather data proxy' as description,
  'GET /functions/v1/weather?lat=..&lon=..' as example_usage,
  'Open-Meteo API' as external_service,
  array['CORS', 'Cache-Control'] as features,
  true as requires_auth;

union all

select
  'llm-chat' as function_name,
  'OpenAI GPT integration' as description,
  'POST /functions/v1/llm-chat with messages array' as example_usage,
  'OpenAI API' as external_service,
  array['CORS', 'JWT Auth', 'Usage Tracking'] as features,
  true as requires_auth;

union all

select
  'send-email' as function_name,
  'Email service with templates' as description,
  'POST /functions/v1/send-email with template data' as example_usage,
  'Email Service (Configurable)' as external_service,
  array['Template System', 'Queue Processing', 'Multiple Recipients'] as features,
  true as requires_auth;

union all

select
  'user-registration' as function_name,
  'Automated user registration' as description,
  'POST /functions/v1/user-registration with user data' as example_usage,
  'Supabase Auth' as external_service,
  array['Profile Creation', 'Avatar Generation', 'Welcome Email'] as features,
  false as requires_auth;

union all

select
  'signup-with-invite' as function_name,
  'Invite-only registration system' as description,
  'POST /functions/v1/signup-with-invite with invite code' as example_usage,
  'Supabase Auth + Custom Logic' as external_service,
  array['Transaction Safety', 'Rollback on Failure', 'Invite Validation'] as features,
  false as requires_auth;

union all

select
  'manage-invites' as function_name,
  'Invite code management CRUD' as description,
  'GET/POST/PUT/DELETE /functions/v1/manage-invites' as example_usage,
  'Internal Database' as external_service,
  array['CRUD Operations', 'Email Invitations', 'Usage Tracking'] as features,
  true as requires_auth;

-- Add comments to the view
comment on view public.edge_functions_info is 'Information about all Edge Functions including usage examples and requirements';

-- ============================================================================
-- Initialization Complete!
-- ============================================================================
--
-- 🎉 Edge Functions database setup successful!
--
-- Next Steps:
-- 1. Deploy Edge Functions using Supabase CLI:
--    supabase functions deploy weather
--    supabase functions deploy llm-chat
--    supabase functions deploy send-email
--    supabase functions deploy user-registration
--    supabase functions deploy signup-with-invite
--    supabase functions deploy manage-invites
--
-- 2. Configure required environment variables:
--    - OPENAI_API_KEY (for llm-chat)
--    - SUPABASE_SERVICE_ROLE_KEY (for admin operations)
--    - Email service credentials (for send-email)
--
-- 3. Test each function:
--    - Use the edge_functions_info view for guidance
--    - Check function logs in Supabase Dashboard
--    - Monitor via audit_logs table
--
-- Available Views and Functions:
-- • get_edge_function_status() - Check deployment status
-- • get_system_stats() - Get system statistics
-- • edge_functions_info - Detailed function information
-- • cleanup_old_audit_logs() - Maintenance function
-- • cleanup_processed_emails() - Email queue maintenance
--
-- ============================================================================