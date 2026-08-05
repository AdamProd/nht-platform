import { z } from "zod";
import { locales } from "@/i18n/routing";
import { blogStatuses } from "@/features/blog/posts/types";

const localeEnum = z.enum(locales);

export const tipTapDocSchema = z
  .object({
    type: z.literal("doc"),
  })
  .passthrough();

export const blogTranslationInputSchema = z.object({
  locale: localeEnum,
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(120),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: tipTapDocSchema,
  seo_title: z.string().trim().max(200).optional().nullable(),
  seo_description: z.string().trim().max(320).optional().nullable(),
});

export const blogPostInputSchema = z.object({
  status: z.enum(blogStatuses),
  cover_image_url: z
    .union([z.string().trim().url(), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
  translations: z.array(blogTranslationInputSchema).min(1),
});

export const createBlogPostSchema = blogPostInputSchema;

export const updateBlogPostSchema = blogPostInputSchema.extend({
  id: z.string().uuid(),
});

export const blogListFiltersSchema = z.object({
  q: z.string().trim().optional().default(""),
  status: z.enum(blogStatuses).optional(),
  locale: localeEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type BlogTranslationInput = z.infer<typeof blogTranslationInputSchema>;
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type BlogListFilters = z.infer<typeof blogListFiltersSchema>;
