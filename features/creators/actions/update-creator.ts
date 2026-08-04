"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isOwner } from "@/lib/auth/roles";
import {
  assignCreatorManagerSchema,
  createCreatorSchema,
  updateCreatorNotesSchema,
  updateCreatorSchema,
  updateCreatorStatusSchema,
  uploadAvatarSchema,
} from "@/features/creators/schemas/creator.schema";
import type { CreatorActionResult } from "@/features/creators/types";
import type { TablesInsert, TablesUpdate, UserRole } from "@/types/database.types";

async function revalidateCreator(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/creators`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/creators/${id}`);
}

function canManageAll(role: UserRole): boolean {
  return isOwner(role) || role === "admin";
}

async function assertCreatorAccess(
  creatorId: string,
): Promise<CreatorActionResult | null> {
  const session = await requireStaffSession();
  const t = await getTranslations("admin.creators.actionErrors");

  if (!session) {
    return { success: false, error: t("unauthorized") };
  }

  if (canManageAll(session.profile.role)) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("id, manager_id")
    .eq("id", creatorId)
    .maybeSingle();

  if (!data || data.manager_id !== session.profile.id) {
    return { success: false, error: t("forbidden") };
  }

  return null;
}

export async function createCreator(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createCreatorSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    let managerId = parsed.data.manager_id;
    if (session.profile.role === "manager") {
      managerId = session.profile.id;
    }

    const row: TablesInsert<"creators"> = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      country: parsed.data.country,
      languages: parsed.data.languages,
      platforms: parsed.data.platforms,
      manager_id: managerId,
      status: parsed.data.status,
      notes: parsed.data.notes,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("creators")
      .insert(row)
      .select("id")
      .single();

    if (error || !data) {
      console.error("[createCreator]", error?.message);
      return { success: false, error: t("create") };
    }

    await revalidateCreator(data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error("[createCreator] unexpected:", error);
    return { success: false, error: t("create") };
  }
}

export async function updateCreator(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateCreatorSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(parsed.data.id);
    if (denied) return denied;

    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    let managerId = parsed.data.manager_id;
    if (session.profile.role === "manager") {
      managerId = session.profile.id;
    }

    const patch: TablesUpdate<"creators"> = {
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      country: parsed.data.country,
      languages: parsed.data.languages,
      platforms: parsed.data.platforms,
      manager_id: managerId,
      status: parsed.data.status,
      notes: parsed.data.notes,
      avatar_url: parsed.data.avatar_url,
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from("creators")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateCreator]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateCreator(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateCreator] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

async function updateCreatorField(
  id: string,
  patch: TablesUpdate<"creators">,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const supabase = await createClient();
    const { error } = await supabase.from("creators").update(patch).eq("id", id);

    if (error) {
      console.error("[updateCreatorField]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateCreator(id);
    return { success: true, id };
  } catch (error) {
    console.error("[updateCreatorField] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStatus(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateCreatorStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidStatus") };
    }

    return updateCreatorField(parsed.data.id, { status: parsed.data.status });
  } catch (error) {
    console.error("[updateStatus]", error);
    return { success: false, error: t("save") };
  }
}

export async function assignManager(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    if (session.profile.role === "manager") {
      return { success: false, error: t("forbidden") };
    }

    const rawManager = formData.get("manager_id");
    const parsed = assignCreatorManagerSchema.safeParse({
      id: formData.get("id"),
      manager_id: rawManager === "" ? null : rawManager,
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidManager") };
    }

    return updateCreatorField(parsed.data.id, {
      manager_id: parsed.data.manager_id,
    });
  } catch (error) {
    console.error("[assignManager]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateNotes(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateCreatorNotesSchema.safeParse({
      id: formData.get("id"),
      notes: formData.get("notes") ?? "",
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidNotes") };
    }

    return updateCreatorField(parsed.data.id, { notes: parsed.data.notes });
  } catch (error) {
    console.error("[updateNotes]", error);
    return { success: false, error: t("save") };
  }
}

/** Placeholder until storage upload is wired in a later commit. */
export async function uploadAvatar(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = uploadAvatarSchema.safeParse({
      id: formData.get("id"),
      avatar_url: formData.get("avatar_url") || null,
    });

    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(parsed.data.id);
    if (denied) return denied;

    if (!parsed.data.avatar_url) {
      return { success: false, error: t("avatarNotReady") };
    }

    return updateCreatorField(parsed.data.id, {
      avatar_url: parsed.data.avatar_url,
    });
  } catch (error) {
    console.error("[uploadAvatar]", error);
    return { success: false, error: t("avatarNotReady") };
  }
}
