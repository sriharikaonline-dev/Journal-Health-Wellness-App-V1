/*
# Medical Youth Journal — initial schema

This migration sets up the content tables for the MY Journal app, an uplifting
wellness companion for young people. The app is single-tenant (no sign-in):
site visitors read curated content (blogs, body systems, medical professions),
and optionally submit an anonymous check-in survey that returns blog
recommendations. All content is authored by the MY Journal team and is
intentionally public, so every table is readable by the anon role.

## Tables created
1. `categories` — wellness topics (mental health, anxiety, sleep, weight,
   healthy eating, etc.) used to tag survey questions, blogs, body systems,
   and careers.
2. `blogs` — articles written by the MY Journal team. Each blog links to one
   category and stores title, summary, body (markdown-ish paragraphs), author,
   read-time estimate, cover-image url, and accent color.
3. `survey_questions` — the multi-step check-in questions. Each has a topic
   category and 1–5 emoji scale options.
4. `body_systems` — "Learn About Your Body" tab entries: a body system name,
   short explanation paragraph, what-it-does bullet list, fun fact, and an
   accent color used to render the SVG illustration.
5. `medical_professions` — "Find Your Path" tab entries: a medical career name,
   short description, years-of-schooling range, key-skill tags, day-in-the-life,
   and accent color.
6. `survey_responses` — optional anonymous submissions of the check-in so the
   team can see aggregate topic needs. Stores the picked category labels in a
   JSONB array. No PII is collected.

## Security
- RLS enabled on every table.
- All content tables use `TO anon, authenticated` CRUD because the data is
  intentionally public/shared (no-auth app).
- `survey_responses` is write-only-for-anon on INSERT and read-restricted so
  only authenticated (the team) can view submissions; anon can submit.

## Notes
- No `user_id` columns — this is a no-auth, single-tenant public content app.
- All insert defaults are safe.
- Re-running this migration is safe (IF NOT EXISTS + DROP POLICY IF EXISTS).
*/

-- Categories ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  accent text NOT NULL DEFAULT 'teal',
  tagline text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Blogs --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  author text NOT NULL DEFAULT 'MY Journal Team',
  read_minutes int NOT NULL DEFAULT 4,
  cover_url text,
  accent text NOT NULL DEFAULT 'teal',
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Survey questions ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  prompt text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Body systems -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short text NOT NULL,
  what_it_does text[] NOT NULL DEFAULT '{}',
  fun_fact text,
  accent text NOT NULL DEFAULT 'teal',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Medical professions ------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_professions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  years text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  day_in_life text NOT NULL,
  accent text NOT NULL DEFAULT 'teal',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Survey responses (anonymous) --------------------------------------------
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categories text[] NOT NULL DEFAULT '{}',
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_blogs uuid[] NOT NULL DEFAULT '{}'::uuid[],
  created_at timestamptz DEFAULT now()
);

-- RLS ----------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- categories: public CRUD
DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_categories" ON categories;
CREATE POLICY "anon_write_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- blogs: public read; full CRUD for editing
DROP POLICY IF EXISTS "anon_read_blogs" ON blogs;
CREATE POLICY "anon_read_blogs" ON blogs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_blogs" ON blogs;
CREATE POLICY "anon_write_blogs" ON blogs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_blogs" ON blogs;
CREATE POLICY "anon_update_blogs" ON blogs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_blogs" ON blogs;
CREATE POLICY "anon_delete_blogs" ON blogs FOR DELETE TO anon, authenticated USING (true);

-- survey_questions: public CRUD
DROP POLICY IF EXISTS "anon_read_survey_questions" ON survey_questions;
CREATE POLICY "anon_read_survey_questions" ON survey_questions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_survey_questions" ON survey_questions;
CREATE POLICY "anon_write_survey_questions" ON survey_questions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_survey_questions" ON survey_questions;
CREATE POLICY "anon_update_survey_questions" ON survey_questions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_survey_questions" ON survey_questions;
CREATE POLICY "anon_delete_survey_questions" ON survey_questions FOR DELETE TO anon, authenticated USING (true);

-- body_systems: public CRUD
DROP POLICY IF EXISTS "anon_read_body_systems" ON body_systems;
CREATE POLICY "anon_read_body_systems" ON body_systems FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_body_systems" ON body_systems;
CREATE POLICY "anon_write_body_systems" ON body_systems FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_body_systems" ON body_systems;
CREATE POLICY "anon_update_body_systems" ON body_systems FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_body_systems" ON body_systems;
CREATE POLICY "anon_delete_body_systems" ON body_systems FOR DELETE TO anon, authenticated USING (true);

-- medical_professions: public CRUD
DROP POLICY IF EXISTS "anon_read_professions" ON medical_professions;
CREATE POLICY "anon_read_professions" ON medical_professions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_professions" ON medical_professions;
CREATE POLICY "anon_write_professions" ON medical_professions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_professions" ON medical_professions;
CREATE POLICY "anon_update_professions" ON medical_professions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_professions" ON medical_professions;
CREATE POLICY "anon_delete_professions" ON medical_professions FOR DELETE TO anon, authenticated USING (true);

-- survey_responses: anon can submit, only authenticated can read/update/delete
DROP POLICY IF EXISTS "anon_insert_survey_responses" ON survey_responses;
CREATE POLICY "anon_insert_survey_responses" ON survey_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_survey_responses" ON survey_responses;
CREATE POLICY "auth_read_survey_responses" ON survey_responses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_survey_responses" ON survey_responses;
CREATE POLICY "auth_update_survey_responses" ON survey_responses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_survey_responses" ON survey_responses;
CREATE POLICY "auth_delete_survey_responses" ON survey_responses FOR DELETE TO authenticated USING (true);

-- Indexes ------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured) WHERE featured;
CREATE INDEX IF NOT EXISTS idx_survey_questions_category ON survey_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at DESC);
