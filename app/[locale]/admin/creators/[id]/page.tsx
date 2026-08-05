import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import {
  CreatorProfileCrm,
  getCreatorProfile,
} from "@/features/creators/profile";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminCreatorDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff();

  const t = await getTranslations("admin.creators");
  const tActivity = await getTranslations("admin.activity");
  const tRoles = await getTranslations("admin.roles");

  let bundle;
  try {
    bundle = await getCreatorProfile(id);
  } catch (error) {
    console.error(error);
    return (
      <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
        {t("errors.loadDetail")}
      </div>
    );
  }

  if (!bundle) {
    notFound();
  }

  return (
    <CreatorProfileCrm
      bundle={bundle}
      locale={locale}
      labels={{
        tabs: {
          overview: t("profileCrm.tabs.overview"),
          platforms: t("profileCrm.tabs.platforms"),
          statistics: t("profileCrm.tabs.statistics"),
          tasks: t("profileCrm.tabs.tasks"),
          documents: t("profileCrm.tabs.documents"),
          finance: t("profileCrm.tabs.finance"),
          activity: t("profileCrm.tabs.activity"),
        },
        fields: {
          displayName: t("fields.displayName"),
          legalName: t("fields.legalName"),
          email: t("fields.email"),
          telegram: t("fields.telegram"),
          phone: t("fields.phone"),
          country: t("fields.country"),
          timezone: t("fields.timezone"),
          languages: t("fields.languages"),
          languagesPlaceholder: t("fields.languagesPlaceholder"),
          notes: t("fields.notes"),
          manager: t("fields.manager"),
          status: t("fields.status"),
          platforms: t("fields.platforms"),
          allStatuses: t("profileCrm.filters.allStatuses"),
          allAssignees: t("profileCrm.filters.allAssignees"),
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
        platformStatus: {
          linked: t("profileCrm.platformStatus.linked"),
          pending: t("profileCrm.platformStatus.pending"),
          disconnected: t("profileCrm.platformStatus.disconnected"),
          issue: t("profileCrm.platformStatus.issue"),
        },
        status: {
          new: t("status.new"),
          invited: t("status.invited"),
          active: t("status.active"),
          paused: t("status.paused"),
          vacation: t("status.vacation"),
          inactive: t("status.inactive"),
          banned: t("status.banned"),
        },
        stats: {
          monthlyRevenue: t("profileCrm.stats.thisMonth"),
          lifetimeRevenue: t("profileCrm.stats.revenue"),
          previousMonth: t("profileCrm.stats.lastMonth"),
          subscribers: t("profileCrm.stats.subscribers"),
          activeTasks: t("profileCrm.stats.tasks"),
          payoutBalance: t("profileCrm.stats.payoutBalance"),
          averageMonthly: t("profileCrm.stats.averageMonthly"),
        },
        finance: {
          income: t("profileCrm.finance.income"),
          commission: t("profileCrm.finance.commission"),
          payouts: t("profileCrm.finance.paid"),
          balance: t("profileCrm.finance.balance"),
        },
        tables: {
          tasks: {
            title: t("profileCrm.tables.tasks.title"),
            priority: t("profileCrm.tables.tasks.priority"),
            status: t("profileCrm.tables.tasks.status"),
            dueDate: t("profileCrm.tables.tasks.dueDate"),
            assignedBy: t("profileCrm.tables.tasks.assignedBy"),
          },
          documents: {
            document: t("profileCrm.tables.documents.document"),
            type: t("profileCrm.tables.documents.type"),
            status: t("profileCrm.tables.documents.status"),
            uploaded: t("profileCrm.tables.documents.uploaded"),
            actions: t("profileCrm.tables.documents.actions"),
            uploadedStatus: t("profileCrm.tables.documents.uploadedStatus"),
          },
          transactions: {
            date: t("profileCrm.tables.payouts.date"),
            amount: t("profileCrm.tables.payouts.amount"),
            status: t("profileCrm.tables.payouts.status"),
            method: t("profileCrm.tables.payouts.method"),
          },
          platforms: {
            username: t("profileCrm.tables.platforms.username"),
            link: t("profileCrm.tables.platforms.link"),
            status: t("fields.status"),
            connectedAt: t("profileCrm.tables.platforms.connectedAt"),
            followers: t("profileCrm.tables.platforms.followers"),
            revenue: t("profileCrm.tables.platforms.revenue"),
            lastSync: t("profileCrm.tables.platforms.lastSync"),
          },
        },
        actions: {
          edit: t("profileCrm.actions.edit"),
          archive: t("profileCrm.actions.archive"),
          delete: t("profileCrm.actions.delete"),
          save: t("actions.save"),
          saving: t("actions.saving"),
          cancel: t("form.cancel"),
          createTask: t("profileCrm.actions.createTask"),
          upload: t("profileCrm.actions.uploadDocument"),
          comingSoon: t("profileCrm.comingSoon"),
          confirmArchiveTitle: t("profileCrm.confirm.archiveTitle"),
          confirmArchiveDesc: t("profileCrm.confirm.archiveDescription"),
          confirmDeleteTitle: t("profileCrm.confirm.deleteTitle"),
          confirmDeleteDesc: t("profileCrm.confirm.deleteDescription"),
          confirm: t("profileCrm.confirm.confirm"),
          back: t("backToList"),
          empty: t("profileCrm.empty"),
          unassigned: t("unassigned"),
          impersonate: t("impersonate"),
          registered: t("fields.created"),
          lastActivity: t("fields.lastActivity"),
          connected: t("profileCrm.platformStatus.linked"),
          notConnected: t("profileCrm.notConnected"),
          saved: t("toast.saved"),
          archived: t("profileCrm.toast.archived"),
          deleted: t("profileCrm.toast.deleted"),
          error: t("actions.saveError"),
        },
        activity: {
          empty: t("profileCrm.activity.empty"),
          expand: tActivity("expandPayload"),
          collapse: tActivity("collapsePayload"),
          unknownActor: tActivity("unknownActor"),
        },
        moduleLabels: {
          creators: tActivity("modules.creators"),
          applications: tActivity("modules.applications"),
          finance: tActivity("modules.finance"),
          cabinet: tActivity("modules.cabinet"),
          admin: tActivity("modules.admin"),
          auth: tActivity("modules.auth"),
          blog: tActivity("modules.blog"),
          tasks: tActivity("modules.tasks"),
        },
        roleLabels: {
          owner: tRoles("owner"),
          admin: tRoles("admin"),
          manager: tRoles("manager"),
          support: tRoles("support"),
          finance: tRoles("finance"),
          content_manager: tRoles("content_manager"),
          creator: tRoles("creator"),
        },
        avatar: {
          upload: t("avatar.upload"),
          replace: t("avatar.replace"),
          delete: t("avatar.delete"),
          hint: t("avatar.hint"),
        },
      }}
    />
  );
}
