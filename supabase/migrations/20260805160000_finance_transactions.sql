-- NHT Finance Phase 1: agency finance transactions ledger

CREATE TYPE public.finance_transaction_status AS ENUM (
  'pending',
  'approved',
  'paid',
  'cancelled',
  'disputed'
);

CREATE TYPE public.finance_payment_method AS ENUM (
  'stripe',
  'wise',
  'paypal',
  'crypto',
  'bank_transfer',
  'other'
);

CREATE TABLE public.finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  creator_id UUID NOT NULL REFERENCES public.creators (id) ON DELETE RESTRICT,
  manager_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  gross_revenue NUMERIC(14, 2) NOT NULL CHECK (gross_revenue >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  agency_percent NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (agency_percent >= 0 AND agency_percent <= 100),
  agency_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  creator_percent NUMERIC(5, 2) NOT NULL DEFAULT 80
    CHECK (creator_percent >= 0 AND creator_percent <= 100),
  creator_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status public.finance_transaction_status NOT NULL DEFAULT 'pending',
  payment_method public.finance_payment_method,
  reference_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL
);

CREATE TRIGGER finance_transactions_set_updated_at
  BEFORE UPDATE ON public.finance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX finance_transactions_date_idx
  ON public.finance_transactions (transaction_date DESC);

CREATE INDEX finance_transactions_creator_id_idx
  ON public.finance_transactions (creator_id);

CREATE INDEX finance_transactions_manager_id_idx
  ON public.finance_transactions (manager_id);

CREATE INDEX finance_transactions_status_idx
  ON public.finance_transactions (status);

CREATE INDEX finance_transactions_platform_idx
  ON public.finance_transactions (platform);

CREATE INDEX finance_transactions_created_at_idx
  ON public.finance_transactions (created_at DESC);

ALTER TABLE public.finance_transactions ENABLE ROW LEVEL SECURITY;

-- Owner / admin: full access. Managers: transactions for creators they manage
-- or rows where they are the assigned manager_id.
CREATE POLICY "finance_transactions_select_staff_scoped"
  ON public.finance_transactions
  FOR SELECT
  TO authenticated
  USING (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND (
        manager_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.creators AS c
          WHERE c.id = creator_id
            AND c.manager_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "finance_transactions_insert_staff_scoped"
  ON public.finance_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND EXISTS (
        SELECT 1
        FROM public.creators AS c
        WHERE c.id = creator_id
          AND c.manager_id = auth.uid()
      )
    )
  );

CREATE POLICY "finance_transactions_update_staff_scoped"
  ON public.finance_transactions
  FOR UPDATE
  TO authenticated
  USING (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND (
        manager_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.creators AS c
          WHERE c.id = creator_id
            AND c.manager_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    public.is_owner()
    OR public.is_admin_or_above()
    OR (
      public.is_staff()
      AND (
        manager_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.creators AS c
          WHERE c.id = creator_id
            AND c.manager_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "finance_transactions_delete_owner"
  ON public.finance_transactions
  FOR DELETE
  TO authenticated
  USING (public.is_owner());
