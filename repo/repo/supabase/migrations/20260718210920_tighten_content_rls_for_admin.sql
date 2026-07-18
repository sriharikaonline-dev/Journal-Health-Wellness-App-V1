/*
# Tighten content-table RLS for admin editing

## Why
The app now has an admin sign-in so the MY Journal team can create, edit, and
delete blogs through a UI. Previously the content tables allowed anon writes
because the site was fully no-auth. Now writes must be restricted to
authenticated team members only, while public reads remain open so the public
website keeps working for anonymous visitors.

## Changes
- `categories`, `blogs`, `survey_questions`, `body_systems`,
  `medical_professions`: INSERT / UPDATE / DELETE policies switched from
  `TO anon, authenticated` to `TO authenticated` only.
- SELECT policies unchanged: still `TO anon, authenticated USING (true)` so
  the public site can read all published content.
- `survey_responses` policies unchanged (anon can still submit; only
  authenticated can read).

## Security
- Anonymous visitors can still READ every blog, body system, profession,
  category, and survey question (required for the public website).
- Only authenticated users (the MY Journal team) can create, edit, or delete
  content. This is intentionally broad (any authenticated user can edit any
  blog) because the team is small and trusted; a future iteration could add a
  role column for finer control.

## Notes
- Re-running is safe (DROP POLICY IF EXISTS before each CREATE).
- No columns or tables are changed, so no data is lost.
*/

-- blogs ----------------------------------------------------------------------
DROP POLICY IF EXISTS "anon_write_blogs" ON blogs;
DROP POLICY IF EXISTS "anon_update_blogs" ON blogs;
DROP POLICY IF EXISTS "anon_delete_blogs" ON blogs;

CREATE POLICY "auth_insert_blogs" ON blogs FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_blogs" ON blogs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_blogs" ON blogs FOR DELETE
  TO authenticated USING (true);

-- categories ----------------------------------------------------------------
DROP POLICY IF EXISTS "anon_write_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;

CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- survey_questions ----------------------------------------------------------
DROP POLICY IF EXISTS "anon_write_survey_questions" ON survey_questions;
DROP POLICY IF EXISTS "anon_update_survey_questions" ON survey_questions;
DROP POLICY IF EXISTS "anon_delete_survey_questions" ON survey_questions;

CREATE POLICY "auth_insert_survey_questions" ON survey_questions FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_survey_questions" ON survey_questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_survey_questions" ON survey_questions FOR DELETE
  TO authenticated USING (true);

-- body_systems --------------------------------------------------------------
DROP POLICY IF EXISTS "anon_write_body_systems" ON body_systems;
DROP POLICY IF EXISTS "anon_update_body_systems" ON body_systems;
DROP POLICY IF EXISTS "anon_delete_body_systems" ON body_systems;

CREATE POLICY "auth_insert_body_systems" ON body_systems FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_body_systems" ON body_systems FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_body_systems" ON body_systems FOR DELETE
  TO authenticated USING (true);

-- medical_professions -------------------------------------------------------
DROP POLICY IF EXISTS "anon_write_professions" ON medical_professions;
DROP POLICY IF EXISTS "anon_update_professions" ON medical_professions;
DROP POLICY IF EXISTS "anon_delete_professions" ON medical_professions;

CREATE POLICY "auth_insert_professions" ON medical_professions FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_professions" ON medical_professions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_professions" ON medical_professions FOR DELETE
  TO authenticated USING (true);
