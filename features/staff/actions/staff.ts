"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth";
import { publishEvent } from "@/features/core/events";
import { getClientEnv } from "@/lib/env/client-env";
import {
  canChangeRoleTo,
  canDeleteStaff,
  canManageTargetStaff,
  forbiddenResult,
  requireStaffAdminSession,
} from "@/features/staff/lib/access";
import { hasPermission } from "@/features/core/permissions";
import {
  assignApplicationSchema,
  assignCreatorSchema,
  assignTaskSchema,
  createStaffSchema,
  transferOwnershipSchema,
  updateStaffDepartmentSchema,
  updateStaffProfileSchema,
  updateStaffRoleSchema,
  updateStaffStatusSchema,
} from "@/features/staff/schemas/staff.schema";
import type { StaffActionResult } from "@/features/staff/types";
import type { TablesUpdate, UserRole } from "@/types/database.types";

async function revalidateStaff(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/staff`);
  revalidatePath(`/${locale}/admin`);
  if (id) revalidatePath(`/${locale}/admin/staff/${id}`);
}

async function loadTarget(id: string) {
  const supabase = await createClient();
  return supabase.from("profiles").select("*").eq("id", id).maybeSingle();
}

export async function createStaff(
  raw: unknown,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));
    if (!hasPermission(session.profile.role, "staff.create")) {
      return forbiddenResult(t("forbidden"));
    }

    const parsed = createStaffSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    if (!canChangeRoleTo(session.profile.role, parsed.data.role)) {
      return forbiddenResult(t("forbiddenRole"));
    }

    const fullName = `${parsed.data.first_name} ${parsed.data.last_name}`.trim();
    const locale = await getLocale();
    const siteUrl = getClientEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const redirectTo = `${siteUrl}/${locale}/callback?next=${encodeURIComponent(`/${locale}/auth/set-password`)}`;

    const admin = createAdminClient();
    const invited = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      redirectTo,
      data: {
        full_name: fullName,
        role: parsed.data.role,
      },
    });

    if (invited.error || !invited.data.user) {
      console.error("[createStaff.invite]", invited.error?.message);
      return { success: false, error: t("create") };
    }

    const userId = invited.data.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      email: parsed.data.email,
      full_name: fullName,
      role: parsed.data.role,
      department: parsed.data.department,
      department_custom: null,
      locale,
      status: "invited",
    });

    if (profileError) {
      console.error("[createStaff.profile]", profileError.message);
      return { success: false, error: t("create") };
    }

    await publishEvent({
      type: "employee.created",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: userId,
      entityType: "profile",
      link: `/admin/staff/${userId}`,
      recipientIds: [userId, session.profile.id],
      payload: {
        name: fullName,
        email: parsed.data.email,
        role: parsed.data.role,
        userId,
      },
    });

    await revalidateStaff(userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("[createStaff]", error);
    return { success: false, error: t("create") };
  }
}

export async function updateStaffProfile(
  raw: unknown,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = updateStaffProfileSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }

    const department =
      parsed.data.department === "custom"
        ? "custom"
        : parsed.data.department ?? null;

    const patch: TablesUpdate<"profiles"> = {
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      department,
      department_custom:
        department === "custom" ? parsed.data.department_custom : null,
      timezone: parsed.data.timezone || null,
      locale: parsed.data.locale || null,
      biography: parsed.data.biography || null,
      notes: parsed.data.notes || null,
      avatar_url: parsed.data.avatar_url || null,
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateStaffProfile]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "employee.updated",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.id}`,
      payload: {
        name: parsed.data.full_name,
        userId: parsed.data.id,
      },
    });

    await revalidateStaff(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateStaffProfile]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStaffRole(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = updateStaffRoleSchema.safeParse({
      id: formData.get("id"),
      role: formData.get("role"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }
    if (!canChangeRoleTo(session.profile.role, parsed.data.role)) {
      return forbiddenResult(t("forbiddenRole"));
    }
    if (target.role === "owner" && !isOwner(session.profile.role)) {
      return forbiddenResult(t("forbiddenOwner"));
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: parsed.data.role })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateStaffRole]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "staff.role_changed",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.id}`,
      recipientIds: [parsed.data.id],
      payload: {
        name: target.full_name,
        userId: parsed.data.id,
        role: parsed.data.role,
        previousRole: target.role,
      },
    });

    await revalidateStaff(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateStaffRole]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStaffStatus(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = updateStaffStatusSchema.safeParse({
      id: formData.get("id"),
      status: formData.get("status"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateStaffStatus]", error.message);
      return { success: false, error: t("save") };
    }

    const admin = createAdminClient();
    const becameSuspended =
      parsed.data.status === "suspended" ||
      parsed.data.status === "disabled" ||
      parsed.data.status === "archived";
    const becameActive =
      parsed.data.status === "active" || parsed.data.status === "invited";

    if (becameSuspended) {
      await admin.auth.admin.updateUserById(parsed.data.id, {
        ban_duration: "876000h",
      });
    } else if (becameActive && target.status === "suspended") {
      await admin.auth.admin.updateUserById(parsed.data.id, {
        ban_duration: "none",
      });
    }

    const eventType =
      parsed.data.status === "suspended" && target.status !== "suspended"
        ? "employee.suspended"
        : parsed.data.status === "active" &&
            (target.status === "suspended" ||
              target.status === "disabled" ||
              target.status === "archived")
          ? "employee.activated"
          : "employee.updated";

    await publishEvent({
      type: eventType,
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.id}`,
      recipientIds: [parsed.data.id],
      payload: {
        name: target.full_name,
        userId: parsed.data.id,
        status: parsed.data.status,
        previousStatus: target.status,
      },
    });

    await revalidateStaff(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateStaffStatus]", error);
    return { success: false, error: t("save") };
  }
}

