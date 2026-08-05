-- NHT Phase 9: Platform Event System (events → notifications + activity)

CREATE TABLE public.platform_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  module TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_role public.user_role,
  target_id UUID,
  entity_type TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'staff'
    CHECK (visibility IN ('owner', 'staff', 'manager_scoped')),
  related_creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL
);

CREATE INDEX platform_events_created_at_idx
  ON public.platform_events (created_at DESC);
CREATE INDEX platform_events_module_idx
  ON public.platform_events (module);
CREATE INDEX platform_events_type_idx
  ON public.platform_events (type);
CREATE INDEX platform_events_related_creator_idx
  ON public.platform_events (related_creator_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  recipient_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  module TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id UUID REFERENCES public.platform_events (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX notifications_recipient_created_idx
  ON public.notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_recipient_unread_idx
  ON public.notifications (recipient_id)
  WHERE read_at IS NULL AND archived_at IS NULL;

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_id UUID REFERENCES public.platform_events (id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  actor_role public.user_role,
  module TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'staff'
    CHECK (visibility IN ('owner', 'staff', 'manager_scoped')),
  related_creator_id UUID REFERENCES public.creators (id) ON DELETE SET NULL
);

CREATE INDEX activity_logs_created_at_idx
  ON public.activity_logs (created_at DESC);
CREATE INDEX activity_logs_module_idx
  ON public.activity_logs (module);
CREATE INDEX activity_logs_related_creator_idx
  ON public.activity_logs (related_creator_id);

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Events: staff can insert (via authenticated session); select mirrors activity rules
CREATE POLICY "platform_events_insert_staff"
  ON public.platform_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "platform_events_select_scoped"
  ON public.platform_events
  FOR SELECT
  TO authenticated
  USING (
    public.is_owner()
    OR (
      public.is_admin_or_above()
      AND visibility <> 'owner'
    )
    OR (
      public.is_staff()
      AND visibility = 'manager_scoped'
      AND (
        related_creator_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.creators AS c
          WHERE c.id = related_creator_id
            AND c.manager_id = auth.uid()
        )
      )
    )
    OR (
      public.is_staff()
      AND visibility = 'staff'
      AND public.is_admin_or_above()
    )
  );

-- Notifications: recipients manage their own
CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_owner());

CREATE POLICY "notifications_insert_staff"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff() OR recipient_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_owner())
  WITH CHECK (recipient_id = auth.uid() OR public.is_owner());

CREATE POLICY "notifications_delete_own"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid() OR public.is_owner());

-- Activity: owner everything; admin non-owner; manager scoped
CREATE POLICY "activity_logs_select_scoped"
  ON public.activity_logs
  FOR SELECT
  TO authenticated
  USING (
    public.is_owner()
    OR (
      public.is_admin_or_above()
      AND visibility <> 'owner'
    )
    OR (
      public.get_user_role() = 'manager'
      AND visibility = 'manager_scoped'
      AND (
        related_creator_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.creators AS c
          WHERE c.id = related_creator_id
            AND c.manager_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "activity_logs_insert_staff"
  ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());
