import { z } from "zod";
import { Constants } from "@/types/database.types";
import { FINANCE_PLATFORMS } from "@/features/finance/types";

export const financeStatuses = Constants.public.Enums.finance_transaction_status;
export const financePaymentMethods =
  Constants.public.Enums.finance_payment_method;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => value || null);

function splitAmounts(gross: number, agencyPercent: number) {
  const agency = Math.round(((gross * agencyPercent) / 100) * 100) / 100;
  const creator = Math.round((gross - agency) * 100) / 100;
  return {
    agency_amount: agency,
    creator_amount: creator,
    creator_percent: Math.round((100 - agencyPercent) * 100) / 100,
  };
}

export { splitAmounts };

export const createTransactionSchema = z
  .object({
    creator_id: z.string().uuid(),
    manager_id: z
      .string()
      .uuid()
      .nullable()
      .or(z.literal("").transform(() => null))
      .optional()
      .default(null),
    platform: z.enum(FINANCE_PLATFORMS),
    transaction_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/),
    gross_revenue: z.coerce.number().min(0).max(1_000_000_000),
    currency: z.string().trim().min(1).max(8).default("USD"),
    agency_percent: z.coerce.number().min(0).max(100).default(20),
    status: z.enum(financeStatuses).default("pending"),
    payment_method: z
      .enum(financePaymentMethods)
      .nullable()
      .or(z.literal("").transform(() => null))
      .optional()
      .default(null),
    reference_id: optionalText(120),
    notes: optionalText(10000),
  })
  .transform((data) => {
    const amounts = splitAmounts(data.gross_revenue, data.agency_percent);
    return { ...data, ...amounts };
  });

export const updateTransactionSchema = z
  .object({
    id: z.string().uuid(),
    creator_id: z.string().uuid(),
    manager_id: z
      .string()
      .uuid()
      .nullable()
      .or(z.literal("").transform(() => null))
      .optional()
      .default(null),
    platform: z.enum(FINANCE_PLATFORMS),
    transaction_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/),
    gross_revenue: z.coerce.number().min(0).max(1_000_000_000),
    currency: z.string().trim().min(1).max(8).default("USD"),
    agency_percent: z.coerce.number().min(0).max(100),
    payment_method: z
      .enum(financePaymentMethods)
      .nullable()
      .or(z.literal("").transform(() => null))
      .optional()
      .default(null),
    reference_id: optionalText(120),
    notes: optionalText(10000),
  })
  .transform((data) => {
    const amounts = splitAmounts(data.gross_revenue, data.agency_percent);
    return { ...data, ...amounts };
  });

export const updateFinanceStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(financeStatuses),
});

export const updateFinanceNotesSchema = z.object({
  id: z.string().uuid(),
  notes: z
    .string()
    .max(10000)
    .transform((value) => value.trim() || null),
});

export const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});

export const financeListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
  status: z
    .union([z.enum(financeStatuses), z.literal("")])
    .optional()
    .default(""),
  platform: z
    .union([z.enum(FINANCE_PLATFORMS), z.literal("")])
    .optional()
    .default(""),
  creator: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
  manager: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .default(""),
  from: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$|^$/)
    .optional()
    .default(""),
  to: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$|^$/)
    .optional()
    .default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export type FinanceListFilters = z.infer<typeof financeListFiltersSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
