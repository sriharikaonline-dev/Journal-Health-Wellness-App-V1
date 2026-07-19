/*
# Add chat_unread_count RPC for the owner's notification badge

## Why
The owner wants a notification badge in the Team Workspace showing how many
chat messages are unread. Unread = messages created after the owner's
chat_reads.last_read_at. A SECURITY DEFINER function lets the owner compute
this count in one round-trip without exposing other users' chat_reads rows.

## Data safety
- New function only; no tables or data touched.
*/

CREATE OR REPLACE FUNCTION public.chat_unread_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint
  FROM public.chat_messages m
  WHERE m.created_at > COALESCE(
    (SELECT r.last_read_at FROM public.chat_reads r
     JOIN public.site_settings s ON s.id = 1 AND s.owner_id = r.user_id),
    '1970-01-01'::timestamptz
  );
$$;

GRANT EXECUTE ON FUNCTION public.chat_unread_count() TO authenticated;
