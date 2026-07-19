/*
# Create founders table (owner-managed, public read)

## Why
The owner wants a "Founders" tab showing the team's founders with a photo and a
description each. Starting with 4 slots, extensible to more later (e.g. a 5th).
Only the owner can add/edit/remove founders; everyone else can view them.

## New table: founders
- id (uuid PK)
- name (text) — founder's name
- role (text) — e.g. "Co-Founder & Editor"
- description (text) — short bio
- photo_url (text, nullable) — null until the owner adds a picture (placeholder)
- sort_order (int, default 0) — controls display order
- created_at (timestamptz, default now())

## Security (RLS)
- SELECT: anon + authenticated (the Founders page is public to the team).
- INSERT / UPDATE / DELETE: only the site owner (the user whose id matches
  site_settings.owner_id), via an EXISTS subquery against site_settings so
  founders inherit ownership from the single settings row. This is what lets
  the owner add a 5th founder later while keeping everyone else read-only.

## Seed data
- Inserts 4 placeholder founder rows the owner can edit later. photo_url is
  null (picture placeholders to be filled in).

## Data safety
- New table only; no existing data touched.
*/

CREATE TABLE IF NOT EXISTS public.founders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Founder Name',
  role text NOT NULL DEFAULT 'Role',
  description text NOT NULL DEFAULT 'Add a short description about this founder here.',
  photo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_founders" ON public.founders;
CREATE POLICY "anon_read_founders"
  ON public.founders FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "owner_insert_founders" ON public.founders;
CREATE POLICY "owner_insert_founders"
  ON public.founders FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "owner_update_founders" ON public.founders;
CREATE POLICY "owner_update_founders"
  ON public.founders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

DROP POLICY IF EXISTS "owner_delete_founders" ON public.founders;
CREATE POLICY "owner_delete_founders"
  ON public.founders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.site_settings WHERE id = 1 AND owner_id = auth.uid()));

-- Seed 4 placeholder founders (only if the table is empty)
INSERT INTO public.founders (name, role, description, photo_url, sort_order)
SELECT 'Founder Name', 'Role', 'Add a short description about this founder here.', NULL, n
FROM generate_series(1, 4) AS s(n)
WHERE NOT EXISTS (SELECT 1 FROM public.founders);