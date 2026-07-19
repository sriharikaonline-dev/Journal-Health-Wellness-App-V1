/*
# Add team passcode hash to site_settings

## Why
The Team Sign-In page is public — anyone who finds the admin URL can see the
login form. The team wants a lightweight 4-digit "access code" gate so that
only people given the code ever reach the email/password form. The real
security (email/password auth + RLS) stays intact behind the gate; the code
just hides the form from drive-by visitors.

## How it works
- The code is stored ONLY as a SHA-256 hash in a new column
  `site_settings.team_passcode_hash`.
- The plaintext code is hashed in the admin's browser before it is ever
  written, and is never stored or returned anywhere.
- The public sign-in page reads the hash (it's already in the public-readable
  site_settings row) and verifies the entered code client-side.
- This is an access gate, NOT an authentication mechanism — RLS still
  protects all writes.

## Changes
- New column on `site_settings`:
  - `team_passcode_hash` (text, nullable) — SHA-256 hex digest of the team
    code, or NULL if no code has been set yet.
- RLS: the new column rides on the existing site_settings policies
  (anon+authenticated SELECT, authenticated-only writes). No new policies
  needed.

## Security
- Only the hash is stored, never the plaintext.
- The hash is salted with a fixed app prefix (`myj:`) so it isn't a raw
  digest of a 4-digit string. A 4-digit code has only 10,000 possibilities,
  so this is intentionally a low-stakes access gate, not a password.
  All real protection remains in Supabase Auth + RLS.

## Notes
- Re-running is safe (ADD COLUMN IF NOT EXISTS).
- NULL means "no code set" — the sign-in page treats this as "code required
  but not configured yet" and shows a friendly error.
*/

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS team_passcode_hash text;
