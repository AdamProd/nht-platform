-- Optional seed data for local development.
-- Run after migrations: supabase db reset

INSERT INTO public.settings (key, value)
VALUES
  ('site.name', '"NHT"'::jsonb),
  ('site.tagline', '"We build creator businesses."'::jsonb),
  ('applications.default_priority', '"normal"'::jsonb)
ON CONFLICT (key) DO NOTHING;
