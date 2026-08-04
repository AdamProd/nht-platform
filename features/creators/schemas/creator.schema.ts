import { z } from "zod";
import { Constants } from "@/types/database.types";
import { CREATOR_PLATFORMS } from "@/features/creators/types";

export const creatorStatuses = Constants.public.Enums.creator_status;

export const creatorSortValues = ["newest", "oldest", "name"] as const;

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
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

export const createCreatorSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  telegram: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((value) => value || null),
  country: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((value) => value || null),
  languages: stringArraySchema.default([]),
  platforms: stringArraySchema.default([]),
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

export const updateCreatorSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  telegram: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((value) => value || null),
  country: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((value) => value || null),
  languages: stringArraySchema.default([]),
  platforms: stringArraySchema.default([]),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null))
    .optional()
    .default(null),
  status: z.enum(creatorStatuses),
  notes: z
    .string()
    .max(10000)
    .optional()
    .nullable()
    .transform((value) => (value ? value.trim() || null : null)),
  avatar_url: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export const updateCreatorStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(creatorStatuses),
});

export const assignCreatorManagerSchema = z.object({
  id: z.string().uuid(),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const updateCreatorNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .string()
    .max(10000)
    .transform((value) => value.trim() || null),
});

export const uploadAvatarSchema = z.object({
  id: z.string().uuid(),
  avatar_url: z.string().trim().url().max(2000).optional().nullable(),
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
export type UpdateCreatorInput = z.infer<typeof updateCreatorSchema>;
