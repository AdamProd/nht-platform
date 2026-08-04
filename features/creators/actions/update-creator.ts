"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isOwner } from "@/lib/auth/roles";
import {
  createCreatorSchema,
  updateManagerSchema,
  updateNotesSchema,
  updatePlatformsSchema,
  updateProfileSchema,
  updateStatusSchema,
} from "@/features/creators/schemas/creator.schema";
import {
  platformsFromAccounts,
  type CreatorActionResult,
  type CreatorPlatformAccounts,
} from "@/features/creators/types";
import type {
  Json,
  TablesInsert,
  TablesUpdate,
  UserRole,
} from "@/types/database.types";

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

async function updateCreatorField(
  id: string,
  patch: TablesUpdate<"creators">,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const supabase = await createClient();
    const { error } = await supabase
      .from("creators")
      .update({
        ...patch,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", id);

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
      display_name: parsed.data.display_name,
      full_name: parsed.data.display_name,
      legal_name: parsed.data.legal_name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      phone: parsed.data.phone,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      birthday: parsed.data.birthday,
      languages: parsed.data.languages,
      platforms: parsed.data.platforms,
      manager_id: managerId,
      status: parsed.data.status,
      notes: parsed.data.notes,
      last_activity_at: new Date().toISOString(),
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

export async function updateProfile(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateProfileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    return updateCreatorField(parsed.data.id, {
      display_name: parsed.data.display_name,
      full_name: parsed.data.display_name,
      legal_name: parsed.data.legal_name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      phone: parsed.data.phone,
      country: parsed.data.country,
      timezone: parsed.data.timezone,
      birthday: parsed.data.birthday,
      languages: parsed.data.languages,
      avatar_url: parsed.data.avatar_url,
    });
  } catch (error) {
    console.error("[updateProfile]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateManager(
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
    const parsed = updateManagerSchema.safeParse({
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
    console.error("[updateManager]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStatus(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      return { success: false, error: t("invalidStatus") };
    }

    return updateCreatorField(parsed.data.id, {
      status: parsed.data.status,
      is_active: parsed.data.status === "active",
    });
  } catch (error) {
    console.error("[updateStatus]", error);
    return { success: false, error: t("save") };
  }
}

export async function updatePlatforms(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updatePlatformsSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const accounts = parsed.data.platform_accounts as CreatorPlatformAccounts;
    const platforms = platformsFromAccounts(accounts);

    return updateCreatorField(parsed.data.id, {
      platform_accounts: accounts as Json,
      platforms,
    });
  } catch (error) {
    console.error("[updatePlatforms]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateNotes(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const parsed = updateNotesSchema.safeParse({
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

/** @deprecated Prefer updateManager */
export async function assignManager(formData: FormData) {
  return updateManager(formData);
}

/** @deprecated Prefer updateProfile */
export async function updateCreator(raw: unknown) {
  return updateProfile(raw);
}

/** Placeholder avatar URL save via profile update. */
export async function uploadAvatar(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");
  const id = String(formData.get("id") ?? "");
  const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;

  if (!id) {
    return { success: false, error: t("invalid") };
  }

  return updateCreatorField(id, { avatar_url });
}
