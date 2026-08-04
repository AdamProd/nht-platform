-- NHT Phase 2: RLS helpers and policies

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() = 'owner', false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_user_role() IN ('owner', 'admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    public.get_user_role() IN ('owner', 'admin', 'manager'),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_staff"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_owner() OR public.is_staff() OR id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR id = auth.uid())
  WITH CHECK (
    public.is_owner()
    OR (
      id = auth.uid()
      AND role = (SELECT p.role FROM public.profiles AS p WHERE p.id = auth.uid())
    )
  );

CREATE POLICY "profiles_update_roles_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above())
  WITH CHECK (public.is_owner() OR public.is_admin_or_above());

CREATE POLICY "profiles_insert_owner"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner());

-- applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_insert_public"
  ON public.applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "applications_select_staff"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (public.is_owner() OR public.is_staff());

CREATE POLICY "applications_update_staff"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_staff())
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "applications_delete_admin"
  ON public.applications
  FOR DELETE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above());

-- application_files
ALTER TABLE public.application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "application_files_select_staff"
  ON public.application_files
  FOR SELECT
  TO authenticated
  USING (public.is_owner() OR public.is_staff());

CREATE POLICY "application_files_insert_staff"
  ON public.application_files
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "application_files_update_staff"
  ON public.application_files
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_staff())
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "application_files_delete_admin"
  ON public.application_files
  FOR DELETE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above());

-- blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_select_published_or_staff"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_owner()
    OR public.is_staff()
    OR status = 'published'
  );

CREATE POLICY "blog_posts_insert_staff"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "blog_posts_update_staff"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_staff())
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "blog_posts_delete_admin"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above());

-- blog_post_translations
ALTER TABLE public.blog_post_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_post_translations_select_published_or_staff"
  ON public.blog_post_translations
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_owner()
    OR public.is_staff()
    OR EXISTS (
      SELECT 1
      FROM public.blog_posts AS bp
      WHERE bp.id = blog_post_translations.post_id
        AND bp.status = 'published'
    )
  );

CREATE POLICY "blog_post_translations_insert_staff"
  ON public.blog_post_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "blog_post_translations_update_staff"
  ON public.blog_post_translations
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_staff())
  WITH CHECK (public.is_owner() OR public.is_staff());

CREATE POLICY "blog_post_translations_delete_admin"
  ON public.blog_post_translations
  FOR DELETE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above());

-- settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_select_staff"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (public.is_owner() OR public.is_staff());

CREATE POLICY "settings_insert_admin"
  ON public.settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner() OR public.is_admin_or_above());

CREATE POLICY "settings_update_admin"
  ON public.settings
  FOR UPDATE
  TO authenticated
  USING (public.is_owner() OR public.is_admin_or_above())
  WITH CHECK (public.is_owner() OR public.is_admin_or_above());

CREATE POLICY "settings_delete_owner"
  ON public.settings
  FOR DELETE
  TO authenticated
  USING (public.is_owner());

-- storage.objects policies for applications bucket
CREATE POLICY "applications_storage_select_staff"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'applications'
    AND (public.is_owner() OR public.is_staff())
  );

CREATE POLICY "applications_storage_insert_staff"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'applications'
    AND (public.is_owner() OR public.is_staff())
    AND (
      (storage.foldername(name))[2] IN ('screenshots', 'identity', 'contracts')
      OR (storage.foldername(name))[2] = 'other'
    )
  );

CREATE POLICY "applications_storage_update_staff"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'applications'
    AND (public.is_owner() OR public.is_staff())
  )
  WITH CHECK (
    bucket_id = 'applications'
    AND (public.is_owner() OR public.is_staff())
  );

CREATE POLICY "applications_storage_delete_admin"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'applications'
    AND (public.is_owner() OR public.is_admin_or_above())
  );
