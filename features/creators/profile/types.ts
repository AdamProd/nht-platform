import type { CreatorDetail, CreatorPlatform } from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";
import type { CreatorTimelinePage } from "@/features/creators/profile/timeline/types/timeline";
import type { TaskListItem } from "@/features/tasks/types";
import type { Tables } from "@/types/database.types";

export type CreatorProfileTab =
  | "overview"
  | "platforms"
  | "statistics"
  | "tasks"
  | "documents"
  | "finance"
  | "timeline";

export type CreatorProfileStats = {
  revenue: number;
  thisMonth: number;
  lastMonth: number;
  tasks: number;
  unreadMessages: number;
  documents: number;
  subscribers: number | null;
  payoutBalance: number;
  averageMonthly: number;
};

export type CreatorFinanceSummary = {
  balance: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  paid: number;
  income: number;
  commission: number;
};

export type CreatorPlatformCard = {
  platform: CreatorPlatform;
  username: string | null;
  link: string | null;
  status: string | null;
  followers: number | null;
  revenue: number | null;
  lastSync: string | null;
  connectedAt: string | null;
};

export type CreatorProfileTask = TaskListItem;

export type CreatorProfileDocument = Tables<"creator_documents">;
export type CreatorProfilePayout = Tables<"creator_payouts">;
export type CreatorProfileTransaction = Tables<"finance_transactions">;

export type CreatorProfileBundle = {
  creator: CreatorDetail;
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canImpersonate: boolean;
  canReadFinance: boolean;
  stats: CreatorProfileStats;
  finance: CreatorFinanceSummary;
  platforms: CreatorPlatformCard[];
  tasks: CreatorProfileTask[];
  documents: CreatorProfileDocument[];
  payouts: CreatorProfilePayout[];
  transactions: CreatorProfileTransaction[];
  timeline: CreatorTimelinePage;
};
