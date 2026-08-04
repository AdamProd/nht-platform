import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireStaff } from "@/lib/auth";
import { getCreator } from "@/features/creators/queries/get-creator";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import CreatorHeader from "@/features/creators/components/CreatorHeader";
import CreatorDetailPanel from "@/features/creators/components/CreatorDetailPanel";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminCreatorDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.creators");

  const canAssignManager =
    session.profile.role === "owner" || session.profile.role === "admin";

  let creator;
  let managers;

  try {
    [creator, managers] = await Promise.all([
      getCreator(id),
      listStaffManagers(),
    ]);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("errors.loadDetail")}
      </div>
    );
  }

  if (!creator) {
    notFound();
  }

  const statusLabels = {
    new: t("status.new"),
    active: t("status.active"),
    paused: t("status.paused"),
    vacation: t("status.vacation"),
    inactive: t("status.inactive"),
    banned: t("status.banned"),
  };

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    chaturbate: t("platforms.chaturbate"),
    instagram: t("platforms.instagram"),
    tiktok: t("platforms.tiktok"),
    twitter: t("platforms.twitter"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("detailLabel")}</p>
          <div className="mt-3">
            <CreatorHeader
              creator={creator}
              statusLabel={statusLabels[creator.status]}
            />
          </div>
        </div>
        <Link
          href="/admin/creators"
          className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-gold)]"
        >
          ← {t("backToList")}
        </Link>
      </div>

      <CreatorDetailPanel
        creator={creator}
        managers={managers}
        canAssignManager={canAssignManager}
        locale={locale}
        labels={{
          sections: {
            profile: t("sections.profile"),
            contacts: t("sections.contacts"),
            platforms: t("sections.platforms"),
            revenue: t("sections.revenue"),
            manager: t("sections.manager"),
            notes: t("sections.notes"),
            timeline: t("sections.timeline"),
          },
          fields: {
            displayName: t("fields.displayName"),
            legalName: t("fields.legalName"),
            birthday: t("fields.birthday"),
            country: t("fields.country"),
            languages: t("fields.languages"),
            languagesPlaceholder: t("fields.languagesPlaceholder"),
            timezone: t("fields.timezone"),
            email: t("fields.email"),
            telegram: t("fields.telegram"),
            phone: t("fields.phone"),
            avatarUrl: t("fields.avatarUrl"),
            status: t("fields.status"),
            manager: t("fields.manager"),
            notes: t("fields.notes"),
            revenueCurrent: t("fields.revenueCurrent"),
            revenuePrevious: t("fields.revenuePrevious"),
            revenueLifetime: t("fields.revenueLifetime"),
            payouts: t("fields.payouts"),
            created: t("fields.created"),
            updated: t("fields.updated"),
            lastLogin: t("fields.lastLogin"),
            lastActivity: t("fields.lastActivity"),
          },
          unassigned: t("unassigned"),
          save: t("actions.save"),
          saving: t("actions.saving"),
          saved: t("toast.saved"),
          saveError: t("actions.saveError"),
        }}
        statusLabels={statusLabels}
        platformLabels={platformLabels}
      />
    </div>
  );
}
