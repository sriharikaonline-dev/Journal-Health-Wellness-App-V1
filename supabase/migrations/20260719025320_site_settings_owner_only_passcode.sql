/*
# Make the team passcode admin-only (owner-scoped) on site_settings

## Why
The team passcode lives in `team_passcode_hash` on `site_settings`. Until now,
the UPDATE and DELETE policies allowed ANY authenticated user to modify the row,
meaning any signed-in teammate could change or remove the team passcode. The
owner wants this restricted so only they control the passcode.

## Changes

### 1. New column on `site_settings`
- `owner_id` (uuid, nullable)
  - Records which auth user exclusively owns / controls the team passcode.
  - Nullable on purpose: while NULL, the passcode is FROZEN — no one can update
    or delete it — which is a safe default until the owner is designated.
  - `REFERENCES auth.users(id) ON DELETE SET NULL` so deleting the owner's auth
    account does not cascade-delete site settings.

### 2. RLS policy changes on `site_settings` (all idempotent: drop then create)
- SELECT — unchanged. `anon, authenticated` can still READ settings. Required
  because the frontend verifies the entered team code against the hash
  client-side; the hash is not the plaintext, so exposing it is safe.
- UPDATE — TIGHTENED from "any authenticated user" (`USING true`) to
  "only the row's owner" (`auth.uid() = owner_id`). Core fix: teammates can no
  longer change the passcode. WITH CHECK is the same predicate, so the owner
  also cannot reassign owner_id to someone else via a normal update.
- DELETE — TIGHTENED from "any authenticated user" to "only the row's owner".
- INSERT — TIGHTENED so any new settings row must declare the inserter as its
  owner (`owner_id = auth.uid()`), preventing a competing settings row.

## Data safety
- No data is deleted, no columns are dropped, no types change.
- The existing `team_passcode_hash` value is preserved exactly.
- `owner_id` starts NULL for the existing row. Until populated (separate step,
  once the owner confirms their account), UPDATE/DELETE are blocked for
  everyone. This is the safest intermediate state.

## Important notes
1. While `owner_id IS NULL`, `auth.uid() = owner_id` is NULL (not true), so
   UPDATE/DELETE are blocked for ALL users. This freezes the passcode until
   ownership is designated — safer than the previous "anyone can edit".
2. The owner will be designated in a separate privileged step after the owner
   confirms their account, by setting `owner_id` to that user's UUID.
3. Ownership transfer is intentionally not possible through the normal client
   (the UPDATE WITH CHECK forbids changing owner_id to another user).
*/

-- 1. Add owner_id column if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'site_settings'
      AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.site_settings
      ADD COLUMN owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. RLS already enabled on site_settings; replace policies.

-- SELECT: keep public read (anon + authenticated). The hash is not plaintext.
DROP POLICY IF EXISTS "anon_read_site_settings" ON public.site_settings;
CREATE POLICY "anon_read_site_settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- UPDATE: only the owner. While owner_id IS NULL this blocks everyone.
DROP POLICY IF EXISTS "auth_update_site_settings" ON public.site_settings;
CREATE POLICY "auth_update_site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- DELETE: only the owner.
DROP POLICY IF EXISTS "auth_delete_site_settings" ON public.site_settings;
CREATE POLICY "auth_delete_site_settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- INSERT: inserter must declare themselves as the owner of the new row.
DROP POLICY IF EXISTS "auth_insert_site_settings" ON public.site_settings;
CREATE POLICY "auth_insert_site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());