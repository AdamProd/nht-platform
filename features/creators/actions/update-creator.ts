"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffSession } from "@/lib/auth";
import { isOwner, isStaff } from "@/lib/auth/roles";
import {
  createCreatorSchema,
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
import {
  CREATOR_AVATAR_BUCKET,
  CREATOR_AVATAR_MAX_BYTES,
  creatorAvatarPath,
  getCreatorBiography,
  isCreatorAvatarMime,
  isStoredCreatorAvatarPath,
  visiblePlatformAccounts,
  withCreatorBiography,
} from "@/features/creators/lib/avatar";
import { publishEvent } from "@/features/events";
import type { PlatformEventType } from "@/features/events/types";

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
  options?: {
    event: PlatformEventType;
    payload?: Record<string, unknown>;
  },
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("id, display_name, status, manager_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("creators").update(patch).eq("id", id);

    if (error) {
      console.error("[updateCreatorField]", error.message);
      return { success: false, error: t("save") };
    }

    if (options?.event) {
      const managerId =
        patch.manager_id !== undefined
          ? patch.manager_id
          : current?.manager_id;

      await publishEvent({
        type: options.event,
        module: "creators",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: id,
        entityType: "creator",
        relatedCreatorId: id,
        link: `/admin/creators/${id}`,
        payload: {
          name: patch.display_name ?? current?.display_name,
          status: patch.status ?? current?.status,
          previousStatus: current?.status,
          managerId,
          manager_id: managerId,
          ...options.payload,
        },
      });
    }

    await revalidateCreator(id);
    return { success: true, id };
  } catch (error) {
    console.error("[updateCreatorField] unexpected:", error);
    return { success: false, error: t("save") };
  }
}

