import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { hasPermission } from "@/features/core/permissions";
import type {
  CommissionHistoryItem,
  CommissionSettings,
} from "@/features/finance/types";

export async function getCommissionSettings(): Promise<{
  settings: CommissionSettings | null;
  history: CommissionHistoryItem[];
}> {
  const session = await requireStaffSession();
  if (!session) throw new Error("Unauthorized");
  if (!hasPermission(session.profile.role, "finance.read")) {
    throw new Error("Forbidden");
  }

  const supabase = await createClient();

  const [{ data: settings, error: settingsError }, { data: history, error: historyError }] =
    await Promise.all([
      supabase
        .from("commission_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("commission_history")
        .select(
          `
          *,
          changed_by_profile:profiles!commission_history_changed_by_fkey (
            id,
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  if (settingsError) {
    console.error("[getCommissionSettings.settings]", settingsError.message);
    throw new Error("Failed to load commission settings.");
  }
  if (historyError) {
    console.error("[getCommissionSettings.history]", historyError.message);
    throw new Error("Failed to load commission history.");
  }

  return {
    settings: (settings as CommissionSettings | null) ?? null,
    history: (history ?? []) as CommissionHistoryItem[],
  };
}
