import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getApplication } from "@/features/applications/queries/get-application";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import ApplicationDetailPanel from "@/features/applications/components/ApplicationDetailPanel";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminApplicationDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.applications");

  let application;
  let managers;

  try {
    [application, managers] = await Promise.all([
      getApplication(id),
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

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("detailLabel")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {application.full_name}
          </h1>
          <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
            {application.email}
          </p>
        </div>
        <Link
          href="/admin/applications"
          className="text-xs text-[var(--nht-text-tertiary)] hover:text-[var(--nht-gold)]"
        >
          ← {t("backToList")}
        </Link>
      </div>

      <ApplicationDetailPanel
        application={application}
        managers={managers}
        locale={locale}
        labels={{
          fullName: t("fields.fullName"),
          email: t("fields.email"),
          platform: t("fields.platform"),
          locale: t("fields.locale"),
          message: t("fields.message"),
          status: t("fields.status"),
          priority: t("fields.priority"),
          manager: t("fields.manager"),
          notes: t("fields.notes"),
          created: t("fields.created"),
          updated: t("fields.updated"),
          lastContact: t("fields.lastContact"),
          unassigned: t("unassigned"),
          save: t("actions.save"),
          saving: t("actions.saving"),
          saved: t("actions.saved"),
          back: t("backToList"),
        }}
      />
    </div>
  );
}
