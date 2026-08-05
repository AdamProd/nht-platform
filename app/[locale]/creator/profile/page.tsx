import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCabinetCreator } from "@/features/cabinet/queries/cabinet";
import ProfileForm from "@/features/cabinet/profile/components/ProfileForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.profile");
  const { creator } = await getCabinetCreator();

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
      <ProfileForm
        creator={creator}
        labels={{
          fields: {
            avatarUrl: t("fields.avatarUrl"),
            displayName: t("fields.displayName"),
            biography: t("fields.biography"),
            languages: t("fields.languages"),
            languagesPlaceholder: t("fields.languagesPlaceholder"),
            country: t("fields.country"),
            timezone: t("fields.timezone"),
            telegram: t("fields.telegram"),
            phone: t("fields.phone"),
            birthday: t("fields.birthday"),
            email: t("fields.email"),
          },
          actions: {
            save: t("actions.save"),
            saving: t("actions.saving"),
            saved: t("actions.saved"),
            saveError: t("actions.saveError"),
          },
          readonlyHint: t("readonlyHint"),
        }}
      />
    </div>
  );
}
