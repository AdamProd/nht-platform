-- Phase 14: Finance 2.0 — payout workflow fields, commissions, history

-- ---------------------------------------------------------------------------
-- Creator payouts: approval / rejection metadata
-- ---------------------------------------------------------------------------

ALTER TABLE public.creator_payouts
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

UPDATE public.creator_payouts
SET requested_at = created_at
WHERE requested_at IS DISTINCT FROM created_at
  AND approved_at IS NULL
  AND rejected_at IS NULL;

CREATE INDEX IF NOT EXISTS creator_payouts_status_idx
  ON public.creator_payouts (status, requested_at DESC);

CREATE INDEX IF NOT EXISTS creator_payouts_creator_status_idx
  ON public.creator_payouts (creator_id, status);

-- Staff can manage payouts (finance/admin/owner); managers read via app scoping
DROP POLICY IF EXISTS "creator_payouts_select_staff" ON public.creator_payouts;
CREATE POLICY "creator_payouts_select_staff"
  ON public.creator_payouts FOR SELECT TO authenticated
  USING (
    public.is_finance_staff()
    OR public.is_staff()
    OR creator_id IN (
      SELECT c.id FROM public.creators c
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "creator_payouts_insert_finance" ON public.creator_payouts;
CREATE POLICY "creator_payouts_insert_finance"
  ON public.creator_payouts FOR INSERT TO authenticated
  WITH CHECK (public.is_finance_staff() OR public.is_staff());

DROP POLICY IF EXISTS "creator_payouts_update_finance" ON public.creator_payouts;
CREATE POLICY "creator_payouts_update_finance"
  ON public.creator_payouts FOR UPDATE TO authenticated
  USING (public.is_finance_staff() OR public.is_admin_or_above())
  WITH CHECK (public.is_finance_staff() OR public.is_admin_or_above());

-- ---------------------------------------------------------------------------
-- Commission settings + change history
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_percent NUMERIC(5,2) NOT NULL DEFAULT 20
    CHECK (agency_percent >= 0 AND agency_percent <= 100),
  manager_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (manager_percent >= 0 AND manager_percent <= 100),
  referral_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (referral_percent >= 0 AND referral_percent <= 100),
  bonus_percent NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (bonus_percent >= 0 AND bonus_percent <= 100),
  updated_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settings_id UUID REFERENCES public.commission_settings (id) ON DELETE SET NULL,
  agency_percent NUMERIC(5,2) NOT NULL,
  manager_percent NUMERIC(5,2) NOT NULL,
  referral_percent NUMERIC(5,2) NOT NULL,
  bonus_percent NUMERIC(5,2) NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS commission_history_created_at_idx
  ON public.commission_history (created_at DESC);

DROP TRIGGER IF EXISTS commission_settings_set_updated_at ON public.commission_settings;
CREATE TRIGGER commission_settings_set_updated_at
  BEFORE UPDATE ON public.commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commission_settings_select_staff" ON public.commission_settings;
CREATE POLICY "commission_settings_select_staff"
  ON public.commission_settings FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "commission_settings_write_finance" ON public.commission_settings;
CREATE POLICY "commission_settings_write_finance"
  ON public.commission_settings FOR ALL TO authenticated
  USING (public.is_finance_staff() OR public.is_admin_or_above())
  WITH CHECK (public.is_finance_staff() OR public.is_admin_or_above());

DROP POLICY IF EXISTS "commission_history_select_staff" ON public.commission_history;
CREATE POLICY "commission_history_select_staff"
  ON public.commission_history FOR SELECT TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "commission_history_insert_finance" ON public.commission_history;
CREATE POLICY "commission_history_insert_finance"
  ON public.commission_history FOR INSERT TO authenticated
  WITH CHECK (public.is_finance_staff() OR public.is_admin_or_above());

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.commission_settings TO authenticated;
GRANT SELECT, INSERT ON TABLE public.commission_history TO authenticated;
GRANT ALL ON TABLE public.commission_settings TO service_role;
GRANT ALL ON TABLE public.commission_history TO service_role;

-- Seed default commission settings if empty
INSERT INTO public.commission_settings (
  agency_percent, manager_percent, referral_percent, bonus_percent
)
SELECT 20, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.commission_settings LIMIT 1);
