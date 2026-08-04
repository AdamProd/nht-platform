import { z } from "zod";

export const APPLICATION_PLATFORMS = [
  "onlyfans",
  "fansly",
  "manyvids",
  "multiple",
  "emerging",
] as const;

export type ApplicationPlatform = (typeof APPLICATION_PLATFORMS)[number];

export const applicationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(255, "Email is too long"),
  platform: z.enum(APPLICATION_PLATFORMS, {
    error: "Select a platform",
  }),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message is too long"),
  locale: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .optional()
    .default("en"),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
