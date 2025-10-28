-- Chat messages table for realtime demo (-3)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room text NOT NULL DEFAULT 'lobby',
  user_id text NOT NULL,  -- Changed to text for anonymous users
  user_name text NOT NULL, -- Added missing user_name field
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

