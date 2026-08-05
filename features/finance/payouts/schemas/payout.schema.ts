import { z } from "zod";
import { Constants } from "@/types/database.types";

export const payoutStatuses = Constants.public.Enums.payout_status;
export const payoutMethods = Constants.public.Enums.payout_method;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

export const payoutListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  status: z
    .union([z.enum(payoutStatuses), z.literal("")])
    .optional()
    .default(""),
  creator: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export const createPayoutRequestSchema = z.object({
  creator_id: z.string().uuid(),
  amount: z.coerce.number().positive().max(1_000_000_000),
  currency: z.string().trim().min(1).max(8).default("USD"),
  method: z.enum(payoutMethods).default("bank"),
  period_start: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: optionalText(10000),
});

export const approvePayoutSchema = z.object({
  id: z.string().uuid(),
  notes: optionalText(10000),
});

export const rejectPayoutSchema = z.object({
  id: z.string().uuid(),
  rejection_reason: z.string().trim().min(1).max(2000),
});

export const payPayoutSchema = z.object({
  id: z.string().uuid(),
  receipt_number: optionalText(120),
});

export type PayoutListFilters = z.infer<typeof payoutListFiltersSchema>;
export type CreatePayoutRequestInput = z.infer<typeof createPayoutRequestSchema>;
