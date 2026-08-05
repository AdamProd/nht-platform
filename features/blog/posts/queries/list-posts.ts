import { createClient } from "@/lib/supabase/server";
import {
  blogListFiltersSchema,
  type BlogListFilters,
} from "@/features/blog/posts/schemas/blog.schema";
import type {
  BlogPostListItem,
  BlogPostsListResult,
} from "@/features/blog/posts/types";

export const BLOG_PAGE_SIZE = 20;

const LIST_SELECT = `
  *,
  translations:blog_post_translations (*),
  author:profiles!blog_posts_author_id_fkey (
    id,
    full_name
  )
`;

export async function listPosts(
  raw: Partial<BlogListFilters> | Record<string, string | undefined>,
): Promise<BlogPostsListResult> {
  const filters = blogListFiltersSchema.parse({
    q: raw.q ?? "",
    status: raw.status || undefined,
    locale: raw.locale || undefined,
    page: raw.page ?? 1,
  });

  const page = filters.page;
  const from = (page - 1) * BLOG_PAGE_SIZE;
  const to = from + BLOG_PAGE_SIZE - 1;

  const supabase = await createClient();

  let postIds: string[] | null = null;

  if (filters.q || filters.locale) {
    let translationQuery = supabase
      .from("blog_post_translations")
      .select("post_id");

    if (filters.locale) {
      translationQuery = translationQuery.eq("locale", filters.locale);
    }

    if (filters.q) {
      const term = filters.q.replaceAll(",", " ").trim();
      translationQuery = translationQuery.or(
        `title.ilike.%${term}%,slug.ilike.%${term}%,excerpt.ilike.%${term}%`,
      );
    }

    const { data: matches, error: matchError } = await translationQuery;
    if (matchError) {
      console.error("[listPosts] translation filter:", matchError.message);
      throw new Error("Failed to load posts.");
    }

    postIds = [...new Set((matches ?? []).map((row) => row.post_id))];
    if (postIds.length === 0) {
      return {
        items: [],
        total: 0,
        page,
        pageSize: BLOG_PAGE_SIZE,
        totalPages: 1,
      };
    }
  }

  let query = supabase
    .from("blog_posts")
    .select(LIST_SELECT, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (postIds) {
    query = query.in("id", postIds);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[listPosts]", error.message);
    throw new Error("Failed to load posts.");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  return {
    items: (data ?? []) as BlogPostListItem[],
    total,
    page,
    pageSize: BLOG_PAGE_SIZE,
    totalPages,
  };
}
