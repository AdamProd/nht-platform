import { getTranslations, setRequestLocale } from "next-intl/server";

type AdminPlaceholderProps = {
  locale: string;
  pageKey: "creators" | "blog" | "analytics" | "settings";
};

export default async function AdminPlaceholderPage({
  locale,
  pageKey,
}: AdminPlaceholderProps) {
  setRequestLocale(locale);
  const t = await getTranslations(`admin.pages.${pageKey}`);

  return (
    <div>
      <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
      <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
        {t("description")}
      </p>
    </div>
  );
}
