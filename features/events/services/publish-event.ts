import { getTranslations } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_CATALOG } from "@/features/events/utils/catalog";
import { resolveNotificationRecipients } from "@/features/events/utils/recipients";
import type {
  PublishEventInput,
  PublishedEvent,
} from "@/features/events/types";
import type { Json } from "@/types/database.types";

function interpolate(
  template: string,
  params: Record<string, unknown>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? "" : String(value);
  });
}

/**
 * Central event publisher.
 * One call → platform_events row → notifications → activity_logs.
 * Modules must not implement notification/activity logic themselves.
 */
export async function publishEvent(
  input: PublishEventInput,
): Promise<PublishedEvent | null> {
  try {
    const meta = EVENT_CATALOG[input.type];
    const visibility = input.visibility ?? meta.defaultVisibility;
    const entityType = input.entityType ?? meta.entityType;
    const payload = (input.payload ?? {}) as Record<string, unknown>;

    const t = await getTranslations("events.catalog");
    const title =
      input.title ??
      interpolate(t(meta.titleKey as never), payload);
    const message =
      input.message ??
      interpolate(t(meta.messageKey as never), payload);
    const description =
      input.description ??
      interpolate(t(meta.descriptionKey as never), payload);

    const admin = createAdminClient();

    const { data: event, error: eventError } = await admin
      .from("platform_events")
      .insert({
        type: input.type,
        module: input.module,
        actor_id: input.actorId ?? null,
        actor_role: input.actorRole ?? null,
        target_id: input.targetId ?? null,
        entity_type: entityType,
        payload: payload as Json,
        visibility,
        related_creator_id: input.relatedCreatorId ?? null,
      })
      .select("id")
      .single();

    if (eventError || !event) {
      console.error("[publishEvent.event]", eventError?.message);
      return null;
    }

    const { error: activityError } = await admin.from("activity_logs").insert({
      event_id: event.id,
      actor_id: input.actorId ?? null,
      actor_role: input.actorRole ?? null,
      module: input.module,
      event_type: input.type,
      entity_type: entityType,
      entity_id: input.targetId ?? null,
      description,
      payload: payload as Json,
      visibility,
      related_creator_id: input.relatedCreatorId ?? null,
    });

    if (activityError) {
      console.error("[publishEvent.activity]", activityError.message);
    }

    const recipients = await resolveNotificationRecipients(input);
    if (recipients.length > 0) {
      const rows = recipients.map((recipientId) => ({
        recipient_id: recipientId,
        actor_id: input.actorId ?? null,
        module: input.module,
        event_type: input.type,
        event_id: event.id,
        title,
        message,
        link: input.link ?? null,
      }));

      const { error: notificationError } = await admin
        .from("notifications")
        .insert(rows);

      if (notificationError) {
        console.error(
          "[publishEvent.notifications]",
          notificationError.message,
        );
      }
    }

    return {
      id: event.id,
      type: input.type,
      module: input.module,
    };
  } catch (error) {
    console.error("[publishEvent] unexpected:", error);
    return null;
  }
}
