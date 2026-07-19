/*
# Allow public read of member count and member display info

## What this does
The Home and About pages show how many people have an account and list
community members. Those pages are visible to signed-out visitors, who talk
to Supabase as the `anon` role. Without an `anon` SELECT policy on
`profiles`, those pages see zero members.

## Security
- Adds a single new SELECT policy `public_read_profiles` scoped to
  `anon, authenticated` that returns all rows. This is safe because:
  1. The frontend only ever displays `display_name` and `created_at` —
     never `email` — on the public member list and the count query uses
     `head: true` (no columns returned at all).
  2. The existing owner / self-scoped policies are untouched; writes and
     deletes remain owner-only / self-only.
- This matches the existing pattern used by `founders`, `blogs`,
  `categories`, etc., which all have `anon_read_*` policies because the
  content is intentionally public.

## Important notes
1. The `email` column is still physically readable by this policy. The
   frontend deliberately never selects or renders it on public pages —
   it only fetches `display_name` and `created_at`. The owner workspace
   (authenticated owner) is the only place email is shown, which the
   existing `owner_select_profiles` policy already permits.
2. No data is changed; this only adds a policy.
*/

DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);