function platformAccountsPatch(platforms: CreatorPlatform[]) {
  const set = new Set(platforms);
  const accounts: Record<string, string> = {};
  if (set.has("onlyfans")) accounts.onlyfans = "https://onlyfans.com/";
  if (set.has("fansly")) accounts.fansly = "https://fansly.com/";
  if (set.has("chaturbate")) accounts.chaturbate = "https://chaturbate.com/";
  if (set.has("instagram")) accounts.instagram = "https://instagram.com/";
  if (set.has("tiktok")) accounts.tiktok = "https://tiktok.com/";
  if (set.has("twitter")) accounts.twitter = "https://x.com/";
  return {
    platform_accounts: accounts,
    platforms: [...set],
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

    const platforms = platformAccountsPatch(parsed.data.platforms);
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
      status: "new",
      last_activity_at: now,
      ...platforms,
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

    // Audit table is optional (not present on all environments).
    await admin.from("creator_audit_logs").insert({
      actor_id: session.profile.id,
      creator_id: creator.id,
      action: "creator.invited",
      meta: {
        email: parsed.data.email,
        manager_id: managerId,
        platforms: parsed.data.platforms,
      },
    }).then(({ error }) => {
      if (error) console.warn("[createCreator.audit]", error.message);
    });

    await publishEvent({
      type: "creator.created",
      module: "creators",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: creator.id,
      entityType: "creator",
      relatedCreatorId: creator.id,
      link: `/admin/creators/${creator.id}`,
      payload: {
        name: parsed.data.display_name,
        email: parsed.data.email,
        managerId,
        manager_id: managerId,
        platforms: parsed.data.platforms,
      },
    });

    if (managerId) {
      await publishEvent({
        type: "creator.assigned",
        module: "creators",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: creator.id,
        entityType: "creator",
        relatedCreatorId: creator.id,
        link: `/admin/creators/${creator.id}`,
        payload: {
          name: parsed.data.display_name,
          managerId,
          manager_id: managerId,
        },
      });
    }

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

    const { id, biography, avatar_url: _ignoredAvatar, ...fields } = parsed.data;
    void _ignoredAvatar;

    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("platform_accounts")
      .eq("id", id)
      .maybeSingle();

    const platform_accounts = withCreatorBiography(
      current?.platform_accounts,
      biography,
    );

    return updateCreatorField(
      id,
      {
        ...fields,
        full_name: fields.display_name,
        platform_accounts,
        last_activity_at: new Date().toISOString(),
      },
      { event: "creator.updated" },
    );
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

    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("platform_accounts")
      .eq("id", id)
      .maybeSingle();

    const biography = getCreatorBiography(current?.platform_accounts);
    const accounts = visiblePlatformAccounts({});
    const map = {
      onlyfans_url: "onlyfans",
      fansly_url: "fansly",
      chaturbate_url: "chaturbate",
      instagram_url: "instagram",
      tiktok_url: "tiktok",
      twitter_url: "twitter",
    } as const;

    for (const [field, platform] of Object.entries(map)) {
      const value = urls[field as keyof typeof urls];
      if (value) accounts[platform] = value;
    }

    const platform_accounts = withCreatorBiography(accounts, biography);

    const previousKeys = Object.keys(
      visiblePlatformAccounts(current?.platform_accounts),
    );
    const nextKeys = Object.keys(visiblePlatformAccounts(platform_accounts));
    const added = nextKeys.filter((key) => !previousKeys.includes(key));

    return updateCreatorField(
      id,
      {
        platform_accounts,
        platforms: nextKeys,
        last_activity_at: new Date().toISOString(),
      },
      {
        event: added.length > 0 ? "creator.platform_added" : "creator.updated",
        payload: { platforms: nextKeys, added },
      },
    );
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

    return updateCreatorField(
      parsed.data.id,
      {
        status: parsed.data.status,
        is_active: parsed.data.status === "active",
        last_activity_at: new Date().toISOString(),
      },
      {
        event: "creator.status_changed",
        payload: { status: parsed.data.status },
      },
    );
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

    return updateCreatorField(
      parsed.data.id,
      {
        manager_id: parsed.data.manager_id,
        last_activity_at: new Date().toISOString(),
      },
      {
        event: "creator.assigned",
        payload: {
          managerId: parsed.data.manager_id,
          manager_id: parsed.data.manager_id,
        },
      },
    );
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

    return updateCreatorField(
      parsed.data.id,
      {
        notes: parsed.data.notes,
        last_activity_at: new Date().toISOString(),
      },
      { event: "creator.updated" },
    );
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

export async function uploadAvatar(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const id = String(formData.get("id") ?? "");
    const file = formData.get("avatar");

    if (!id || !(file instanceof File) || file.size === 0) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    if (!isCreatorAvatarMime(file.type)) {
      return { success: false, error: t("avatarInvalidType") };
    }

    if (file.size > CREATOR_AVATAR_MAX_BYTES) {
      return { success: false, error: t("avatarTooLarge") };
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("avatar_url")
      .eq("id", id)
      .maybeSingle();

    const path = creatorAvatarPath(id, file.type);
    const admin = createAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(CREATOR_AVATAR_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadAvatar.upload]", uploadError.message);
      return { success: false, error: t("avatarUpload") };
    }

    const previous = current?.avatar_url;
    if (previous && isStoredCreatorAvatarPath(previous) && previous !== path) {
      await admin.storage.from(CREATOR_AVATAR_BUCKET).remove([previous]);
    }

    return updateCreatorField(
      id,
      {
        avatar_url: path,
        last_activity_at: new Date().toISOString(),
      },
      { event: "creator.avatar_changed", payload: { action: "upload" } },
    );
  } catch (error) {
    console.error("[uploadAvatar]", error);
    return { success: false, error: t("avatarUpload") };
  }
}

export async function deleteAvatar(
  formData: FormData,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const id = String(formData.get("id") ?? "");
    if (!id) {
      return { success: false, error: t("invalid") };
    }

    const denied = await assertCreatorAccess(id);
    if (denied) return denied;

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("avatar_url")
      .eq("id", id)
      .maybeSingle();

    const previous = current?.avatar_url;
    if (previous && isStoredCreatorAvatarPath(previous)) {
      const admin = createAdminClient();
      await admin.storage.from(CREATOR_AVATAR_BUCKET).remove([previous]);
    }

    return updateCreatorField(
      id,
      {
        avatar_url: null,
        last_activity_at: new Date().toISOString(),
      },
      { event: "creator.avatar_changed", payload: { action: "delete" } },
    );
  } catch (error) {
    console.error("[deleteAvatar]", error);
    return { success: false, error: t("save") };
  }
}
