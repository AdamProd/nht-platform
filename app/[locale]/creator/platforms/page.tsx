import { getTranslations, setRequestLocale } from "next-intl/server";
import { listPlatformAccounts } from "@/features/cabinet/queries/cabinet";
import PlatformsForm from "@/features/cabinet/platforms/components/PlatformsForm";

type Props = { params: Promise<{ locale: string }> };

export default async function CreatorPlatformsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("creator.platforms");
  const { accounts } = await listPlatformAccounts();

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
      <PlatformsForm
        accounts={accounts}
        labels={{
          fields: {
            username: t("fields.username"),
            profileUrl: t("fields.profileUrl"),
            status: t("fields.status"),
            managerNotes: t("fields.managerNotes"),
          },
          status: {
            linked: t("status.linked"),
            pending: t("status.pending"),
            disconnected: t("status.disconnected"),
            issue: t("status.issue"),
          },
          platforms: {
            onlyfans: t("platforms.onlyfans"),
            fansly: t("platforms.fansly"),
            manyvids: t("platforms.manyvids"),
            chaturbate: t("platforms.chaturbate"),
            instagram: t("platforms.instagram"),
            tiktok: t("platforms.tiktok"),
            twitter: t("platforms.twitter"),
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
