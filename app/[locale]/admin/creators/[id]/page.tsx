import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireStaff } from "@/lib/auth";
import { getCreator } from "@/features/creators/queries/get-creator";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import CreatorHeader from "@/features/creators/components/CreatorHeader";
import CreatorInfo from "@/features/creators/components/CreatorInfo";
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
    new: t("statusValues.new"),
    active: t("statusValues.active"),
    paused: t("statusValues.paused"),
    vacation: t("statusValues.vacation"),
    inactive: t("statusValues.inactive"),
    banned: t("statusValues.banned"),
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

      <CreatorInfo
        creator={creator}
        locale={locale}
        labels={{
          email: t("fields.email"),
          telegram: t("fields.telegram"),
          country: t("fields.country"),
          languages: t("fields.languages"),
          platforms: t("fields.platforms"),
          manager: t("fields.manager"),
          status: t("fields.status"),
          notes: t("fields.notes"),
          application: t("fields.application"),
          created: t("fields.created"),
          updated: t("fields.updated"),
          unassigned: t("unassigned"),
          noApplication: t("noApplication"),
          viewApplication: t("viewApplication"),
        }}
        statusLabel={statusLabels[creator.status]}
      />

      <CreatorDetailPanel
        creator={creator}
        managers={managers}
        canAssignManager={canAssignManager}
        labels={{
          status: t("fields.status"),
          manager: t("fields.manager"),
          notes: t("fields.notes"),
          avatarUrl: t("fields.avatarUrl"),
          unassigned: t("unassigned"),
          save: t("actions.save"),
          saving: t("actions.saving"),
          saved: t("actions.saved"),
          saveError: t("actions.saveError"),
          uploadAvatar: t("actions.uploadAvatar"),
        }}
        statusLabels={statusLabels}
      />
    </div>
  );
}
