import { z } from "zod";
import { Constants } from "@/types/database.types";

export const applicationStatuses = Constants.public.Enums.application_status;
export const applicationPriorities =
  Constants.public.Enums.application_priority;

export const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(applicationStatuses),
});

export const updatePrioritySchema = z.object({
  id: z.string().uuid(),
  priority: z.enum(applicationPriorities),
});

export const assignManagerSchema = z.object({
  id: z.string().uuid(),
  assigned_manager: z
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

export const applicationsListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  status: z
    .union([z.enum(applicationStatuses), z.literal("")])
    .optional()
    .default(""),
  priority: z
    .union([z.enum(applicationPriorities), z.literal("")])
    .optional()
    .default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export type ApplicationsListFilters = z.infer<
  typeof applicationsListFiltersSchema
>;
