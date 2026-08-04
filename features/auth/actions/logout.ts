"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
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
