/*
# Add site_settings table for editable home & about copy

## Why
The MY Journal team wants to edit every tab on the website, not just blogs.
The home page and about page contain hand-written copy (hero title, subtitle,
motto, affirmations, feature blurbs, about paragraphs, values, etc.) that
doesn't fit the existing content tables. This adds a single-row `site_settings`
table storing that copy as JSONB, so the team can edit it through the admin UI
without touching code.

## New table
- `site_settings`
  - `id` (int, primary key, always 1 — single row)
  - `data` (jsonb) — editable copy, fixed shape the frontend reads
  - `updated_at` (timestamptz)

## Security
- RLS enabled.
- SELECT: public (anon + authenticated) so the public site reads settings.
- INSERT / UPDATE / DELETE: authenticated only.
- Trigger keeps updated_at fresh and id pinned to 1.

## Notes
- Re-running is safe (IF NOT EXISTS + DROP POLICY/TRIGGER IF EXISTS).
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_site_settings" ON site_settings;
CREATE POLICY "auth_delete_site_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

CREATE OR REPLACE FUNCTION touch_site_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  NEW.id := 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_touch ON site_settings;
CREATE TRIGGER site_settings_touch
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION touch_site_settings_updated_at();

-- Seed the single row with the current copy -------------------------------
INSERT INTO site_settings (id, data)
VALUES (1, jsonb_build_object(
  'home', jsonb_build_object(
    'heroEyebrow', 'Welcome to MY Journal',
    'heroTitle', 'Your wellness',
    'heroHighlight', 'cheerleader',
    'heroTail', 'in your pocket.',
    'heroSubtitle', 'Check in with how you''re feeling, get blogs that actually help, learn how your body works, and explore a future in medicine. Built by young people, for young people.',
    'affirmations', jsonb_build_array(
      'You are allowed to take up space.',
      'Rest is part of the work.',
      'Your pace is the right pace.',
      'Feelings are visitors, not residents.',
      'Asking for help is a superpower.',
      'You are further than you were yesterday.'
    ),
    'motto', 'You Got This. We mean it.',
    'mottoSub', 'Whatever you''re carrying, you don''t have to carry it alone.',
    'features', jsonb_build_array(
      jsonb_build_object('title','Wellness Check-In','desc','A quick, gentle survey about how you''re really doing — and blogs picked just for you.'),
      jsonb_build_object('title','Uplifting Blogs','desc','Real, doable advice from our team on mood, sleep, food, focus, and everything between.'),
      jsonb_build_object('title','Learn About Your Body','desc','Short, illustrated explainers on every body system — no textbook required.'),
      jsonb_build_object('title','Find Your Path','desc','Curious about a career in medicine? Discover roles that match your spark.')
    ),
    'featuresEyebrow', 'What''s inside',
    'featuresTitle', 'Four ways MY Journal has your back',
    'featuresSubtitle', 'Pick a starting point — or let the check-in choose one for you.',
    'topicsEyebrow', 'We talk about',
    'topicsTitle', 'Topics we cover',
    'topicsSubtitle', 'Whatever you''re working through, there''s a place to start here.',
    'featuredEyebrow', 'From our team',
    'featuredTitle', 'Featured reads',
    'featuredSubtitle', 'Hand-picked articles to lift your day.',
    'ctaTitle', 'One small step is still a step.',
    'ctaSubtitle', 'Take the 2-minute check-in and get personalized reads for where you are right now.'
  ),
  'about', jsonb_build_object(
    'eyebrow', 'About MY Journal',
    'title', 'We''re here to remind you',
    'highlight', 'You Got This.',
    'paragraph', 'Medical Youth Journal (MY Journal, for short) is a nonprofit built by young people who believe wellness should feel welcoming — not intimidating. We write about the stuff that actually matters at your age: mood, sleep, food, focus, friendships, and the big question of what to do with your life.',
    'whatWeDoEyebrow', 'What we do',
    'whatWeDoTitle', 'A wellness companion, not another thing to stress about',
    'whatWeDoSubtitle', 'Four ways we show up for you — all free, all friendly.',
    'whatWeDo', jsonb_build_array(
      jsonb_build_object('title','Check-In','desc','A 2-minute survey that meets you where you are and suggests reads that help.'),
      jsonb_build_object('title','Blogs','desc','Real advice on the things young people actually face — in plain language.'),
      jsonb_build_object('title','Your Body','desc','Illustrated explainers for every body system, minus the textbook headaches.'),
      jsonb_build_object('title','Find Your Path','desc','A friendly map to medical careers for future helpers who aren''t sure which way to go.')
    ),
    'valuesEyebrow', 'What we believe',
    'valuesTitle', 'The values behind every page',
    'values', jsonb_build_array(
      jsonb_build_object('title','Kindness first','desc','No judgement, no shame. Every word here is written to lift you up, not weigh you down.'),
      jsonb_build_object('title','Honest info','desc','Content reviewed by our team and grounded in real medical understanding — explained simply.'),
      jsonb_build_object('title','For young people, by young people','desc','We get what it''s like because we''re living it too. Your voice belongs in this conversation.'),
      jsonb_build_object('title','Progress over perfect','desc','Small steps count. We celebrate the little wins that add up to real change.')
    ),
    'noteText', 'MY Journal shares supportive information and stories — it''s not a replacement for professional medical advice, diagnosis, or treatment. If you''re struggling, please reach out to a trusted adult, a doctor, or a local support line. Asking for help is one of the bravest things you can do.',
    'ctaTitle', 'Come as you are.',
    'ctaSubtitle', 'Start with a check-in, browse a blog, or just look around. There''s no wrong first step.'
  )
))
ON CONFLICT (id) DO NOTHING;
