"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import BlogEditor from "@/features/blog/posts/components/BlogEditor";
import FlashToast from "@/features/blog/posts/components/FlashToast";
import { createPost } from "@/features/blog/posts/actions/create-post";
import { updatePost } from "@/features/blog/posts/actions/update-post";
import { deletePost } from "@/features/blog/posts/actions/delete-post";
import { ensureSlug, slugify } from "@/features/blog/posts/lib/slug";
import {
  blogStatuses,
  EMPTY_DOC,
  type BlogPostDetail,
  type BlogStatus,
  type TipTapDoc,
} from "@/features/blog/posts/types";

type TranslationDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: TipTapDoc;
  seo_title: string;
  seo_description: string;
};

type BlogPostFormProps = {
  mode: "create" | "edit";
  uiLocale: Locale;
  post?: BlogPostDetail | null;
  canDelete?: boolean;
  labels: {
    status: string;
    coverImage: string;
    coverPlaceholder: string;
    locales: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    save: string;
    saving: string;
    create: string;
    creating: string;
    delete: string;
    deleting: string;
    back: string;
    saved: string;
    created: string;
    deleted: string;
    needTranslation: string;
    confirmDelete: string;
    editor: {
      bold: string;
      italic: string;
      h2: string;
      h3: string;
      bulletList: string;
      orderedList: string;
      code: string;
      link: string;
      linkUrl: string;
      undo: string;
      redo: string;
    };
  };
  statusLabels: Record<string, string>;
};

function emptyDraft(): TranslationDraft {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: EMPTY_DOC,
    seo_title: "",
    seo_description: "",
  };
}

function buildInitialDrafts(
  post: BlogPostDetail | null | undefined,
): Record<Locale, TranslationDraft> {
  const drafts = {} as Record<Locale, TranslationDraft>;
  for (const locale of locales) {
    const existing = post?.translations.find((t) => t.locale === locale);
    if (existing) {
      drafts[locale] = {
        title: existing.title,
        slug: existing.slug,
        excerpt: existing.excerpt ?? "",
        content:
          existing.content &&
          typeof existing.content === "object" &&
          !Array.isArray(existing.content) &&
          (existing.content as { type?: string }).type === "doc"
            ? (existing.content as TipTapDoc)
            : EMPTY_DOC,
        seo_title: existing.seo_title ?? "",
        seo_description: existing.seo_description ?? "",
      };
    } else {
      drafts[locale] = emptyDraft();
    }
  }
  return drafts;
}

function isTranslationComplete(draft: TranslationDraft): boolean {
  return Boolean(draft.title.trim() && draft.slug.trim());
}

