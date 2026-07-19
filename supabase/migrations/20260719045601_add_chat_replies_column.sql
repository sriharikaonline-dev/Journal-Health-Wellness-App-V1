/*
# Add owner replies to chat_messages

## Why
The Team Workspace questions inbox was one-way — members could ask, but the
owner could only mark messages "handled". This adds a `replies` jsonb column
holding owner responses so the owner can reply and members see the replies in
their chat bubble.

## Data safety
- ALTER TABLE ... ADD COLUMN is additive; existing rows get an empty array.
- No columns dropped, renamed, or retyped.
*/

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS replies jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.chat_messages.replies IS
  'Array of {text, at, by_email} owner replies, oldest first.';