export async function updateStaffDepartment(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const rawDept = formData.get("department");
    const parsed = updateStaffDepartmentSchema.safeParse({
      id: formData.get("id"),
      department: rawDept === "" ? null : rawDept,
      department_custom: formData.get("department_custom") || null,
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }

    const department = parsed.data.department;
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        department,
        department_custom:
          department === "custom" ? parsed.data.department_custom : null,
      })
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[updateStaffDepartment]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "staff.department_changed",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.id}`,
      payload: {
        name: target.full_name,
        userId: parsed.data.id,
        department,
        department_custom: parsed.data.department_custom,
      },
    });

    await revalidateStaff(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[updateStaffDepartment]", error);
    return { success: false, error: t("save") };
  }
}

export async function deleteStaff(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));
    if (!canDeleteStaff(session.profile.role)) {
      return forbiddenResult(t("forbiddenOwner"));
    }

    const id = String(formData.get("id") ?? "");
    if (!id) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(id);
    if (!target) return { success: false, error: t("notFound") };
    if (target.role === "owner") {
      return forbiddenResult(t("forbiddenOwner"));
    }
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }
    if (target.id === session.profile.id) {
      return forbiddenResult(t("cannotDeleteSelf"));
    }

    const admin = createAdminClient();

    // Clear assignments so profile/auth deletion is not blocked by FKs.
    await admin
      .from("creators")
      .update({ manager_id: null })
      .eq("manager_id", id);
    await admin
      .from("applications")
      .update({ assigned_manager: null })
      .eq("assigned_manager", id);

    const deleted = await admin.auth.admin.deleteUser(id);
    if (deleted.error) {
      console.error("[deleteStaff.auth]", deleted.error.message);
      // Fallback: archive + ban if hard delete is blocked by remote FKs.
      await admin
        .from("profiles")
        .update({ status: "archived", role: "guest" as UserRole })
        .eq("id", id);
      await admin.auth.admin.updateUserById(id, { ban_duration: "876000h" });
      return { success: false, error: t("delete") };
    }

    // Ensure profile row is gone when auth cascade is not configured.
    await admin.from("profiles").delete().eq("id", id);

    await publishEvent({
      type: "employee.deleted",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: id,
      entityType: "profile",
      visibility: "owner",
      payload: {
        name: target.full_name,
        email: target.email,
        userId: id,
        previousRole: target.role,
      },
    });

    await revalidateStaff();
    return { success: true };
  } catch (error) {
    console.error("[deleteStaff]", error);
    return { success: false, error: t("delete") };
  }
}

export async function transferOwnership(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session || !isOwner(session.profile.role)) {
      return forbiddenResult(t("forbiddenOwner"));
    }
    if (!hasPermission(session.profile.role, "staff.transfer_ownership")) {
      return forbiddenResult(t("forbidden"));
    }

    const parsed = transferOwnershipSchema.safeParse({
      id: formData.get("id"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };
    if (parsed.data.id === session.profile.id) {
      return forbiddenResult(t("invalid"));
    }

    const { data: target } = await loadTarget(parsed.data.id);
    if (!target) return { success: false, error: t("notFound") };

    const admin = createAdminClient();
    const demote = await admin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", session.profile.id);
    if (demote.error) {
      console.error("[transferOwnership.demote]", demote.error.message);
      return { success: false, error: t("save") };
    }

    const promote = await admin
      .from("profiles")
      .update({ role: "owner", status: "active" })
      .eq("id", parsed.data.id);
    if (promote.error) {
      console.error("[transferOwnership.promote]", promote.error.message);
      await admin
        .from("profiles")
        .update({ role: "owner" })
        .eq("id", session.profile.id);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "staff.role_changed",
      module: "admin",
      actorId: session.profile.id,
      actorRole: "owner",
      targetId: parsed.data.id,
      entityType: "profile",
      visibility: "owner",
      recipientIds: [parsed.data.id],
      link: `/admin/staff/${parsed.data.id}`,
      payload: {
        name: target.full_name,
        userId: parsed.data.id,
        role: "owner",
        previousRole: target.role,
        transfer: true,
      },
    });

    await revalidateStaff(parsed.data.id);
    return { success: true, id: parsed.data.id };
  } catch (error) {
    console.error("[transferOwnership]", error);
    return { success: false, error: t("save") };
  }
}

export async function assignCreatorToStaff(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = assignCreatorSchema.safeParse({
      staff_id: formData.get("staff_id"),
      creator_id: formData.get("creator_id"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.staff_id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }

    const supabase = await createClient();
    const { data: creator } = await supabase
      .from("creators")
      .select("id, display_name, manager_id")
      .eq("id", parsed.data.creator_id)
      .maybeSingle();
    if (!creator) return { success: false, error: t("notFound") };

    const { error } = await supabase
      .from("creators")
      .update({ manager_id: parsed.data.staff_id })
      .eq("id", parsed.data.creator_id);

    if (error) {
      console.error("[assignCreatorToStaff]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "staff.assigned_creator",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.staff_id,
      relatedCreatorId: parsed.data.creator_id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.staff_id}`,
      recipientIds: [parsed.data.staff_id],
      payload: {
        name: target.full_name,
        userId: parsed.data.staff_id,
        creatorId: parsed.data.creator_id,
        creatorName: creator.display_name,
        managerId: parsed.data.staff_id,
      },
    });

    await revalidateStaff(parsed.data.staff_id);
    return { success: true };
  } catch (error) {
    console.error("[assignCreatorToStaff]", error);
    return { success: false, error: t("save") };
  }
}

