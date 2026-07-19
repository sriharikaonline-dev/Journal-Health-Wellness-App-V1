/*
# Allow anonymous visitors to use the questions chat

## Why
The chat bubble only showed for signed-in team members, but visitors should be
able to ask the team questions too. Anonymous visitors get a client-generated
session id (stored in localStorage); their messages are tagged with it so they
can retrieve their own thread and see the owner's replies.

## Changes
- chat_messages.user_id is now nullable (anon has no auth.uid()).
- New column chat_messages.anon_session_id (text, nullable).
- New RLS policies:
  - anon INSERT when user_id IS NULL (visitor posting a question).
  - anon SELECT of their own session's messages (anon_session_id matches).
- Authenticated policies unchanged.

## Data safety
- ALTER COLUMN ... DROP NOT NULL is the only structural change; no data is lost.
  Existing rows keep their user_id and have anon_session_id = NULL.
- No columns dropped, renamed, or retyped.
*/

ALTER TABLE public.chat_messages
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS anon_session_id text;

-- anon can insert their own (user_id null, anon_session_id set)
DROP POLICY IF EXISTS "anon_insert_chat_messages" ON public.chat_messages;
CREATE POLICY "anon_insert_chat_messages"
  ON public.chat_messages FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL AND anon_session_id IS NOT NULL);

-- anon can read their own session's messages (and the team's replies on them)
DROP POLICY IF EXISTS "anon_select_own_chat_messages" ON public.chat_messages;
CREATE POLICY "anon_select_own_chat_messages"
  ON public.chat_messages FOR SELECT
  TO anon
  USING (anon_session_id IS NOT NULL AND user_id IS NULL);
