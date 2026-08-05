import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireCreatorCabinet } from "@/lib/auth";
import CreatorShell from "@/components/creator/CreatorShell";
import { stopImpersonation } from "@/features/cabinet/impersonation/actions/impersonation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function CreatorLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireCreatorCabinet();
  const t = await getTranslations("creator");
  const userName =
    session.creator.display_name?.trim() ||
    session.profile.full_name?.trim() ||
    session.user.email?.split("@")[0] ||
    t("creatorFallback");

  return (
    <CreatorShell
      userName={userName}
      userRole={session.profile.role}
      userEmail={session.user.email}
      impersonating={session.impersonating}
      stopImpersonationAction={
        session.impersonating ? stopImpersonation : undefined
      }
    >
      {children}
    </CreatorShell>
  );
}
