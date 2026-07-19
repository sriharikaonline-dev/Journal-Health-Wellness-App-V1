/*
# Create chat / question inbox for the team (owner gets notifications)

## Why
The owner wants a chat bubble anyone on the team can use to ask questions, with
the owner receiving notifications in the Team Workspace. Modeled as a questions
inbox (not a live group chat): any signed-in member posts a message; the owner
sees all messages and gets an unread count.

## New table: chat_messages
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid(), REFERENCES auth.users ON DELETE CASCADE)
- user_email (text) — denormalized for easy display in the owner's inbox
- message (text)
- handled (bool, default false) — owner can mark a question handled
- created_at (timestamptz, default now())

## New table: chat_reads
- user_id (uuid PK, REFERENCES auth.users ON DELETE CASCADE)
- last_read_at (timestamptz, default now())
Used to compute each user's unread count. The owner's row powers the
notification badge in the Team Workspace: unread = chat_messages created after
the owner's chat_reads.last_read_at.

## Security (RLS)
chat_messages:
- SELECT: owner sees ALL; each authenticated user sees their OWN messages
  (two policies, OR-combined).
- INSERT: any authenticated user may insert their own (user_id = auth.uid()).
- UPDATE / DELETE: owner only (to mark handled or remove a message).

chat_reads:
- SELECT / INSERT / UPDATE / DELETE: a user may manage only their OWN row
  (auth.uid() = user_id). This lets the owner upsert their read marker to clear
  the notification badge; other members can track their own read position
  harmlessly.

## Data safety
- New tables only.
*/

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- SELECT: owner sees all
DROP POLICY IF EXISTS "owner_select_chat_messages" ON public.chat_messages;
CREATE POLICY "owner_select_chat_messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- SELECT: users see their own
DROP POLICY IF EXISTS "user_select_own_chat_messages" ON public.chat_messages;
CREATE POLICY "user_select_own_chat_messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: any authenticated user may post their own question
DROP POLICY IF EXISTS "user_insert_own_chat_messages" ON public.chat_messages;
CREATE POLICY "user_insert_own_chat_messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: owner only (mark handled, etc.)
DROP POLICY IF EXISTS "owner_update_chat_messages" ON public.chat_messages;
CREATE POLICY "owner_update_chat_messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- DELETE: owner only
DROP POLICY IF EXISTS "owner_delete_chat_messages" ON public.chat_messages;
CREATE POLICY "owner_delete_chat_messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- chat_reads
CREATE TABLE IF NOT EXISTS public.chat_reads (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat_reads" ON public.chat_reads;
CREATE POLICY "select_own_chat_reads"
  ON public.chat_reads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat_reads" ON public.chat_reads;
CREATE POLICY "insert_own_chat_reads"
  ON public.chat_reads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chat_reads" ON public.chat_reads;
CREATE POLICY "update_own_chat_reads"
  ON public.chat_reads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat_reads" ON public.chat_reads;
CREATE POLICY "delete_own_chat_reads"
  ON public.chat_reads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);