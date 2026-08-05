-- Creator CRM create-wizard finance defaults (safe additive columns)

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS preferred_currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS agency_percent NUMERIC(5, 2) NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS payout_method public.payout_method NOT NULL DEFAULT 'bank';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'creators_preferred_currency_check'
  ) THEN
    ALTER TABLE public.creators
      ADD CONSTRAINT creators_preferred_currency_check
      CHECK (preferred_currency IN ('USD', 'EUR', 'GBP'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'creators_agency_percent_check'
  ) THEN
    ALTER TABLE public.creators
      ADD CONSTRAINT creators_agency_percent_check
      CHECK (agency_percent >= 0 AND agency_percent <= 100);
  END IF;
END $$;
