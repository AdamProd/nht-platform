"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireCreatorCabinetSession } from "@/lib/auth";
import {
  completeTaskSchema,
  createTicketSchema,
  replyTicketSchema,
  updateCreatorProfileSchema,
  updatePlatformAccountSchema,
  updateSettingsSchema,
  uploadDocumentSchema,
} from "@/features/cabinet/schemas/cabinet.schema";
import {
  CREATOR_DOCUMENTS_BUCKET,
  creatorDocumentPath,
} from "@/features/cabinet/lib/storage";
import type { CabinetActionResult } from "@/features/cabinet/types";
import { publishEvent } from "@/features/core/events";

async function revalidateCreatorPages() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/creator`);
  revalidatePath(`/${locale}/creator/profile`);
  revalidatePath(`/${locale}/creator/platforms`);
  revalidatePath(`/${locale}/creator/tasks`);
  revalidatePath(`/${locale}/creator/payouts`);
  revalidatePath(`/${locale}/creator/documents`);
  revalidatePath(`/${locale}/creator/support`);
  revalidatePath(`/${locale}/creator/settings`);
  revalidatePath(`/${locale}/creator/statistics`);
}

export async function updateCreatorProfile(
  raw: unknown,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = updateCreatorProfileSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: t("invalid") };

  const { biography: _biography, ...fields } = parsed.data;
  void _biography;

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { error } = await admin
    .from("creators")
    .update({
      ...fields,
      full_name: fields.display_name,
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", session.creator.id);

  if (error) {
    console.error("[updateCreatorProfile]", error.message);
    return { success: false, error: t("save") };
  }

  await publishEvent({
    type: "creator.profile_updated",
    module: "cabinet",
    actorId: session.profile.id,
    actorRole: session.profile.role,
    targetId: session.creator.id,
    entityType: "creator",
    relatedCreatorId: session.creator.id,
    link: `/admin/creators/${session.creator.id}`,
    payload: {
      name: fields.display_name ?? session.creator.display_name,
      managerId: session.creator.manager_id,
      manager_id: session.creator.manager_id,
    },
  });

  await revalidateCreatorPages();
  return { success: true };
}

export async function updatePlatformAccount(
  raw: unknown,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = updatePlatformAccountSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: t("invalid") };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const existing =
    (session.creator.platform_accounts as Record<string, string> | null) ?? {};
  const nextAccounts = { ...existing };
  const value = parsed.data.profile_url || parsed.data.username;
  const hadPlatform = Boolean(existing[parsed.data.platform]);
  if (value) nextAccounts[parsed.data.platform] = value;
  else delete nextAccounts[parsed.data.platform];

  const { error } = await admin
    .from("creators")
    .update({
      platform_accounts: nextAccounts,
      platforms: Object.keys(nextAccounts),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", session.creator.id);

  if (error) {
    console.error("[updatePlatformAccount]", error.message);
    return { success: false, error: t("save") };
  }

  const added = Boolean(value) && !hadPlatform;
  await publishEvent({
    type: added ? "creator.platform_added" : "creator.profile_updated",
    module: "cabinet",
    actorId: session.profile.id,
    actorRole: session.profile.role,
    targetId: session.creator.id,
    entityType: "creator",
    relatedCreatorId: session.creator.id,
    link: `/admin/creators/${session.creator.id}`,
    payload: {
      name: session.creator.display_name,
      platform: parsed.data.platform,
      managerId: session.creator.manager_id,
      manager_id: session.creator.manager_id,
    },
  });

  await revalidateCreatorPages();
  return { success: true };
}

export async function completeTask(
  formData: FormData,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = completeTaskSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { success: false, error: t("invalid") };

  // creator_tasks is not on the live schema
  void parsed;
  void session;
  return { success: false, error: t("save") };
}

export async function uploadDocument(
  formData: FormData,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = uploadDocumentSchema.safeParse({
    doc_type: formData.get("doc_type"),
  });
  if (!parsed.success) return { success: false, error: t("invalid") };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: t("invalid") };
  }

  const path = creatorDocumentPath(
    session.creator.id,
    parsed.data.doc_type,
    file.name,
  );
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CREATOR_DOCUMENTS_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadDocument]", uploadError.message);
    return { success: false, error: t("save") };
  }

  const { error } = await supabase.from("creator_documents").insert({
    creator_id: session.creator.id,
    uploaded_by: session.profile.id,
    doc_type: parsed.data.doc_type,
    file_name: file.name,
    mime_type: file.type || null,
    size_bytes: file.size,
    bucket: CREATOR_DOCUMENTS_BUCKET,
    path,
  });

  if (error) {
    console.error("[uploadDocument.meta]", error.message);
    return { success: false, error: t("save") };
  }

  await publishEvent({
    type: "creator.document_uploaded",
    module: "cabinet",
    actorId: session.profile.id,
    actorRole: session.profile.role,
    targetId: session.creator.id,
    entityType: "creator",
    relatedCreatorId: session.creator.id,
    link: `/admin/creators/${session.creator.id}`,
    payload: {
      name: session.creator.display_name,
      docType: parsed.data.doc_type,
      fileName: file.name,
      managerId: session.creator.manager_id,
      manager_id: session.creator.manager_id,
    },
  });

  await revalidateCreatorPages();
  return { success: true };
}

export async function deleteDocument(
  formData: FormData,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const id = String(formData.get("id") ?? "");
  if (!id) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("creator_documents")
    .select("*")
    .eq("id", id)
    .eq("creator_id", session.creator.id)
    .maybeSingle();

  if (!doc) return { success: false, error: t("invalid") };

  await supabase.storage.from(doc.bucket).remove([doc.path]);
  const { error } = await supabase
    .from("creator_documents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[deleteDocument]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateCreatorPages();
  return { success: true };
}

export async function createSupportTicket(
  raw: unknown,
): Promise<CabinetActionResult & { id?: string }> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = createTicketSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { data: ticket, error } = await supabase
    .from("creator_support_tickets")
    .insert({
      creator_id: session.creator.id,
      subject: parsed.data.subject,
      status: "open",
      last_message_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !ticket) {
    console.error("[createSupportTicket]", error?.message);
    return { success: false, error: t("save") };
  }

  await supabase.from("creator_support_messages").insert({
    ticket_id: ticket.id,
    author_id: session.profile.id,
    body: parsed.data.message,
    is_staff: false,
  });

  await revalidateCreatorPages();
  return { success: true, id: ticket.id };
}

export async function replySupportTicket(
  formData: FormData,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = replyTicketSchema.safeParse({
    ticket_id: formData.get("ticket_id"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("creator_support_tickets")
    .select("id")
    .eq("id", parsed.data.ticket_id)
    .eq("creator_id", session.creator.id)
    .maybeSingle();

  if (!ticket) return { success: false, error: t("forbidden") };

  const { error } = await supabase.from("creator_support_messages").insert({
    ticket_id: parsed.data.ticket_id,
    author_id: session.profile.id,
    body: parsed.data.body,
    is_staff: session.impersonating || session.profile.role !== "creator",
  });

  if (error) {
    console.error("[replySupportTicket]", error.message);
    return { success: false, error: t("save") };
  }

  await supabase
    .from("creator_support_tickets")
    .update({
      status: "waiting",
      last_message_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.ticket_id);

  await revalidateCreatorPages();
  return { success: true };
}

export async function updateCreatorSettings(
  formData: FormData,
): Promise<CabinetActionResult> {
  const t = await getTranslations("creator.actionErrors");
  const session = await requireCreatorCabinetSession();
  if (!session) return { success: false, error: t("unauthorized") };

  const parsed = updateSettingsSchema.safeParse({
    theme: formData.get("theme"),
    locale: formData.get("locale"),
    notify_telegram: formData.get("notify_telegram") === "on",
    notify_email: formData.get("notify_email") === "on",
  });
  if (!parsed.success) return { success: false, error: t("invalid") };

  const supabase = await createClient();
  const { error } = await supabase.from("creator_settings").upsert({
    creator_id: session.creator.id,
    theme: parsed.data.theme,
    locale: parsed.data.locale,
    notify_telegram: parsed.data.notify_telegram,
    notify_email: parsed.data.notify_email,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[updateCreatorSettings]", error.message);
    return { success: false, error: t("save") };
  }

  await revalidateCreatorPages();
  return { success: true };
}
