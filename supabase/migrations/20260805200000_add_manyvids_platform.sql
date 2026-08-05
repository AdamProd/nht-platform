-- Add ManyVids to creator platforms (safe; does not alter existing rows)

ALTER TABLE public.creators
  ADD COLUMN IF NOT EXISTS manyvids_url TEXT;

-- creator_platform_accounts.platform is a CHECK constraint, not a Postgres enum
ALTER TABLE public.creator_platform_accounts
  DROP CONSTRAINT IF EXISTS creator_platform_accounts_platform_check;

ALTER TABLE public.creator_platform_accounts
  ADD CONSTRAINT creator_platform_accounts_platform_check
  CHECK (
    platform IN (
      'onlyfans',
      'fansly',
      'manyvids',
      'chaturbate',
      'instagram',
      'tiktok',
      'twitter'
    )
  );
