/*
# Auto-create profile on signup

## What this does
When a new user signs up via Supabase Auth, a matching row is automatically
inserted into the `profiles` table so the Team Workspace member list and the
public member counters on Home / About stay current without any frontend code.

## New database objects
1. Function `public.handle_new_profile()` — reads the new user's id and email
   from the auth event and inserts a `profiles` row if one does not already
   exist. `display_name` is left null (the user can fill it in later).
2. Trigger `on_auth_user_created` on `auth.users` — fires `AFTER INSERT` and
   calls `handle_new_profile()` for each new row.

## Security
- The function runs as `SECURITY DEFINER` so it can write to `profiles` even
  though the calling role (anon/authenticated) cannot insert arbitrary rows.
- `search_path` is pinned to `public` to prevent schema-spoofing attacks.
- The insert is idempotent (`WHERE NOT EXISTS`) so a re-fired trigger does not
  create duplicate profile rows.

## Important notes
1. This is the standard Supabase "profile per user" pattern.
2. The two existing profiles (the owner and one member) are untouched — the
   trigger only fires for future signups.
3. The owner-only RLS policies on `profiles` are unchanged; this function
   bypasses RLS by design (it is the trusted path that creates the row).
*/

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
