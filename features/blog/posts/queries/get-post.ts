import { createClient } from "@/lib/supabase/server";
import type { BlogPostDetail } from "@/features/blog/posts/types";

const DETAIL_SELECT = `
  *,
  translations:blog_post_translations (*),
  author:profiles!blog_posts_author_id_fkey (
    id,
    full_name
  )
`;

export async function getPost(id: string): Promise<BlogPostDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[getPost]", error.message);
    throw new Error("Failed to load post.");
  }

  return (data as BlogPostDetail | null) ?? null;
}
