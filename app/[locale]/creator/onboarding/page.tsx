import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireCreatorCabinet } from "@/lib/auth";
import OnboardingForm from "@/features/cabinet/components/OnboardingForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CreatorOnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireCreatorCabinet("/creator/onboarding");
  const t = await getTranslations("creator.onboarding");

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
      <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 text-sm text-[var(--nht-text-secondary)]">
        {t("description")}
      </p>
      <OnboardingForm
        defaults={{
          avatar_url: session.creator.avatar_url ?? "",
          biography: session.creator.biography ?? "",
          timezone: session.creator.timezone ?? "",
          languages: (session.creator.languages ?? []).join(", "),
          phone: session.creator.phone ?? "",
        }}
        labels={{
          avatarUrl: t("fields.avatarUrl"),
          biography: t("fields.biography"),
          timezone: t("fields.timezone"),
          languages: t("fields.languages"),
          languagesPlaceholder: t("fields.languagesPlaceholder"),
          phone: t("fields.phone"),
          submit: t("actions.submit"),
          submitting: t("actions.submitting"),
        }}
      />
    </div>
  );
}
