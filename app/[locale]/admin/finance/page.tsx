import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireStaff, isAdminOrAbove } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import { redirect } from "@/i18n/navigation";
import { listActiveFinanceManagers } from "@/features/finance/transactions/queries/list-finance-managers";
import {
  getFinanceDashboardKpis,
  getFinanceSummaries,
  listFinanceCreators,
  getFinanceCharts,
  getMonthlyReport,
} from "@/features/finance/reports";
import { listFinanceTransactions } from "@/features/finance/transactions/queries/list-transactions";
import {
  listFinancePayouts,
  listCreatorBalances,
} from "@/features/finance/payouts";
import type { CreatorBalanceRow } from "@/features/finance/payouts";
import FinanceKpiCards from "@/features/finance/reports/components/FinanceKpiCards";
import FinanceSummaries from "@/features/finance/reports/components/FinanceSummaries";
import FinanceChartCard from "@/features/finance/reports/components/FinanceChartCard";
import FinanceFilters from "@/features/finance/transactions/components/FinanceFilters";
import FinanceTable from "@/features/finance/transactions/components/FinanceTable";
import FinancePagination from "@/features/finance/transactions/components/FinancePagination";
import CreateTransactionForm from "@/features/finance/transactions/components/CreateTransactionForm";
import FinanceTabs from "@/features/finance/components/FinanceTabs";
import PayoutsTable from "@/features/finance/payouts/components/PayoutsTable";
import CreatorBalancesGrid from "@/features/finance/payouts/components/CreatorBalancesGrid";
import ExportButtons from "@/features/finance/exports/ExportButtons";
import ReportFilters from "@/features/finance/reports/components/ReportFilters";
import ErrorState from "@/shared/ui/ErrorState";
import MoneyCell from "@/features/finance/transactions/components/MoneyCell";
import type {
  FinancePaymentMethod,
  FinancePlatform,
  FinanceTab,
  FinanceTransactionStatus,
  PayoutStatus,
} from "@/features/finance/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseTab(value: string): FinanceTab {
  if (
    value === "transactions" ||
    value === "payouts" ||
    value === "reports" ||
    value === "commissions"
  ) {
    return value;
  }
  return "overview";
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

  const tab = parseTab(first(sp.tab));
  if (tab === "commissions") {
    redirect({ href: "/admin/finance/commissions", locale });
  }

  const q = first(sp.q);
  const status = first(sp.status);
  const platform = first(sp.platform);
  const creator = first(sp.creator);
  const manager = first(sp.manager);
  const from = first(sp.from);
  const to = first(sp.to);
  const sort = first(sp.sort) || "date_desc";
  const page = first(sp.page) || "1";
  const month = first(sp.month) || String(new Date().getMonth() + 1);
  const year = first(sp.year) || String(new Date().getFullYear());

  const canAssignManager = isAdminOrAbove(session.profile.role);
  const canCreate = hasPermission(session.profile.role, "finance.create");
  const canApprove = hasPermission(session.profile.role, "finance.approve");
  const canExport = hasPermission(session.profile.role, "finance.export");

  let loadError: string | null = null;
  let kpis: Awaited<ReturnType<typeof getFinanceDashboardKpis>>;
  let summaries: Awaited<ReturnType<typeof getFinanceSummaries>>;
  let list: Awaited<ReturnType<typeof listFinanceTransactions>>;
  let payouts: Awaited<ReturnType<typeof listFinancePayouts>>;
  let charts: Awaited<ReturnType<typeof getFinanceCharts>>;
  let report: Awaited<ReturnType<typeof getMonthlyReport>>;
  let creators: Awaited<ReturnType<typeof listFinanceCreators>>;
  let managers: Awaited<ReturnType<typeof listActiveFinanceManagers>>;
  let balances: CreatorBalanceRow[] = [];

  try {
    const base = await Promise.all([
      getFinanceDashboardKpis(),
      listFinanceCreators(),
      listActiveFinanceManagers(),
    ]);
    kpis = base[0];
    creators = base[1];
    managers = base[2];

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
    payouts = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    charts = {
      revenueByMonth: [],
      revenueByPlatform: [],
      revenueByCreator: [],
      agencyProfitByMonth: [],
      payoutsByMonth: [],
    };
    report = {
      month: Number(month),
      year: Number(year),
      creatorId: null,
      platform: null,
      revenue: 0,
      commission: 0,
      expenses: 0,
      netProfit: 0,
    };

    if (tab === "overview") {
      [summaries, charts, balances] = await Promise.all([
        getFinanceSummaries(),
        getFinanceCharts(),
        listCreatorBalances(),
      ]);
    } else if (tab === "transactions") {
      list = await listFinanceTransactions({
        q,
        status,
        platform,
        creator,
        manager,
        from,
        to,
        page,
        sort,
      });
    } else if (tab === "payouts") {
      payouts = await listFinancePayouts({
        q,
        status,
        creator,
        page,
      });
    } else if (tab === "reports") {
      [charts, report] = await Promise.all([
        getFinanceCharts(),
        getMonthlyReport({
          month: Number(month),
          year: Number(year),
          creatorId: creator || undefined,
          platform: platform || undefined,
        }),
      ]);
    }
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
      outstandingBalance: 0,
      averageRevenuePerCreator: 0,
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
    payouts = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 1 };
    charts = {
      revenueByMonth: [],
      revenueByPlatform: [],
      revenueByCreator: [],
      agencyProfitByMonth: [],
      payoutsByMonth: [],
    };
    report = {
      month: Number(month) || 1,
      year: Number(year) || new Date().getFullYear(),
      creatorId: null,
      platform: null,
      revenue: 0,
      commission: 0,
      expenses: 0,
      netProfit: 0,
    };
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

  const payoutStatusLabels = {
    pending: t("payoutStatus.pending"),
    processing: t("payoutStatus.processing"),
    completed: t("payoutStatus.completed"),
    failed: t("payoutStatus.failed"),
  } satisfies Record<PayoutStatus, string>;

  const platformLabels = {
    onlyfans: t("platforms.onlyfans"),
    fansly: t("platforms.fansly"),
    manyvids: t("platforms.manyvids"),
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

  const payoutMethodLabels = {
    bank: t("payoutMethods.bank"),
    paypal: t("payoutMethods.paypal"),
    crypto: t("payoutMethods.crypto"),
    other: t("payoutMethods.other"),
  };

  const tabQuery = {
    q,
    status,
    platform,
    creator,
    manager,
    from,
    to,
    sort: sort === "date_desc" ? "" : sort,
  };

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
        {canCreate && (tab === "overview" || tab === "transactions") ? (
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

      <FinanceTabs
        active={tab}
        labels={{
          overview: t("tabs.overview"),
          transactions: t("tabs.transactions"),
          payouts: t("tabs.payouts"),
          reports: t("tabs.reports"),
          commissions: t("tabs.commissions"),
        }}
        query={tabQuery}
      />

      {loadError ? (
        <ErrorState
          title={loadError}
          retryHref="/admin/finance"
          retryLabel={t("retry")}
        />
      ) : null}

      {!loadError && (tab === "overview" || tab === "transactions" || tab === "payouts" || tab === "reports") ? (
        <FinanceKpiCards
          kpis={kpis}
          locale={locale}
          labels={{
            totalRevenue: t("kpis.totalRevenue"),
            agencyRevenue: t("kpis.agencyRevenue"),
            pendingPayouts: t("kpis.pendingPayouts"),
            paidThisMonth: t("kpis.paidThisMonth"),
            outstandingBalance: t("kpis.outstandingBalance"),
            averageRevenuePerCreator: t("kpis.averageRevenuePerCreator"),
          }}
        />
      ) : null}

      {!loadError && tab === "overview" ? (
        <div className="space-y-6">
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
          <div className="grid gap-4 xl:grid-cols-2">
            <FinanceChartCard
              title={t("charts.revenueByMonth")}
              points={charts.revenueByMonth}
              empty={t("charts.empty")}
            />
            <FinanceChartCard
              title={t("charts.agencyProfit")}
              points={charts.agencyProfitByMonth}
              empty={t("charts.empty")}
            />
            <FinanceChartCard
              title={t("charts.revenueByPlatform")}
              points={charts.revenueByPlatform}
              empty={t("charts.empty")}
              variant="bar"
            />
            <FinanceChartCard
              title={t("charts.revenueByCreator")}
              points={charts.revenueByCreator}
              empty={t("charts.empty")}
              variant="bar"
            />
            <FinanceChartCard
              title={t("charts.payouts")}
              points={charts.payoutsByMonth}
              empty={t("charts.empty")}
              variant="bar"
            />
          </div>
          <CreatorBalancesGrid
            items={balances}
            locale={locale}
            labels={{
              title: t("balances.title"),
              empty: t("balances.empty"),
              currentBalance: t("balances.currentBalance"),
              pending: t("balances.pending"),
              paid: t("balances.paid"),
              lifetimeRevenue: t("balances.lifetimeRevenue"),
            }}
          />
        </div>
      ) : null}

      {!loadError && tab === "transactions" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-white">
              {t("transactionsTitle")}
            </h2>
            {canExport ? (
              <ExportButtons
                kind="transactions"
                filters={{ status, creator, platform, from, to }}
                labels={{
                  export: t("export.label"),
                  csv: t("export.csv"),
                  excel: t("export.excel"),
                  pdf: t("export.pdf"),
                  error: t("export.error"),
                }}
              />
            ) : null}
          </div>
          <FinanceFilters
            q={q}
            status={status}
            platform={platform}
            creator={creator}
            manager={manager}
            from={from}
            to={to}
            sort={sort}
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
              sort: t("filters.sort"),
              all: t("filters.all"),
              apply: t("filters.apply"),
              clear: t("filters.clear"),
            }}
            sortLabels={{
              date_desc: t("sort.date_desc"),
              date_asc: t("sort.date_asc"),
              gross_desc: t("sort.gross_desc"),
              gross_asc: t("sort.gross_asc"),
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
              emptyTitle: t("emptyTitle"),
              emptyDescription: t("emptyDescription"),
              emptyAction: t("emptyAction"),
            }}
            statusLabels={statusLabels}
            platformLabels={platformLabels}
            canCreate={canCreate}
          />
          <FinancePagination
            page={list.page}
            totalPages={list.totalPages}
            total={list.total}
            searchParams={{
              tab: "transactions",
              q,
              status,
              platform,
              creator,
              manager,
              from,
              to,
              sort: sort === "date_desc" ? "" : sort,
            }}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              pageOf: t("pagination.pageOf", {
                page: list.page,
                totalPages: list.totalPages,
                total: list.total,
              }),
            }}
          />
        </div>
      ) : null}

      {!loadError && tab === "payouts" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-white">{t("payoutsTitle")}</h2>
            {canExport ? (
              <ExportButtons
                kind="payouts"
                filters={{ status, creator }}
                labels={{
                  export: t("export.label"),
                  csv: t("export.csv"),
                  excel: t("export.excel"),
                  pdf: t("export.pdf"),
                  error: t("export.error"),
                }}
              />
            ) : null}
          </div>
          <PayoutsTable
            items={payouts.items}
            locale={locale}
            canApprove={canApprove}
            labels={{
              creator: t("payoutsTable.creator"),
              amount: t("payoutsTable.amount"),
              currency: t("payoutsTable.currency"),
              method: t("payoutsTable.method"),
              requested: t("payoutsTable.requested"),
              approved: t("payoutsTable.approved"),
              paid: t("payoutsTable.paid"),
              status: t("payoutsTable.status"),
              actions: t("payoutsTable.actions"),
              approve: t("payoutActions.approve"),
              reject: t("payoutActions.reject"),
              pay: t("payoutActions.pay"),
              view: t("payoutActions.view"),
              empty: t("payoutsEmpty"),
              rejectReason: t("payoutActions.rejectReason"),
              cancel: t("form.cancel"),
              confirmReject: t("payoutActions.confirmReject"),
            }}
            statusLabels={payoutStatusLabels}
            methodLabels={payoutMethodLabels}
          />
          <FinancePagination
            page={payouts.page}
            totalPages={payouts.totalPages}
            total={payouts.total}
            searchParams={{
              tab: "payouts",
              q,
              status,
              creator,
            }}
            labels={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              pageOf: t("pagination.pageOf", {
                page: payouts.page,
                totalPages: payouts.totalPages,
                total: payouts.total,
              }),
            }}
          />
        </div>
      ) : null}

      {!loadError && tab === "reports" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-white">{t("reportsTitle")}</h2>
            {canExport ? (
              <ExportButtons
                kind="report"
                filters={{
                  month: Number(month),
                  year: Number(year),
                  creatorId: creator,
                  platform,
                }}
                labels={{
                  export: t("export.label"),
                  csv: t("export.csv"),
                  excel: t("export.excel"),
                  pdf: t("export.pdf"),
                  error: t("export.error"),
                }}
              />
            ) : null}
          </div>

          <ReportFilters
            month={month}
            year={year}
            creator={creator}
            platform={platform}
            creators={creators.map((item) => ({
              value: item.id,
              label: item.display_name || item.full_name,
            }))}
            platforms={Object.entries(platformLabels).map(([value, label]) => ({
              value,
              label,
            }))}
            labels={{
              month: t("reports.month"),
              year: t("reports.year"),
              creator: t("filters.creator"),
              platform: t("filters.platform"),
              all: t("filters.all"),
              apply: t("filters.apply"),
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["revenue", report.revenue],
              ["commission", report.commission],
              ["expenses", report.expenses],
              ["netProfit", report.netProfit],
            ].map(([key, value]) => (
              <div
                key={key}
                className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <p className="text-overline text-[var(--nht-text-tertiary)]">
                  {t(`reports.${key}`)}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  <MoneyCell value={Number(value)} locale={locale} />
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <FinanceChartCard
              title={t("charts.revenueByMonth")}
              points={charts.revenueByMonth}
              empty={t("charts.empty")}
            />
            <FinanceChartCard
              title={t("charts.revenueByCreator")}
              points={charts.revenueByCreator}
              empty={t("charts.empty")}
              variant="bar"
            />
            <FinanceChartCard
              title={t("charts.revenueByPlatform")}
              points={charts.revenueByPlatform}
              empty={t("charts.empty")}
              variant="bar"
            />
            <FinanceChartCard
              title={t("charts.agencyProfit")}
              points={charts.agencyProfitByMonth}
              empty={t("charts.empty")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
