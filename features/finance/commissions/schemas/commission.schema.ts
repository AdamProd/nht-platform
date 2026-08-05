import { z } from "zod";

const percent = z.coerce.number().min(0).max(100);

export const updateCommissionSettingsSchema = z.object({
  agency_percent: percent,
  manager_percent: percent.default(0),
  referral_percent: percent.default(0),
  bonus_percent: percent.default(0),
  note: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export type UpdateCommissionSettingsInput = z.infer<
  typeof updateCommissionSettingsSchema
>;
