"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffSession } from "@/lib/auth";
import { isOwner } from "@/lib/auth/roles";
import { hasPermission } from "@/features/core/permissions";
import { publishEvent } from "@/features/core/events";
import {
  getCreatorBiography,
  visiblePlatformAccounts,
  withCreatorBiography,
} from "@/features/creators/lib/avatar";
import type { CreatorActionResult } from "@/features/creators/types";
import {
  creatorIdSchema,
  updateCreatorProfileSchema,
} from "@/features/creators/profile/schemas/creator-profile.schema";
import type { UserRole } from "@/types/database.types";

async function revalidateCreator(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/creators`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/creators/${id}`);
}

function canEditCreators(role: UserRole): boolean {
  return hasPermission(role, "creators.update");
}

function canDeleteCreators(role: UserRole): boolean {
  return hasPermission(role, "creators.delete");
}

async function assertProfileAccess(
  creatorId: string,
  permission: "creators.update" | "creators.delete",
): Promise<CreatorActionResult | null> {
  const session = await requireStaffSession();
  const t = await getTranslations("admin.creators.actionErrors");

  if (!session) return { success: false, error: t("unauthorized") };
  if (!hasPermission(session.profile.role, permission)) {
    return { success: false, error: t("forbidden") };
  }

  if (isOwner(session.profile.role) || session.profile.role === "admin") {
    return null;
  }

  // Managers may only mutate assigned creators.
  if (session.profile.role === "manager") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creators")
      .select("id, manager_id")
      .eq("id", creatorId)
      .maybeSingle();
    if (!data || data.manager_id !== session.profile.id) {
      return { success: false, error: t("forbidden") };
    }
  }

  return null;
}

export async function updateCreatorProfile(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !canEditCreators(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = updateCreatorProfileSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const { id, ...fields } = parsed.data;
    const denied = await assertProfileAccess(id, "creators.update");
    if (denied) return denied;

    let managerId = fields.manager_id ?? null;
    if (session.profile.role === "manager") {
      managerId = session.profile.id;
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!current) {
      return { success: false, error: t("invalid") };
    }

    const biography = getCreatorBiography(current.platform_accounts);
    const accounts = visiblePlatformAccounts({});
    const urlMap = {
      onlyfans_url: "onlyfans",
      fansly_url: "fansly",
      manyvids_url: "manyvids",
      chaturbate_url: "chaturbate",
      instagram_url: "instagram",
      tiktok_url: "tiktok",
      twitter_url: "twitter",
    } as const;

    for (const [field, platform] of Object.entries(urlMap)) {
      const value = fields[field as keyof typeof urlMap];
      if (value) accounts[platform] = value;
    }

    const platform_accounts = withCreatorBiography(accounts, biography);
    const platforms = Object.keys(visiblePlatformAccounts(platform_accounts));

    const { error } = await supabase
      .from("creators")
      .update({
        display_name: fields.display_name,
        full_name: fields.display_name,
        legal_name: fields.legal_name,
        email: fields.email,
        telegram: fields.telegram,
        phone: fields.phone,
        country: fields.country,
        timezone: fields.timezone,
        languages: fields.languages,
        notes: fields.notes,
        status: fields.status,
        manager_id: managerId,
        platform_accounts,
        platforms,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[updateCreatorProfile]", error.message);
      return { success: false, error: t("save") };
    }

    const statusChanged = current.status !== fields.status;
    const managerChanged = (current.manager_id ?? null) !== managerId;

    await publishEvent({
      type: "creator.updated",
      module: "creators",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: id,
      entityType: "creator",
      relatedCreatorId: id,
      link: `/admin/creators/${id}`,
      payload: {
        name: fields.display_name,
        managerId,
        manager_id: managerId,
        status: fields.status,
      },
    });

    if (statusChanged) {
      await publishEvent({
        type: "status.changed",
        module: "creators",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: id,
        entityType: "creator",
        relatedCreatorId: id,
        link: `/admin/creators/${id}`,
        payload: {
          name: fields.display_name,
          status: fields.status,
          previousStatus: current.status,
          managerId,
          manager_id: managerId,
        },
      });
    }

    if (managerChanged) {
      await publishEvent({
        type: "manager.changed",
        module: "creators",
        actorId: session.profile.id,
        actorRole: session.profile.role,
        targetId: id,
        entityType: "creator",
        relatedCreatorId: id,
        link: `/admin/creators/${id}`,
        payload: {
          name: fields.display_name,
          managerId,
          manager_id: managerId,
          previousManagerId: current.manager_id,
        },
      });
    }

    await revalidateCreator(id);
    return { success: true, id };
  } catch (error) {
    console.error("[updateCreatorProfile]", error);
    return { success: false, error: t("save") };
  }
}

export async function archiveCreator(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !canEditCreators(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = creatorIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const denied = await assertProfileAccess(parsed.data.id, "creators.update");
    if (denied) return denied;

    const supabase = await createClient();
    const { data: current } = await supabase
      .from("creators")
      .select("id, display_name, status, manager_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!current) return { success: false, error: t("invalid") };

    const { error } = await supabase
      .from("creators")
      .update({
        status: "inactive",
        is_active: false,
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[archiveCreator]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "creator.archived",
      module: "creators",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator",
      relatedCreatorId: parsed.data.id,
      link: `/admin/creators/${parsed.data.id}`,
      payload: {
        name: current.display_name,
        previousStatus: current.status,
        status: "inactive",
        managerId: current.manager_id,
        manager_id: current.manager_id,
      },
    });

    await publishEvent({
      type: "status.changed",
      module: "creators",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator",
      relatedCreatorId: parsed.data.id,
      link: `/admin/creators/${parsed.data.id}`,
      payload: {
        name: current.display_name,
        previousStatus: current.status,
        status: "inactive",
        managerId: current.manager_id,
        manager_id: current.manager_id,
      },
    });

    await revalidateCreator(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[archiveCreator]", error);
    return { success: false, error: t("save") };
  }
}

export async function deleteCreator(
  raw: unknown,
): Promise<CreatorActionResult> {
  const t = await getTranslations("admin.creators.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session || !canDeleteCreators(session.profile.role)) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = creatorIdSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const denied = await assertProfileAccess(parsed.data.id, "creators.delete");
    if (denied) return denied;

    const admin = createAdminClient();
    const { data: current } = await admin
      .from("creators")
      .select("id, display_name, manager_id, user_id, email")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!current) return { success: false, error: t("invalid") };

    await publishEvent({
      type: "creator.deleted",
      module: "creators",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "creator",
      relatedCreatorId: parsed.data.id,
      link: `/admin/creators`,
      payload: {
        name: current.display_name,
        email: current.email,
        managerId: current.manager_id,
        manager_id: current.manager_id,
      },
    });

    const { error } = await admin
      .from("creators")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[deleteCreator]", error.message);
      return { success: false, error: t("save") };
    }

    await revalidateCreator();
    return { success: true };
  } catch (error) {
    console.error("[deleteCreator]", error);
    return { success: false, error: t("save") };
  }
}
