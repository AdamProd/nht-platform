-- NHT Phase 7: Creator CRM v2 profile, revenue, activity fields

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS onlyfans_url TEXT,
  ADD COLUMN IF NOT EXISTS fansly_url TEXT,
  ADD COLUMN IF NOT EXISTS chaturbate_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS revenue_current_month NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_previous_month NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_lifetime NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

UPDATE public.creators
SET display_name = full_name
WHERE display_name IS NULL OR display_name = '';

ALTER TABLE public.creators
  ALTER COLUMN display_name SET NOT NULL;

CREATE INDEX IF NOT EXISTS creators_display_name_idx
  ON public.creators (display_name);

CREATE INDEX IF NOT EXISTS creators_revenue_current_month_idx
  ON public.creators (revenue_current_month DESC);

CREATE INDEX IF NOT EXISTS creators_last_activity_at_idx
  ON public.creators (last_activity_at DESC NULLS LAST);
