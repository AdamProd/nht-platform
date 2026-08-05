import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function FinanceNotFound() {
  const t = await getTranslations("admin.finance.notFound");

  return (
    <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-8 text-center">
      <h1 className="text-xl font-semibold text-white">{t("title")}</h1>
      <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
        {t("description")}
      </p>
      <Link
        href="/admin/finance"
        className="mt-6 inline-block text-xs text-[var(--nht-gold)] hover:text-white"
      >
        {t("back")}
      </Link>
    </div>
  );
}
