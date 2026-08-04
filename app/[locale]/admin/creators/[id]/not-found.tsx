import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CreatorNotFound() {
  const t = await getTranslations("admin.creators");

  return (
    <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-6 py-14 text-center">
      <p className="text-overline text-[var(--nht-gold)]">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
        {t("notFound.description")}
      </p>
      <Link
        href="/admin/creators"
        className="mt-8 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm text-white hover:bg-white/[0.05]"
      >
        ← {t("backToList")}
      </Link>
    </div>
  );
}
