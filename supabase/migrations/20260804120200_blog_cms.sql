-- NHT Phase 2: blog CMS tables

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'archived')
  ),
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX blog_posts_published_at_idx ON public.blog_posts (published_at DESC);
CREATE INDEX blog_posts_author_id_idx ON public.blog_posts (author_id);

CREATE TABLE public.blog_post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts (id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, locale),
  UNIQUE (locale, slug)
);

CREATE TRIGGER blog_post_translations_set_updated_at
  BEFORE UPDATE ON public.blog_post_translations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX blog_post_translations_post_id_idx
  ON public.blog_post_translations (post_id);

CREATE INDEX blog_post_translations_locale_slug_idx
  ON public.blog_post_translations (locale, slug);
