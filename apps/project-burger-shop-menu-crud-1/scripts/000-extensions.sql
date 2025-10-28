-- Extensions required for the burger shop demo
-- Run this first to enable necessary PostgreSQL extensions

-- Enable UUID generation
create extension if not exists pgcrypto;

-- Enable case-insensitive text operations (optional, useful for search)
create extension if not exists citext;

-- Comments
comment on extension pgcrypto is 'Cryptographic functions including UUID generation';
comment on extension citext is 'Case-insensitive text type for better search functionality';