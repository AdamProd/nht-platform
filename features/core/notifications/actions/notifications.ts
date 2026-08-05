"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import type { EventActionResult } from "@/features/core/events/types";

async function revalidateNotifications() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/notifications`);
}

export async function markNotificationRead(
  formData: FormData,
): Promise<EventActionResult> {
  const t = await getTranslations("admin.notifications.actionErrors");
  const session = await requireStaffSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", session.profile.id);

  if (error) {
    console.error("[markNotificationRead]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateNotifications();
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<EventActionResult> {
  const t = await getTranslations("admin.notifications.actionErrors");
  const session = await requireStaffSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", session.profile.id)
    .is("read_at", null)
    .is("archived_at", null);

  if (error) {
    console.error("[markAllNotificationsRead]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateNotifications();
  return { success: true };
}

export async function archiveNotification(
  formData: FormData,
): Promise<EventActionResult> {
  const t = await getTranslations("admin.notifications.actionErrors");
  const session = await requireStaffSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({
      archived_at: new Date().toISOString(),
      read_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("recipient_id", session.profile.id);

  if (error) {
    console.error("[archiveNotification]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateNotifications();
  return { success: true };
}

export async function deleteNotification(
  formData: FormData,
): Promise<EventActionResult> {
  const t = await getTranslations("admin.notifications.actionErrors");
  const session = await requireStaffSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", session.profile.id);

  if (error) {
    console.error("[deleteNotification]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateNotifications();
  return { success: true };
}
