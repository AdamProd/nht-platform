import { z } from "zod";
import { Constants } from "@/types/database.types";
import { CREATOR_PLATFORMS } from "@/features/creators/types";
import { stringArraySchema } from "@/features/creators/schemas/creator.schema";

const creatorStatuses = Constants.public.Enums.creator_status;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => value || null)
  .refine(
    (value) => !value || /^https?:\/\//i.test(value) || value.startsWith("@"),
    { message: "Invalid URL" },
  );

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export const updateCreatorProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
  legal_name: optionalText(120),
  email: z.string().trim().email().max(255),
  telegram: optionalText(120),
  phone: optionalText(40),
  country: optionalText(120),
  timezone: optionalText(80),
  languages: stringArraySchema.default([]),
  notes: optionalText(10000),
  status: z.enum(creatorStatuses),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null))
    .optional()
    .default(null),
  onlyfans_url: optionalUrl,
  fansly_url: optionalUrl,
  manyvids_url: optionalUrl,
  chaturbate_url: optionalUrl,
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  twitter_url: optionalUrl,
  platforms: z
    .preprocess(
      parseStringArray,
      z.array(z.enum(CREATOR_PLATFORMS)).max(CREATOR_PLATFORMS.length),
    )
    .optional()
    .default([]),
});

export const creatorIdSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateCreatorProfileInput = z.infer<
  typeof updateCreatorProfileSchema
>;
