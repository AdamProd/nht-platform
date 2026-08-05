"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth";
import { publishEvent } from "@/features/core/events";
import type { UserRole } from "@/types/database.types";

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      const role = (profile?.role ?? "guest") as UserRole;
      if (isStaff(role)) {
        await publishEvent({
          type: "staff.logout",
          module: "auth",
          actorId: user.id,
          actorRole: role,
          targetId: user.id,
          entityType: "profile",
          visibility: "owner",
          payload: {
            name: profile?.full_name ?? user.email,
            email: user.email,
            role,
          },
        });
      }
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[auth.logout]", error.message);
    }
  } catch (error) {
    console.error("[auth.logout] unexpected:", error);
  }

  const locale = await getLocale();
  redirect({ href: "/login", locale });
}
