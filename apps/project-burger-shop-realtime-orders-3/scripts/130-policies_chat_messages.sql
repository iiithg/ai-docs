-- RLS policies: only authenticated users can read/insert
CREATE POLICY "chat read auth" ON public.chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "chat write auth" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

