import type {
  FinancePaymentMethod,
  FinanceTransactionStatus,
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
  revenueThisMonth: number;
  revenueThisYear: number;
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

export type FinanceActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type { FinanceTransactionStatus, FinancePaymentMethod };

export const FINANCE_PLATFORMS = [
  "onlyfans",
  "fansly",
  "chaturbate",
  "instagram",
  "tiktok",
  "twitter",
  "other",
] as const;

export type FinancePlatform = (typeof FINANCE_PLATFORMS)[number];
