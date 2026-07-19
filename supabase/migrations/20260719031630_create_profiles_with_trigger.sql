/*
# Create profiles table (mirrors auth.users so the owner can see who has an account)

## Why
The owner wants to see everyone who has an account (count + list) in the Team
Workspace. The raw auth.users table is not readable by the anon or
authenticated role, so we maintain a public.profiles table populated
automatically on every sign-up via a trigger, and expose it through RLS.

## New table: profiles
- id (uuid PK, REFERENCES auth.users(id) ON DELETE CASCADE)
- email (text)
- display_name (text, nullable)
- created_at (timestamptz, default now())

## Trigger
- Function public.handle_new_user() SECURITY DEFINER: inserts a profiles row
  when a new auth.users row is created. SECURITY DEFINER lets it run with the
  table owner's privileges so it bypasses RLS (which would otherwise block the
  insert, since the brand-new user has no profiles row yet).
- Trigger on auth.users AFTER INSERT FOR EACH ROW calls handle_new_user().

## Security (RLS)
- SELECT: owner sees ALL profiles; each authenticated user sees their OWN row.
  (No anon policy: only signed-in users see profiles, and only the owner sees
  the full list — protects member privacy.)
- INSERT: none via client — the trigger handles inserts. (No INSERT policy =
  blocked for clients; the SECURITY DEFINER function bypasses RLS.)
- UPDATE / DELETE: owner only (owner may edit display_name or remove a profile
  row; this does not delete the auth user).

## Backfill
- Inserts profile rows for the existing auth.users so the list is complete
  from the start.

## Data safety
- New table only. auth.users is not modified.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: owner sees all
DROP POLICY IF EXISTS "owner_select_profiles" ON public.profiles;
CREATE POLICY "owner_select_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- SELECT: users see their own
DROP POLICY IF EXISTS "user_select_own_profile" ON public.profiles;
CREATE POLICY "user_select_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- UPDATE: owner only
DROP POLICY IF EXISTS "owner_update_profiles" ON public.profiles;
CREATE POLICY "owner_update_profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- DELETE: owner only
DROP POLICY IF EXISTS "owner_delete_profiles" ON public.profiles;
CREATE POLICY "owner_delete_profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- Trigger function to auto-insert a profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.created_at, now()))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users
INSERT INTO public.profiles (id, email, created_at)
SELECT id, email, created_at FROM auth.users
ON CONFLICT (id) DO NOTHING;