export default function BlogPostForm({
  mode,
  uiLocale,
  post,
  canDelete = false,
  labels,
  statusLabels,
}: BlogPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<BlogStatus>(
    (post?.status as BlogStatus) || "draft",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? "");
  const [activeLocale, setActiveLocale] = useState<Locale>(uiLocale);
  const [drafts, setDrafts] = useState(() => buildInitialDrafts(post));
  const [flash, setFlash] = useState<{ message: string; tone: "success" | "error" } | null>(
    null,
  );

  const activeDraft = drafts[activeLocale];

  const filledLocales = useMemo(
    () => locales.filter((locale) => isTranslationComplete(drafts[locale])),
    [drafts],
  );

  function patchDraft(locale: Locale, patch: Partial<TranslationDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  function handleTitleChange(title: string) {
    const current = drafts[activeLocale];
    const shouldAutofillSlug =
      !current.slug || current.slug === slugify(current.title);
    patchDraft(activeLocale, {
      title,
      slug: shouldAutofillSlug ? ensureSlug(title) : current.slug,
    });
  }

  function buildPayload() {
    const translations = filledLocales.map((locale) => {
      const draft = drafts[locale];
      return {
        locale,
        title: draft.title.trim(),
        slug: ensureSlug(draft.title, draft.slug),
        excerpt: draft.excerpt.trim() || null,
        content: draft.content?.type === "doc" ? draft.content : EMPTY_DOC,
        seo_title: draft.seo_title.trim() || null,
        seo_description: draft.seo_description.trim() || null,
      };
    });

    return {
      status,
      cover_image_url: coverImageUrl.trim() || null,
      translations,
    };
  }

  function handleSave() {
    if (filledLocales.length === 0) {
      setFlash({ message: labels.needTranslation, tone: "error" });
      return;
    }

    const payload = buildPayload();

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPost(payload)
          : await updatePost({ ...payload, id: post!.id });

      if (!result.success) {
        setFlash({ message: result.error, tone: "error" });
        return;
      }

      if (mode === "create" && result.id) {
        setFlash({ message: labels.created, tone: "success" });
        router.push(`/admin/blog/${result.id}`);
        router.refresh();
        return;
      }

      setFlash({ message: labels.saved, tone: "success" });
      router.refresh();
    });
  }

  function handleDelete() {
    if (!post || !canDelete) return;
    if (!window.confirm(labels.confirmDelete)) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", post.id);
      const result = await deletePost(formData);
      if (!result.success) {
        setFlash({ message: result.error, tone: "error" });
        return;
      }
      setFlash({ message: labels.deleted, tone: "success" });
      router.push("/admin/blog");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <FlashToast message={flash?.message ?? null} tone={flash?.tone} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.status}
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BlogStatus)}
            className="nht-input"
          >
            {blogStatuses.map((value) => (
              <option key={value} value={value}>
                {statusLabels[value] ?? value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.coverImage}
          </span>
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder={labels.coverPlaceholder}
            className="nht-input"
          />
        </label>
      </div>

      <div>
        <p className="text-overline mb-3 text-[var(--nht-text-tertiary)]">
          {labels.locales}
        </p>
        <div className="flex flex-wrap gap-2">
          {locales.map((locale) => {
            const filled = isTranslationComplete(drafts[locale]);
            const active = activeLocale === locale;
            return (
              <button
                key={locale}
                type="button"
                onClick={() => setActiveLocale(locale)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--nht-border-hover)] bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]"
                    : filled
                      ? "border-white/15 text-white hover:bg-white/[0.04]"
                      : "border-white/[0.06] text-[var(--nht-text-tertiary)] hover:bg-white/[0.04]"
                }`}
              >
                {locale.toUpperCase()}
                {filled ? " •" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.title}
            </span>
            <input
              value={activeDraft.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="nht-input"
            />
          </label>

          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.slug}
            </span>
            <input
              value={activeDraft.slug}
              onChange={(e) =>
                patchDraft(activeLocale, { slug: e.target.value })
              }
              className="nht-input"
            />
          </label>

          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.excerpt}
            </span>
            <input
              value={activeDraft.excerpt}
              onChange={(e) =>
                patchDraft(activeLocale, { excerpt: e.target.value })
              }
              className="nht-input"
            />
          </label>
        </div>

        <div>
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.content}
          </span>
          <BlogEditor
            key={activeLocale}
            value={activeDraft.content}
            onChange={(content) => patchDraft(activeLocale, { content })}
            labels={labels.editor}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.seoTitle}
            </span>
            <input
              value={activeDraft.seo_title}
              onChange={(e) =>
                patchDraft(activeLocale, { seo_title: e.target.value })
              }
              className="nht-input"
            />
          </label>
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.seoDescription}
            </span>
            <input
              value={activeDraft.seo_description}
              onChange={(e) =>
                patchDraft(activeLocale, { seo_description: e.target.value })
              }
              className="nht-input"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition-colors hover:bg-white/[0.05]"
        >
          {labels.back}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {mode === "edit" && canDelete ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-full border border-white/15 px-5 py-3 text-sm text-[var(--nht-text-secondary)] transition-colors hover:bg-white/[0.05] disabled:opacity-60"
            >
              {isPending ? labels.deleting : labels.delete}
            </button>
          ) : null}
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="accent-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[var(--nht-shadow-glow)] disabled:opacity-60"
          >
            {mode === "create"
              ? isPending
                ? labels.creating
                : labels.create
              : isPending
                ? labels.saving
                : labels.save}
          </button>
        </div>
      </div>
    </div>
  );
}
