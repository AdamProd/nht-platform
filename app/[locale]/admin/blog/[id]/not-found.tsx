import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AdminBlogNotFound() {
  const t = await getTranslations("admin.blog");

  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-overline text-[var(--nht-accent-warm)]">404</p>
      <h1 className="text-2xl font-semibold text-white">{t("notFound.title")}</h1>
      <p className="text-sm text-[var(--nht-text-secondary)]">
        {t("notFound.description")}
      </p>
      <Link
        href="/admin/blog"
        className="inline-flex text-sm text-[var(--nht-accent-warm)] hover:text-white"
      >
        {t("backToList")}
      </Link>
    </div>
  );
}
