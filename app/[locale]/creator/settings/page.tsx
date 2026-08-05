import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSettings } from "@/features/cabinet/queries/cabinet";
import { SettingsForm } from "@/features/cabinet/dashboard/CabinetForms";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.settings");
  const { settings } = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
        <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
          {t("description")}
        </p>
      </div>
      <SettingsForm
        settings={settings}
        labels={{
          fields: {
            theme: t("fields.theme"),
            language: t("fields.language"),
            notifyTelegram: t("fields.notifyTelegram"),
            notifyEmail: t("fields.notifyEmail"),
          },
          themes: {
            dark: t("themes.dark"),
            light: t("themes.light"),
            system: t("themes.system"),
          },
          actions: {
            save: t("actions.save"),
            saving: t("actions.saving"),
            saved: t("actions.saved"),
            saveError: t("actions.saveError"),
          },
        }}
      />
    </div>
  );
}
