import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff, isAdminOrAbove } from "@/lib/auth";
import { hasPermission } from "@/features/staff/permissions";
import { listActiveFinanceManagers } from "@/features/finance/queries/list-finance-managers";
import {
  getFinanceDashboardKpis,
  getFinanceSummaries,
  listFinanceCreators,
} from "@/features/finance/queries/get-finance-dashboard";
import { listFinanceTransactions } from "@/features/finance/queries/list-transactions";
import FinanceKpiCards from "@/features/finance/components/FinanceKpiCards";
import FinanceSummaries from "@/features/finance/components/FinanceSummaries";
import FinanceIntegrations from "@/features/finance/components/FinanceIntegrations";
import FinanceFilters from "@/features/finance/components/FinanceFilters";
import FinanceTable from "@/features/finance/components/FinanceTable";
import FinancePagination from "@/features/finance/components/FinancePagination";
import CreateTransactionForm from "@/features/finance/components/CreateTransactionForm";
import type {
  FinancePaymentMethod,
  FinancePlatform,
  FinanceTransactionStatus,
} from "@/features/finance/types";
import { redirect } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AdminFinancePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff();
  const t = await getTranslations("admin.finance");
  const sp = await searchParams;

  if (!hasPermission(session.profile.role, "finance.read")) {
    redirect({ href: "/admin", locale });
  }

  const q = first(sp.q);
  const status = first(sp.status);
  const platform = first(sp.platform);
  const creator = first(sp.creator);
  const manager = first(sp.manager);
  const from = first(sp.from);
  const to = first(sp.to);
  const page = first(sp.page) || "1";

  const canAssignManager = isAdminOrAbove(session.profile.role);
  const canCreate = hasPermission(session.profile.role, "finance.create");

  let loadError: string | null = null;
  let kpis: Awaited<ReturnType<typeof getFinanceDashboardKpis>>;
  let summaries: Awaited<ReturnType<typeof getFinanceSummaries>>;
  let list: Awaited<ReturnType<typeof listFinanceTransactions>>;
  let creators: Awaited<ReturnType<typeof listFinanceCreators>>;
  let managers: Awaited<ReturnType<typeof listActiveFinanceManagers>>;

  try {
    [kpis, summaries, list, creators, managers] = await Promise.all([
      getFinanceDashboardKpis(),
      getFinanceSummaries(),
      listFinanceTransactions({
        q,
        status,
        platform,
        creator,
        manager,
        from,
        to,
        page,
      }),
      listFinanceCreators(),
      listActiveFinanceManagers(),
    ]);
  } catch (error) {
    console.error(error);
    loadError = t("errors.load");
    kpis = {
      totalRevenue: 0,
      agencyRevenue: 0,
      creatorRevenue: 0,
      pendingPayouts: 0,
      paidThisMonth: 0,
      activeCreators: 0,
      revenueToday: 0,
      revenueThisWeek: 0,
      revenueThisMonth: 0,
      revenueThisYear: 0,
      countPending: 0,
      countApproved: 0,
      countRejected: 0,
      countPaid: 0,
    };
    summaries = {
      creator: {
        lifetimeRevenue: 0,
        thisMonth: 0,
        pendingPayout: 0,
        lastPayout: null,
        averageMonthlyRevenue: 0,
      },
      agency: { monthlyRevenue: 0, quarterRevenue: 0, yearRevenue: 0 },
    };
    list = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    creators = [];
    managers = [];
  }

  const statusLabels = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    paid: t("status.paid"),
    cancelled: t("status.cancelled"),
    disputed: t("status.disputed"),
  } satisfies Record<FinanceTransactionStatus, string>;

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    chaturbate: t("platforms.chaturbate"),
    instagram: t("platforms.instagram"),
    tiktok: t("platforms.tiktok"),
    twitter: t("platforms.twitter"),
    other: t("platforms.other"),
  } satisfies Record<FinancePlatform, string>;

  const methodLabels = {
    stripe: t("methods.stripe"),
    wise: t("methods.wise"),
    paypal: t("methods.paypal"),
    crypto: t("methods.crypto"),
    bank_transfer: t("methods.bankTransfer"),
    other: t("methods.other"),
  } satisfies Record<FinancePaymentMethod, string>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-overline text-[var(--nht-gold)]">{t("label")}</p>
          <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--nht-text-secondary)]">
            {t("description")}
          </p>
        </div>
        {canCreate ? (
          <CreateTransactionForm
            creators={creators}
            managers={managers}
            canAssignManager={canAssignManager}
            labels={{
              title: t("form.title"),
              open: t("form.open"),
              cancel: t("form.cancel"),
              submit: t("form.submit"),
              submitting: t("form.submitting"),
              saved: t("toast.created"),
              saveError: t("actions.saveError"),
              fields: {
                creator: t("fields.creator"),
                manager: t("fields.manager"),
                platform: t("fields.platform"),
                date: t("fields.date"),
                gross: t("fields.gross"),
                currency: t("fields.currency"),
                agencyPercent: t("fields.agencyPercent"),
                status: t("fields.status"),
                paymentMethod: t("fields.paymentMethod"),
                referenceId: t("fields.referenceId"),
                notes: t("fields.notes"),
                unassigned: t("unassigned"),
                none: t("none"),
              },
            }}
            statusLabels={statusLabels}
            platformLabels={platformLabels}
            methodLabels={methodLabels}
          />
        ) : null}
      </div>

      {loadError ? (
        <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-sm text-[var(--nht-text-secondary)]">
          {loadError}
        </div>
      ) : (
        <>
          <FinanceKpiCards
            kpis={kpis}
            locale={locale}
            labels={{
              totalRevenue: t("kpis.totalRevenue"),
              agencyRevenue: t("kpis.agencyRevenue"),
              creatorRevenue: t("kpis.creatorRevenue"),
              pendingPayouts: t("kpis.pendingPayouts"),
              paidThisMonth: t("kpis.paidThisMonth"),
              activeCreators: t("kpis.activeCreators"),
              revenueToday: t("kpis.revenueToday"),
              revenueThisWeek: t("kpis.revenueThisWeek"),
              revenueThisMonth: t("kpis.revenueThisMonth"),
              revenueThisYear: t("kpis.revenueThisYear"),
              countPending: t("kpis.countPending"),
              countApproved: t("kpis.countApproved"),
              countRejected: t("kpis.countRejected"),
              countPaid: t("kpis.countPaid"),
            }}
          />

          <FinanceSummaries
            creator={summaries.creator}
            agency={summaries.agency}
            locale={locale}
            labels={{
              creatorTitle: t("summaries.creatorTitle"),
              agencyTitle: t("summaries.agencyTitle"),
              lifetimeRevenue: t("summaries.lifetimeRevenue"),
              thisMonth: t("summaries.thisMonth"),
              pendingPayout: t("summaries.pendingPayout"),
              lastPayout: t("summaries.lastPayout"),
              averageMonthly: t("summaries.averageMonthly"),
              monthlyRevenue: t("summaries.monthlyRevenue"),
              quarterRevenue: t("summaries.quarterRevenue"),
              yearRevenue: t("summaries.yearRevenue"),
              none: t("none"),
            }}
          />

          <FinanceIntegrations
            labels={{
              title: t("integrations.title"),
              description: t("integrations.description"),
              comingSoon: t("integrations.comingSoon"),
              providers: {
                stripe: t("methods.stripe"),
                wise: t("methods.wise"),
                paypal: t("methods.paypal"),
                crypto: t("methods.crypto"),
                bankTransfer: t("methods.bankTransfer"),
              },
            }}
          />

          <div className="space-y-4">
            <h2 className="text-sm font-medium text-white">
              {t("transactionsTitle")}
            </h2>
            <FinanceFilters
              q={q}
              status={status}
              platform={platform}
              creator={creator}
              manager={manager}
              from={from}
              to={to}
              creators={creators}
              managers={managers}
              canFilterManager={canAssignManager}
              labels={{
                search: t("filters.search"),
                searchPlaceholder: t("filters.searchPlaceholder"),
                status: t("filters.status"),
                platform: t("filters.platform"),
                creator: t("filters.creator"),
                manager: t("filters.manager"),
                from: t("filters.from"),
                to: t("filters.to"),
                all: t("filters.all"),
                apply: t("filters.apply"),
                clear: t("filters.clear"),
              }}
              statusLabels={statusLabels}
              platformLabels={platformLabels}
            />
            <FinanceTable
              items={list.items}
              locale={locale}
              labels={{
                date: t("table.date"),
                creator: t("table.creator"),
                platform: t("table.platform"),
                gross: t("table.gross"),
                agencyPercent: t("table.agencyPercent"),
                agencyAmount: t("table.agencyAmount"),
                creatorPercent: t("table.creatorPercent"),
                creatorAmount: t("table.creatorAmount"),
                status: t("table.status"),
                manager: t("table.manager"),
                actions: t("table.actions"),
                view: t("table.view"),
                empty: t("empty"),
                unassigned: t("unassigned"),
              }}
              statusLabels={statusLabels}
              platformLabels={platformLabels}
            />
            <FinancePagination
              page={list.page}
              totalPages={list.totalPages}
              total={list.total}
              searchParams={{
                q,
                status,
                platform,
                creator,
                manager,
                from,
                to,
              }}
              labels={{
                previous: t("pagination.previous"),
                next: t("pagination.next"),
                pageOf: t("pagination.pageOf"),
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
