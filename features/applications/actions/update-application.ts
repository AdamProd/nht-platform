"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { publishEvent } from "@/features/core/events";
import {
  assignManagerSchema,
  updateNotesSchema,
  updatePrioritySchema,
  updateStatusSchema,
} from "@/features/applications/schemas/crm.schema";
import type { ApplicationActionResult } from "@/features/applications/types";
import type { TablesUpdate } from "@/types/database.types";

async function revalidateApplication(id: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/applications`);
  revalidatePath(`/${locale}/admin/applications/${id}`);
  revalidatePath(`/${locale}/admin`);
}

async function updateApplicationField(
  id: string,
  patch: TablesUpdate<"applications">,
  options?: {
    event:
      | "application.updated"
      | "application.status_changed"
      | "application.assigned";
    payload?: Record<string, unknown>;
  },
): Promise<ApplicationActionResult> {
  const t = await getTranslations("admin.applications.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("applications")
      .select("id, full_name, status, assigned_manager, priority")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("applications")
      .update(patch)
      .eq("id", id);

    if (error) {
      console.error("[updateApplication]", error.message);
      return { success: false, error: t("save") };
    }

    if (options?.event) {
      await publishEvent({
        type: options.event,
        module: "applications",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: id,
        entityType: "application",
        link: `/admin/applications/${id}`,
        payload: {
          name: current?.full_name,
          status: patch.status ?? current?.status,
          previousStatus: current?.status,
          assigned_manager:
            patch.assigned_manager !== undefined
              ? patch.assigned_manager
              : current?.assigned_manager,
          managerId:
            patch.assigned_manager !== undefined
              ? patch.assigned_manager
              : current?.assigned_manager,
          priority: patch.priority ?? current?.priority,
          ...options.payload,
        },
      });
    }

    await revalidateApplication(id);
    return { success: true };
  } catch (error) {
    console.error("[updateApplication] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStatus(
  formData: FormData,
): Promise<ApplicationActionResult> {
  const t = await getTranslations("admin.applications.actionErrors");

  try {
    const parsed = updateStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidStatus") };
    }

    const patch: TablesUpdate<"applications"> = { status: parsed.data.status };
    if (parsed.data.status === "contacted") {
      patch.last_contact_at = new Date().toISOString();
    }

    return updateApplicationField(parsed.data.id, patch, {
      event: "application.status_changed",
      payload: { status: parsed.data.status },
    });
  } catch (error) {
    console.error("[updateStatus]", error);
    return { success: false, error: t("save") };
  }
}

export async function updatePriority(
  formData: FormData,
): Promise<ApplicationActionResult> {
  const t = await getTranslations("admin.applications.actionErrors");

  try {
    const parsed = updatePrioritySchema.safeParse({
      id: formData.get("id"),
      priority: formData.get("priority"),
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidPriority") };
    }

    return updateApplicationField(
      parsed.data.id,
      { priority: parsed.data.priority },
      {
        event: "application.updated",
        payload: { priority: parsed.data.priority },
      },
    );
  } catch (error) {
    console.error("[updatePriority]", error);
    return { success: false, error: t("save") };
  }
}

export async function assignManager(
  formData: FormData,
): Promise<ApplicationActionResult> {
  const t = await getTranslations("admin.applications.actionErrors");

  try {
    const rawManager = formData.get("assigned_manager");
    const parsed = assignManagerSchema.safeParse({
      id: formData.get("id"),
      assigned_manager: rawManager === "" ? null : rawManager,
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidManager") };
    }

    return updateApplicationField(
      parsed.data.id,
      { assigned_manager: parsed.data.assigned_manager },
      {
        event: "application.assigned",
        payload: {
          managerId: parsed.data.assigned_manager,
          assigned_manager: parsed.data.assigned_manager,
        },
      },
    );
  } catch (error) {
    console.error("[assignManager]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateNotes(
  formData: FormData,
): Promise<ApplicationActionResult> {
  const t = await getTranslations("admin.applications.actionErrors");

  try {
    const parsed = updateNotesSchema.safeParse({
      id: formData.get("id"),
      notes: formData.get("notes") ?? "",
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidNotes") };
    }

    return updateApplicationField(
      parsed.data.id,
      { notes: parsed.data.notes },
      { event: "application.updated" },
    );
  } catch (error) {
    console.error("[updateNotes]", error);
    return { success: false, error: t("save") };
  }
}
