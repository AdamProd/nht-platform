import type {
  FinancePaymentMethod,
  FinanceTransactionStatus,
  PayoutStatus,
  Tables,
} from "@/types/database.types";

export type FinanceCreatorOption = {
  id: string;
  display_name: string;
  full_name: string;
  manager_id: string | null;
};

export type FinanceManagerOption = {
  id: string;
  full_name: string | null;
};

export type FinanceTransactionListItem = Tables<"finance_transactions"> & {
  creator: {
    id: string;
    display_name: string;
    full_name: string;
    email: string;
  } | null;
  manager: FinanceManagerOption | null;
};

export type FinanceTransactionDetail = FinanceTransactionListItem;

export type FinanceListResult = {
  items: FinanceTransactionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type FinanceDashboardKpis = {
  totalRevenue: number;
  agencyRevenue: number;
  creatorRevenue: number;
  pendingPayouts: number;
  paidThisMonth: number;
  activeCreators: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  countPending: number;
  countApproved: number;
  countRejected: number;
  countPaid: number;
  outstandingBalance: number;
  averageRevenuePerCreator: number;
};

export type FinanceCreatorSummary = {
  lifetimeRevenue: number;
  thisMonth: number;
  pendingPayout: number;
  lastPayout: number | null;
  averageMonthlyRevenue: number;
};

export type FinanceAgencySummary = {
  monthlyRevenue: number;
  quarterRevenue: number;
  yearRevenue: number;
};

export type FinancePayoutListItem = Tables<"creator_payouts"> & {
  creator: {
    id: string;
    display_name: string;
    full_name: string;
    email: string;
    manager_id: string | null;
  } | null;
};

export type FinancePayoutListResult = {
  items: FinancePayoutListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CommissionSettings = Tables<"commission_settings">;

export type CommissionHistoryItem = Tables<"commission_history"> & {
  changed_by_profile: FinanceManagerOption | null;
};

export type FinanceChartPoint = {
  label: string;
  value: number;
};

export type FinanceCharts = {
  revenueByMonth: FinanceChartPoint[];
  revenueByPlatform: FinanceChartPoint[];
  revenueByCreator: FinanceChartPoint[];
  agencyProfitByMonth: FinanceChartPoint[];
  payoutsByMonth: FinanceChartPoint[];
};

export type MonthlyReport = {
  month: number;
  year: number;
  creatorId: string | null;
  platform: string | null;
  revenue: number;
  commission: number;
  expenses: number;
  netProfit: number;
};

export type FinanceExportFormat = "csv" | "excel" | "pdf";

export type FinanceExportKind = "transactions" | "payouts" | "report";

export type FinanceTab =
  | "overview"
  | "transactions"
  | "payouts"
  | "commissions"
  | "reports";

export type CreatorBalance = {
  currentBalance: number;
  pending: number;
  paid: number;
  lifetimeRevenue: number;
};

export type FinanceActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type FinanceExportResult =
  | {
      success: true;
      filename: string;
      mime: string;
      content: string;
    }
  | { success: false; error: string };

export type { FinanceTransactionStatus, FinancePaymentMethod, PayoutStatus };

export const FINANCE_PLATFORMS = [
  "onlyfans",
  "fansly",
  "manyvids",
  "chaturbate",
  "instagram",
  "tiktok",
  "twitter",
  "other",
] as const;

export type FinancePlatform = (typeof FINANCE_PLATFORMS)[number];

export const FINANCE_SORT_OPTIONS = [
  "date_desc",
  "date_asc",
  "gross_desc",
  "gross_asc",
] as const;

export type FinanceSort = (typeof FINANCE_SORT_OPTIONS)[number];
