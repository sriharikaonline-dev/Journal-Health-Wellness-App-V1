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
- SELECT — unchanged. `anon, authenticated` can still READ settings. This is
  required because the frontend verifies the entered team code against the hash
  client-side; the hash is not the plaintext, so exposing it is safe.
- UPDATE — TIGHTENED from "any authenticated user" (`USING true`) to
  "only the row's owner" (`auth.uid() = owner_id`). This is the core fix:
  teammates can no longer change the passcode. The WITH CHECK is the same
  predicate, so the owner also cannot reassign owner_id to someone else through
  a normal update (ownership transfer requires privileged DB access by design).
- DELETE — TIGHTENED from "any authenticated user" to "only the row's owner"
  (`auth.uid() = owner_id`).
- INSERT — TIGHTENED so any new settings row must declare the inserter as its
  owner (`owner_id = auth.uid()`), preventing a teammate from inserting a
  competing settings row they control.

## Data safety
- No data is deleted, no columns are dropped, no types change.
- The existing `team_passcode_hash` value is preserved exactly.
- `owner_id` starts NULL for the existing row. Until it is populated (separate
  step, once the owner confirms their account), UPDATE/DELETE are blocked for
  everyone. This is intentional and is the safest intermediate state.

## Important notes
1. While `owner_id IS NULL`, `auth.uid() = owner_id` evaluates to NULL (not
   true), so UPDATE/DELETE are blocked for ALL users. This freezes the passcode
   until ownership is designated — safer than the previous "anyone can edit".
2. The owner will be designated in a separate, privileged step after the owner
   confirms their account, by setting `owner_id` to that user's UUID.
3. Ownership transfer is intentionally not possible through the normal client
   (the UPDATE WITH CHECK forbids changing owner_id to another user). It must
   be done with privileged DB access, which keeps the passcode harder to hijack.
*/