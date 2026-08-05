import { z } from "zod";
import { Constants } from "@/types/database.types";
import {
  CREATOR_PLATFORMS,
  type CreatorPlatform,
} from "@/features/creators/types";

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

export function platformsFromUrls(urls: {
  onlyfans_url?: string | null;
  fansly_url?: string | null;
  chaturbate_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  twitter_url?: string | null;
}): CreatorPlatform[] {
  const map: Array<[CreatorPlatform, string | null | undefined]> = [
    ["onlyfans", urls.onlyfans_url],
    ["fansly", urls.fansly_url],
    ["chaturbate", urls.chaturbate_url],
    ["instagram", urls.instagram_url],
    ["tiktok", urls.tiktok_url],
    ["twitter", urls.twitter_url],
  ];
  return map.filter(([, url]) => Boolean(url)).map(([key]) => key);
}

export const createCreatorSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  telegram: optionalText(120),
  country: optionalText(120),
  languages: stringArraySchema.default([]),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null))
    .optional()
    .default(null),
  status: z.enum(creatorStatuses).default("new"),
  notes: optionalText(10000),
});

export const updateProfileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
  legal_name: optionalText(120),
  birthday: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null)
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Invalid date",
    }),
  country: optionalText(120),
  languages: stringArraySchema.default([]),
  timezone: optionalText(80),
  email: z.string().trim().email().max(255),
  telegram: optionalText(120),
  phone: optionalText(40),
  avatar_url: optionalUrl,
});

export const updatePlatformsSchema = z.object({
  id: z.string().uuid(),
  onlyfans_url: optionalUrl,
  fansly_url: optionalUrl,
  chaturbate_url: optionalUrl,
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  twitter_url: optionalUrl,
});

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(creatorStatuses),
});

export const updateManagerSchema = z.object({
  id: z.string().uuid(),
  manager_id: z
    .string()
    .uuid()
    .nullable()
    .or(z.literal("").transform(() => null)),
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
