import { z } from "zod";
import { CABINET_PLATFORMS, STAT_RANGES } from "@/features/cabinet/types";
import { Constants } from "@/types/database.types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

export const updateCreatorProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  biography: optionalText(4000),
  languages: z.preprocess((value) => {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === "string") {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string().trim().min(1).max(80)).max(20)),
  country: optionalText(120),
  timezone: optionalText(80),
  telegram: optionalText(120),
  phone: optionalText(40),
  birthday: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null)
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Invalid date",
    }),
  avatar_url: optionalText(2000),
});

export const updatePlatformAccountSchema = z.object({
  platform: z.enum(CABINET_PLATFORMS),
  username: optionalText(120),
  profile_url: optionalText(2000),
  status: z.enum(Constants.public.Enums.platform_link_status),
});

export const completeTaskSchema = z.object({
  id: z.string().uuid(),
});

export const createTicketSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(10000),
});

export const replyTicketSchema = z.object({
  ticket_id: z.string().uuid(),
  body: z.string().trim().min(1).max(10000),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  locale: optionalText(10),
  notify_telegram: z.coerce.boolean(),
  notify_email: z.coerce.boolean(),
});

export const uploadDocumentSchema = z.object({
  doc_type: z.enum(Constants.public.Enums.creator_document_type),
});

export const statsRangeSchema = z.enum(STAT_RANGES).default("30d");
