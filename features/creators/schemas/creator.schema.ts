import { z } from "zod";
import { Constants } from "@/types/database.types";
import { CREATOR_PLATFORMS } from "@/features/creators/types";

export const creatorStatuses = Constants.public.Enums.creator_status;

export const creatorSortValues = [
  "newest",
  "oldest",
  "name",
  "revenue",
] as const;

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

export const stringArraySchema = z.preprocess(
  parseStringArray,
  z.array(z.string().trim().min(1).max(80)).max(20),
);

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .nullable()
  .transform((value) => value || null);

const optionalUrlOrHandle = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .transform((value) => value || null);

export const platformAccountsSchema = z.object({
  onlyfans: optionalUrlOrHandle,
  fansly: optionalUrlOrHandle,
  chaturbate: optionalUrlOrHandle,
  instagram: optionalUrlOrHandle,
  tiktok: optionalUrlOrHandle,
  twitter: optionalUrlOrHandle,
});

export const createCreatorSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  legal_name: optionalText,
  email: z.string().trim().email().max(255),
  telegram: optionalText,
  phone: optionalText,
  country: optionalText,
  timezone: optionalText,
  birthday: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null)
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Invalid birthday",
    }),
  languages: stringArraySchema.default([]),
  platforms: z.array(z.enum(CREATOR_PLATFORMS)).default([]),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null))
    .optional()
    .default(null),
  status: z.enum(creatorStatuses).default("new"),
  notes: z
    .string()
    .max(10000)
    .optional()
    .nullable()
    .transform((value) => (value ? value.trim() || null : null)),
});

export const updateProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
  legal_name: optionalText,
  email: z.string().trim().email().max(255),
  telegram: optionalText,
  phone: optionalText,
  country: optionalText,
  timezone: optionalText,
  birthday: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null)
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Invalid birthday",
    }),
  languages: stringArraySchema.default([]),
  avatar_url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export const updateManagerSchema = z.object({
  id: z.string().uuid(),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(creatorStatuses),
});

export const updatePlatformsSchema = z.object({
  id: z.string().uuid(),
  platform_accounts: platformAccountsSchema,
});

export const updateNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .string()
    .max(10000)
    .transform((value) => value.trim() || null),
});

export const creatorsListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  status: z
    .union([z.enum(creatorStatuses), z.literal("")])
    .optional()
    .default(""),
  manager: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
  country: z.string().trim().max(120).optional().default(""),
  platform: z
    .union([z.enum(CREATOR_PLATFORMS), z.literal("")])
    .optional()
    .default(""),
  sort: z.enum(creatorSortValues).optional().default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreatorsListFilters = z.infer<typeof creatorsListFiltersSchema>;
export type CreateCreatorInput = z.infer<typeof createCreatorSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePlatformsInput = z.infer<typeof updatePlatformsSchema>;
