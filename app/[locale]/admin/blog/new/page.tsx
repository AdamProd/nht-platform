import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import BlogPostForm from "@/features/blog/posts/components/BlogPostForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBlogNewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.blog");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/blog"
          className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-accent-warm)]"
        >
          {t("backToList")}
        </Link>
        <p className="text-overline mt-4 text-[var(--nht-accent-warm)]">
          {t("label")}
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("newTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("newDescription")}
        </p>
      </div>

      <BlogPostForm
        mode="create"
        uiLocale={locale as Locale}
        statusLabels={{
          draft: t("statuses.draft"),
          published: t("statuses.published"),
          archived: t("statuses.archived"),
        }}
        labels={{
          status: t("form.status"),
          coverImage: t("form.coverImage"),
          coverPlaceholder: t("form.coverPlaceholder"),
          locales: t("form.locales"),
          title: t("form.title"),
          slug: t("form.slug"),
          excerpt: t("form.excerpt"),
          content: t("form.content"),
          seoTitle: t("form.seoTitle"),
          seoDescription: t("form.seoDescription"),
          save: t("form.save"),
          saving: t("form.saving"),
          create: t("form.create"),
          creating: t("form.creating"),
          delete: t("form.delete"),
          deleting: t("form.deleting"),
          back: t("backToList"),
          saved: t("toast.saved"),
          created: t("toast.created"),
          deleted: t("toast.deleted"),
          needTranslation: t("errors.needTranslation"),
          confirmDelete: t("form.confirmDelete"),
          editor: {
            bold: t("editor.bold"),
            italic: t("editor.italic"),
            h2: t("editor.h2"),
            h3: t("editor.h3"),
            bulletList: t("editor.bulletList"),
            orderedList: t("editor.orderedList"),
            code: t("editor.code"),
            link: t("editor.link"),
            linkUrl: t("editor.linkUrl"),
            undo: t("editor.undo"),
            redo: t("editor.redo"),
          },
        }}
      />
    </div>
  );
}
