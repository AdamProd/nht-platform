import type { Tables } from "@/types/database.types";
import { canImpersonateCreator, requireStaffSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/features/core/permissions";
import { listStaffManagers } from "@/features/applications/queries/list-managers";
import { getCreator } from "@/features/creators/queries/get-creator";
import { CREATOR_PLATFORMS } from "@/features/creators/types";
import { visiblePlatformAccounts } from "@/features/creators/lib/avatar";
import { listCreatorActivity } from "@/features/creators/profile/queries/list-creator-activity";
import type {
  CreatorPlatformCard,
  CreatorProfileBundle,
  CreatorProfileDocument,
  CreatorProfilePayout,
  CreatorProfileTask,
} from "@/features/creators/profile/types";

async function safeQuery<T>(
  label: string,
  run: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[getCreatorProfile.${label}]`, error);
    return fallback;
  }
}

/** Canonical profile loader for `/admin/creators/[id]`. */
export async function getCreatorProfile(
  creatorId: string,
): Promise<CreatorProfileBundle | null> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "creators.read")) {
    throw new Error("Forbidden");
  }

  const creator = await getCreator(creatorId);
  if (!creator) return null;

  const supabase = await createClient();
  const canReadFinance = hasPermission(session.profile.role, "finance.read");

  const [
    managers,
    tasks,
    documents,
    payouts,
    accounts,
    tickets,
    activity,
    transactions,
  ] = await Promise.all([
    safeQuery("managers", () => listStaffManagers(), []),
    safeQuery(
      "tasks",
      async () => {
        const { data, error } = await supabase
          .from("creator_tasks")
          .select(
            `
            *,
            manager:profiles!creator_tasks_manager_id_fkey (
              id,
              full_name
            )
          `,
          )
          .eq("creator_id", creatorId)
          .order("deadline", { ascending: true, nullsFirst: false });
        if (error) throw new Error(error.message);
        return (data ?? []) as CreatorProfileTask[];
      },
      [] as CreatorProfileTask[],
    ),
    safeQuery(
      "documents",
      async () => {
        const { data, error } = await supabase
          .from("creator_documents")
          .select("*")
          .eq("creator_id", creatorId)
          .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return (data ?? []) as CreatorProfileDocument[];
      },
      [] as CreatorProfileDocument[],
    ),
    safeQuery(
      "payouts",
      async () => {
        const { data, error } = await supabase
          .from("creator_payouts")
          .select("*")
          .eq("creator_id", creatorId)
          .order("period_end", { ascending: false });
        if (error) throw new Error(error.message);
        return (data ?? []) as CreatorProfilePayout[];
      },
      [] as CreatorProfilePayout[],
    ),
    safeQuery(
      "accounts",
      async () => {
        const { data, error } = await supabase
          .from("creator_platform_accounts")
          .select("*")
          .eq("creator_id", creatorId);
        if (error) throw new Error(error.message);
        return (data ?? []) as Tables<"creator_platform_accounts">[];
      },
      [] as Tables<"creator_platform_accounts">[],
    ),
    safeQuery(
      "tickets",
      async () => {
        const { data, error } = await supabase
          .from("creator_support_tickets")
          .select("unread_for_creator")
          .eq("creator_id", creatorId);
        if (error) throw new Error(error.message);
        return (data ?? []) as { unread_for_creator: number | null }[];
      },
      [] as { unread_for_creator: number | null }[],
    ),
    safeQuery("activity", () => listCreatorActivity(creatorId), []),
    safeQuery(
      "transactions",
      async () => {
        if (!canReadFinance) return [] as Tables<"finance_transactions">[];
        const { data, error } = await supabase
          .from("finance_transactions")
          .select("*")
          .eq("creator_id", creatorId)
          .order("transaction_date", { ascending: false })
          .limit(50);
        if (error) throw new Error(error.message);
        return (data ?? []) as Tables<"finance_transactions">[];
      },
      [] as Tables<"finance_transactions">[],
    ),
  ]);

  const urlAccounts = visiblePlatformAccounts(creator.platform_accounts);
  const accountByPlatform = new Map(
    accounts.map((row) => [row.platform, row]),
  );

  const platforms: CreatorPlatformCard[] = CREATOR_PLATFORMS.map((platform) => {
    const row = accountByPlatform.get(platform);
    const link = row?.profile_url || urlAccounts[platform] || null;
    return {
      platform,
      username: row?.username ?? null,
      link,
      status: row?.status ?? (link ? "linked" : null),
      followers: null,
      revenue: null,
      lastSync: row?.updated_at ?? null,
      connectedAt: row?.created_at ?? null,
    };
  });

  const pending = payouts
    .filter((row) => row.status === "pending" || row.status === "processing")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const paid = payouts
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + Number(row.amount), 0);

  const agencyCommission = transactions.reduce(
    (sum, row) => sum + Number(row.agency_amount ?? 0),
    0,
  );
  const income = transactions.reduce(
    (sum, row) => sum + Number(row.gross_revenue ?? 0),
    0,
  );

  const unreadMessages = tickets.reduce(
    (sum, row) => sum + Number(row.unread_for_creator ?? 0),
    0,
  );

  const openTasks = tasks.filter(
    (task) => task.status !== "completed" && task.status !== "cancelled",
  ).length;

  const avgMonthly =
    Number(creator.revenue_current_month ?? 0) +
      Number(creator.revenue_previous_month ?? 0) >
    0
      ? (Number(creator.revenue_current_month ?? 0) +
          Number(creator.revenue_previous_month ?? 0)) /
        2
      : Number(creator.revenue_current_month ?? 0);

  return {
    creator,
    managers,
    canAssignManager:
      session.profile.role === "owner" || session.profile.role === "admin",
    canEdit: hasPermission(session.profile.role, "creators.update"),
    canDelete: hasPermission(session.profile.role, "creators.delete"),
    canImpersonate: canImpersonateCreator(session.profile.role),
    canReadFinance,
    stats: {
      revenue: Number(creator.revenue_lifetime ?? 0),
      thisMonth: Number(creator.revenue_current_month ?? 0),
      lastMonth: Number(creator.revenue_previous_month ?? 0),
      tasks: openTasks,
      unreadMessages,
      documents: documents.length,
      subscribers: null,
      payoutBalance: pending,
      averageMonthly: avgMonthly,
    },
    finance: {
      balance: Number(creator.payouts_total ?? 0),
      thisMonth: Number(creator.revenue_current_month ?? 0),
      lastMonth: Number(creator.revenue_previous_month ?? 0),
      pending,
      paid,
      income,
      commission: agencyCommission,
    },
    platforms,
    tasks,
    documents,
    payouts,
    transactions,
    activity,
  };
}

/** @deprecated Use getCreatorProfile */
export const getCreatorProfileBundle = getCreatorProfile;
