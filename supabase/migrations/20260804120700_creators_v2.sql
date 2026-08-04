-- Phase 7: Creator CRM v2 — profile, revenue, activity fields

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_name TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS platform_accounts JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS revenue_current_month NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_previous_month NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_lifetime NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payouts_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

UPDATE public.creators
SET display_name = COALESCE(NULLIF(trim(display_name), ''), full_name)
WHERE display_name IS NULL OR trim(display_name) = '';

ALTER TABLE public.creators
  ALTER COLUMN display_name SET NOT NULL;

CREATE INDEX IF NOT EXISTS creators_display_name_idx
  ON public.creators (display_name);

CREATE INDEX IF NOT EXISTS creators_revenue_current_month_idx
  ON public.creators (revenue_current_month DESC);

CREATE INDEX IF NOT EXISTS creators_last_activity_at_idx
  ON public.creators (last_activity_at DESC NULLS LAST);

-- Seed demo creator metrics if present
UPDATE public.creators
SET
  display_name = COALESCE(display_name, full_name),
  legal_name = COALESCE(legal_name, full_name),
  timezone = COALESCE(timezone, 'America/New_York'),
  phone = COALESCE(phone, '+1 555 0100'),
  platform_accounts = COALESCE(
    NULLIF(platform_accounts, '{}'::jsonb),
    jsonb_build_object(
      'onlyfans', 'https://onlyfans.com/nht_demo',
      'fansly', 'https://fansly.com/nht_demo',
      'instagram', '@nht_demo'
    )
  ),
  platforms = CASE
    WHEN platforms = '{}' OR platforms IS NULL
      THEN ARRAY['onlyfans', 'fansly', 'instagram']
    ELSE platforms
  END,
  revenue_current_month = CASE
    WHEN revenue_current_month = 0 THEN 18450.00
    ELSE revenue_current_month
  END,
  revenue_previous_month = CASE
    WHEN revenue_previous_month = 0 THEN 15220.00
    ELSE revenue_previous_month
  END,
  revenue_lifetime = CASE
    WHEN revenue_lifetime = 0 THEN 128400.00
    ELSE revenue_lifetime
  END,
  payouts_total = CASE
    WHEN payouts_total = 0 THEN 96500.00
    ELSE payouts_total
  END,
  last_activity_at = COALESCE(last_activity_at, now() - interval '2 hours'),
  last_login_at = COALESCE(last_login_at, now() - interval '1 day')
WHERE email = 'demo.creator@nht.team';
