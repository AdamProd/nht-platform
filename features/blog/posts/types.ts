import type { JSONContent } from "@tiptap/core";
import type { Tables } from "@/types/database.types";

export const blogStatuses = ["draft", "published", "archived"] as const;
export type BlogStatus = (typeof blogStatuses)[number];

export type BlogTranslation = Tables<"blog_post_translations">;

export type BlogAuthor = {
  id: string;
  full_name: string | null;
};

export type BlogPostListItem = Tables<"blog_posts"> & {
  translations: BlogTranslation[];
  author: BlogAuthor | null;
};

export type BlogPostDetail = BlogPostListItem;

export type BlogPostsListResult = {
  items: BlogPostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BlogActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export type TipTapDoc = JSONContent & { type: "doc" };

export const EMPTY_DOC: TipTapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
