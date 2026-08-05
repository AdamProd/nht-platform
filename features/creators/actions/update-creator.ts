"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffSession } from "@/lib/auth";
import { isOwner, isStaff } from "@/lib/auth/roles";
import {
  createCreatorSchema,
  platformsFromUrls,
  updateManagerSchema,
  updateNotesSchema,
  updatePlatformsSchema,
  updateProfileSchema,
  updateStatusSchema,
} from "@/features/creators/schemas/creator.schema";
import type { CreatorActionResult } from "@/features/creators/types";
import type { CreatorPlatform } from "@/features/creators/types";
import type {
  TablesInsert,
  TablesUpdate,
  UserRole,
} from "@/types/database.types";
import { getClientEnv } from "@/lib/env/client-env";

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

function platformUrlPatch(platforms: CreatorPlatform[]) {
  const set = new Set(platforms);
  return {
    onlyfans_url: set.has("onlyfans") ? "https://onlyfans.com/" : null,
    fansly_url: set.has("fansly") ? "https://fansly.com/" : null,
    chaturbate_url: set.has("chaturbate") ? "https://chaturbate.com/" : null,
    instagram_url: set.has("instagram") ? "https://instagram.com/" : null,
    tiktok_url: set.has("tiktok") ? "https://tiktok.com/" : null,
    twitter_url: set.has("twitter") ? "https://x.com/" : null,
    platforms,
  };
}

/**
 * Create a creator in CRM, provision Auth + profile (role=creator),
 * and send the Supabase invitation email so they can set a password.
 */
export async function createCreator(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !isStaff(session.profile.role)) {
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

    const locale = await getLocale();
    const siteUrl = getClientEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const redirectTo = `${siteUrl}/${locale}/callback?next=${encodeURIComponent(`/${locale}/auth/set-password`)}`;

    const admin = createAdminClient();

    const invite = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      redirectTo,
      data: {
        full_name: parsed.data.display_name,
        role: "creator",
      },
    });

    if (invite.error || !invite.data.user) {
      console.error("[createCreator.invite]", invite.error?.message);
      return { success: false, error: t("invite") };
    }

    const userId = invite.data.user.id;

    // Confirm email so the invitee can set a password and sign in immediately after.
    const confirm = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.display_name,
        role: "creator",
      },
    });
    if (confirm.error) {
      console.error("[createCreator.confirm]", confirm.error.message);
    }

    // Ensure profile role/name (trigger may have created guest before metadata applied)
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        role: "creator",
        full_name: parsed.data.display_name,
      })
      .eq("id", userId);

    if (profileError) {
      console.error("[createCreator.profile]", profileError.message);
      return { success: false, error: t("invite") };
    }

    const urls = platformUrlPatch(parsed.data.platforms);
    const now = new Date().toISOString();

    const row: TablesInsert<"creators"> = {
      display_name: parsed.data.display_name,
      full_name: parsed.data.display_name,
      legal_name: parsed.data.legal_name,
      email: parsed.data.email,
      telegram: parsed.data.telegram,
      phone: parsed.data.phone,
      country: parsed.data.country,
      languages: parsed.data.languages,
      timezone: parsed.data.timezone,
      manager_id: managerId,
      notes: parsed.data.notes,
      status: "invited",
      user_id: userId,
      invited_at: now,
      invited_by: session.profile.id,
      last_activity_at: now,
      ...urls,
      platforms: platformsFromUrls(urls),
    };

    const { data: creator, error: creatorError } = await admin
      .from("creators")
      .insert(row)
      .select("id")
      .single();

    if (creatorError || !creator) {
      console.error("[createCreator.insert]", creatorError?.message);
      return { success: false, error: t("create") };
    }

    await admin.from("creator_audit_logs").insert({
      actor_id: session.profile.id,
      creator_id: creator.id,
      action: "creator.invited",
      meta: {
        email: parsed.data.email,
        manager_id: managerId,
        platforms: parsed.data.platforms,
      },
    });

    await revalidateCreator(creator.id);
    return { success: true, id: creator.id };
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

    const { id, ...fields } = parsed.data;
    return updateCreatorField(id, {
      ...fields,
      full_name: fields.display_name,
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[updateProfile]", error);
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

    const { id, ...urls } = parsed.data;
    return updateCreatorField(id, {
      ...urls,
      platforms: platformsFromUrls(urls),
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[updatePlatforms]", error);
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
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[updateStatus]", error);
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
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[updateManager]", error);
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

    return updateCreatorField(parsed.data.id, {
      notes: parsed.data.notes,
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[updateNotes]", error);
    return { success: false, error: t("save") };
  }
}

/** @deprecated Prefer updateManager */
export async function assignManager(
  formData: FormData,
): Promise<CreatorActionResult> {
  return updateManager(formData);
}

/** Optional avatar URL update (storage upload arrives later). */
export async function uploadAvatar(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const id = String(formData.get("id") ?? "");
    const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;

    if (!id) {
      return { success: false, error: t("invalid") };
    }

    if (!avatar_url) {
      return { success: false, error: t("avatarNotReady") };
    }

    return updateCreatorField(id, {
      avatar_url,
      last_activity_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[uploadAvatar]", error);
    return { success: false, error: t("avatarNotReady") };
  }
}