export async function unassignCreatorFromStaff(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = assignCreatorSchema.safeParse({
      staff_id: formData.get("staff_id"),
      creator_id: formData.get("creator_id"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const { data: target } = await loadTarget(parsed.data.staff_id);
    if (!target) return { success: false, error: t("notFound") };
    if (!canManageTargetStaff(session.profile.role, target.role)) {
      return forbiddenResult(t("forbidden"));
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("creators")
      .update({ manager_id: null })
      .eq("id", parsed.data.creator_id)
      .eq("manager_id", parsed.data.staff_id);

    if (error) {
      console.error("[unassignCreatorFromStaff]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "staff.unassigned_creator",
      module: "admin",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.staff_id,
      relatedCreatorId: parsed.data.creator_id,
      entityType: "profile",
      link: `/admin/staff/${parsed.data.staff_id}`,
      payload: {
        name: target.full_name,
        userId: parsed.data.staff_id,
        creatorId: parsed.data.creator_id,
      },
    });

    await revalidateStaff(parsed.data.staff_id);
    return { success: true };
  } catch (error) {
    console.error("[unassignCreatorFromStaff]", error);
    return { success: false, error: t("save") };
  }
}

export async function assignApplicationToStaff(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = assignApplicationSchema.safeParse({
      staff_id: formData.get("staff_id"),
      application_id: formData.get("application_id"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { data: app } = await supabase
      .from("applications")
      .select("id, full_name")
      .eq("id", parsed.data.application_id)
      .maybeSingle();
    if (!app) return { success: false, error: t("notFound") };

    const { error } = await supabase
      .from("applications")
      .update({ assigned_manager: parsed.data.staff_id })
      .eq("id", parsed.data.application_id);

    if (error) {
      console.error("[assignApplicationToStaff]", error.message);
      return { success: false, error: t("save") };
    }

    await publishEvent({
      type: "application.assigned",
      module: "applications",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.application_id,
      link: `/admin/applications/${parsed.data.application_id}`,
      payload: {
        name: app.full_name,
        managerId: parsed.data.staff_id,
        assigned_manager: parsed.data.staff_id,
      },
    });

    await revalidateStaff(parsed.data.staff_id);
    return { success: true };
  } catch (error) {
    console.error("[assignApplicationToStaff]", error);
    return { success: false, error: t("save") };
  }
}

export async function assignTaskToStaff(
  formData: FormData,
): Promise<StaffActionResult> {
  const t = await getTranslations("admin.staff.actionErrors");

  try {
    const session = await requireStaffAdminSession();
    if (!session) return forbiddenResult(t("unauthorized"));

    const parsed = assignTaskSchema.safeParse({
      staff_id: formData.get("staff_id"),
      task_id: formData.get("task_id"),
    });
    if (!parsed.success) return { success: false, error: t("invalid") };

    const supabase = await createClient();
    const { error } = await supabase
      .from("creator_tasks")
      .update({ manager_id: parsed.data.staff_id })
      .eq("id", parsed.data.task_id);

    if (error) {
      console.error("[assignTaskToStaff]", error.message);
      // Soft-fail when tasks table is unavailable on live
      return { success: false, error: t("tasksUnavailable") };
    }

    await publishEvent({
      type: "staff.updated",
      module: "tasks",
      actorId: session.profile.id,
      actorRole: session.profile.role,
      targetId: parsed.data.staff_id,
      link: `/admin/staff/${parsed.data.staff_id}`,
      payload: {
        userId: parsed.data.staff_id,
        taskId: parsed.data.task_id,
        assignment: "task",
      },
    });

    await revalidateStaff(parsed.data.staff_id);
    return { success: true };
  } catch (error) {
    console.error("[assignTaskToStaff]", error);
    return { success: false, error: t("save") };
  }
}
