import { requireCreatorCabinetSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import { rangeToDays, type StatRange } from "@/features/cabinet/types";

export async function getCabinetCreator() {
  const session = await requireCreatorCabinetSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getDashboardData() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();

  const [payouts, tasks, tickets, deadlines, activity] = await Promise.all([
    supabase
      .from("creator_payouts")
      .select("amount, status")
      .eq("creator_id", creator.id)
      .eq("status", "pending"),
    supabase
      .from("creator_tasks")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creator.id)
      .eq("status", "completed"),
    supabase
      .from("creator_support_tickets")
      .select("unread_for_creator")
      .eq("creator_id", creator.id),
    supabase
      .from("creator_tasks")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", creator.id)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .gte("deadline", new Date().toISOString())
      .lte(
        "deadline",
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    supabase
      .from("creator_activity")
      .select("*")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const pendingPayout = (payouts.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );
  const unreadMessages = (tickets.data ?? []).reduce(
    (sum, row) => sum + Number(row.unread_for_creator ?? 0),
    0,
  );

  return {
    creator,
    cards: {
      currentRevenue: Number(creator.revenue_current_month ?? 0),
      lifetimeRevenue: Number(creator.revenue_lifetime ?? 0),
      pendingPayout,
      completedTasks: tasks.count ?? 0,
      unreadMessages,
      upcomingDeadlines: deadlines.count ?? 0,
    },
    activity: (activity.data ?? []) as Tables<"creator_activity">[],
  };
}

export async function listPlatformAccounts() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_platform_accounts")
    .select("*")
    .eq("creator_id", creator.id);

  if (error) throw new Error(error.message);
  return { creator, accounts: (data ?? []) as Tables<"creator_platform_accounts">[] };
}

export async function listTasks() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
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
    .eq("creator_id", creator.id)
    .order("deadline", { ascending: true, nullsFirst: false });

  if (error) throw new Error(error.message);
  return { creator, tasks: data ?? [] };
}

export async function listPayouts() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_payouts")
    .select("*")
    .eq("creator_id", creator.id)
    .order("period_end", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Tables<"creator_payouts">[];
  const pending = rows
    .filter((row) => row.status === "pending" || row.status === "processing")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const completed = rows
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + Number(row.amount), 0);

  return { creator, payouts: rows, pending, completed };
}

export async function getPayout(id: string) {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_payouts")
    .select("*")
    .eq("id", id)
    .eq("creator_id", creator.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return { creator, payout: data as Tables<"creator_payouts"> | null };
}

export async function listDocuments() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_documents")
    .select("*")
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return {
    creator,
    documents: (data ?? []) as Tables<"creator_documents">[],
  };
}

export async function listTickets() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_support_tickets")
    .select("*")
    .eq("creator_id", creator.id)
    .order("last_message_at", { ascending: false });

  if (error) throw new Error(error.message);
  return {
    creator,
    tickets: (data ?? []) as Tables<"creator_support_tickets">[],
  };
}

export async function getTicket(id: string) {
  const { creator, profile } = await getCabinetCreator();
  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from("creator_support_tickets")
    .select("*")
    .eq("id", id)
    .eq("creator_id", creator.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!ticket) return { creator, ticket: null, messages: [] };

  const { data: messages } = await supabase
    .from("creator_support_messages")
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if ((ticket.unread_for_creator ?? 0) > 0) {
    await supabase
      .from("creator_support_tickets")
      .update({ unread_for_creator: 0 })
      .eq("id", id);
  }

  return {
    creator,
    profile,
    ticket: ticket as Tables<"creator_support_tickets">,
    messages: (messages ?? []) as Tables<"creator_support_messages">[],
  };
}

export async function getSettings() {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const { data } = await supabase
    .from("creator_settings")
    .select("*")
    .eq("creator_id", creator.id)
    .maybeSingle();

  return {
    creator,
    settings: (data as Tables<"creator_settings"> | null) ?? {
      creator_id: creator.id,
      theme: "dark",
      locale: null,
      notify_telegram: true,
      notify_email: true,
      updated_at: new Date().toISOString(),
    },
  };
}

export async function getStats(range: StatRange) {
  const { creator } = await getCabinetCreator();
  const supabase = await createClient();
  const days = rangeToDays(range);
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromDay = from.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("creator_stats_daily")
    .select("*")
    .eq("creator_id", creator.id)
    .gte("day", fromDay)
    .order("day", { ascending: true });

  if (error) throw new Error(error.message);
  return {
    creator,
    range,
    points: (data ?? []) as Tables<"creator_stats_daily">[],
  };
}
