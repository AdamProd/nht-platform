"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
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
): Promise<ApplicationActionResult> {
  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: "You are not authorized to make this change." };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("applications")
      .update(patch)
      .eq("id", id);

    if (error) {
      console.error("[updateApplication]", error.message);
      return { success: false, error: "Unable to save changes." };
    }

    await revalidateApplication(id);
    return { success: true };
  } catch (error) {
    console.error("[updateApplication] unexpected:", error);
    return { success: false, error: "Unable to save changes." };
  }
}

export async function updateStatus(
  formData: FormData,
): Promise<ApplicationActionResult> {
  try {
    const parsed = updateStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid status." };
    }

    const patch: TablesUpdate<"applications"> = { status: parsed.data.status };
    if (parsed.data.status === "contacted") {
      patch.last_contact_at = new Date().toISOString();
    }

    return updateApplicationField(parsed.data.id, patch);
  } catch (error) {
    console.error("[updateStatus]", error);
    return { success: false, error: "Unable to save changes." };
  }
}

export async function updatePriority(
  formData: FormData,
): Promise<ApplicationActionResult> {
  try {
    const parsed = updatePrioritySchema.safeParse({
      id: formData.get("id"),
      priority: formData.get("priority"),
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid priority." };
    }

    return updateApplicationField(parsed.data.id, {
      priority: parsed.data.priority,
    });
  } catch (error) {
    console.error("[updatePriority]", error);
    return { success: false, error: "Unable to save changes." };
  }
}

export async function assignManager(
  formData: FormData,
): Promise<ApplicationActionResult> {
  try {
    const rawManager = formData.get("assigned_manager");
    const parsed = assignManagerSchema.safeParse({
      id: formData.get("id"),
      assigned_manager: rawManager === "" ? null : rawManager,
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid manager." };
    }

    return updateApplicationField(parsed.data.id, {
      assigned_manager: parsed.data.assigned_manager,
    });
  } catch (error) {
    console.error("[assignManager]", error);
    return { success: false, error: "Unable to save changes." };
  }
}

export async function updateNotes(
  formData: FormData,
): Promise<ApplicationActionResult> {
  try {
    const parsed = updateNotesSchema.safeParse({
      id: formData.get("id"),
      notes: formData.get("notes") ?? "",
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid notes." };
    }

    return updateApplicationField(parsed.data.id, {
      notes: parsed.data.notes,
    });
  } catch (error) {
    console.error("[updateNotes]", error);
    return { success: false, error: "Unable to save changes." };
  }
}
