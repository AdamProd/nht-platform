"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from "@/features/applications/schemas/application.schema";
import { notifyNewApplication } from "@/services";
import { publishEvent } from "@/features/events";

export type SubmitApplicationResult =
  | { success: true; id: string }
  | {
      success: false;
      error: "validation" | "server";
      fieldErrors?: Partial<Record<keyof ApplicationFormInput, string[]>>;
      message?: string;
    };

function formDataToInput(formData: FormData): Record<string, unknown> {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    platform: formData.get("platform"),
    message: formData.get("message"),
    locale: formData.get("locale") || "en",
  };
}

export async function submitApplication(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  const parsed = applicationFormSchema.safeParse(formDataToInput(formData));

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ApplicationFormInput, string[]>> =
      {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key !== "string") continue;
      const field = key as keyof ApplicationFormInput;
      fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    }

    return {
      success: false,
      error: "validation",
      fieldErrors,
      message: "Please check the form fields and try again.",
    };
  }

  const { name, email, platform, message, locale } = parsed.data;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("applications")
      .insert({
        full_name: name,
        email,
        platform,
        message,
        locale,
        type: "creator",
        status: "new",
        priority: "normal",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[submitApplication]", error?.message ?? "No data returned");
      return {
        success: false,
        error: "server",
        message: "Unable to save your application. Please try again.",
      };
    }

    try {
      await notifyNewApplication({
        id: data.id,
        fullName: name,
        email,
        platform,
        message,
        locale,
        type: "creator",
      });
    } catch (telegramError) {
      console.error(
        "[telegram] Unexpected failure after successful insert:",
        telegramError,
      );
    }

    await publishEvent({
      type: "application.created",
      module: "applications",
      targetId: data.id,
      entityType: "application",
      link: `/admin/applications/${data.id}`,
      payload: {
        name,
        email,
        platform,
        locale,
      },
    });

    return { success: true, id: data.id };
  } catch (err) {
    console.error("[submitApplication]", err);
    return {
      success: false,
      error: "server",
      message: "Unable to save your application. Please try again.",
    };
  }
}
