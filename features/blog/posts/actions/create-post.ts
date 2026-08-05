"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { createBlogPostSchema } from "@/features/blog/posts/schemas/blog.schema";
import { ensureSlug } from "@/features/blog/posts/lib/slug";
import type { BlogActionResult } from "@/features/blog/posts/types";
import type { Json } from "@/types/database.types";

async function revalidateBlog(id?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/blog`);
  if (id) revalidatePath(`/${locale}/admin/blog/${id}`);
}

export async function createPost(
  raw: unknown,
): Promise<BlogActionResult> {
  const t = await getTranslations("admin.blog.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = createBlogPostSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const { status, cover_image_url, translations } = parsed.data;
    const supabase = await createClient();

    const published_at =
      status === "published" ? new Date().toISOString() : null;

    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .insert({
        status,
        cover_image_url: cover_image_url || null,
        author_id: session.profile.id,
        published_at,
      })
      .select("id")
      .single();

    if (postError || !post) {
      console.error("[createPost]", postError?.message);
      return { success: false, error: t("create") };
    }

    const rows = translations.map((row) => ({
      post_id: post.id,
      locale: row.locale,
      title: row.title,
      slug: ensureSlug(row.title, row.slug),
      excerpt: row.excerpt || null,
      content: row.content as Json,
      seo_title: row.seo_title || null,
      seo_description: row.seo_description || null,
    }));

    const { error: translationError } = await supabase
      .from("blog_post_translations")
      .insert(rows);

    if (translationError) {
      console.error("[createPost] translations:", translationError.message);
      await supabase.from("blog_posts").delete().eq("id", post.id);
      if (translationError.code === "23505") {
        return {
          success: false,
          error: t("slugConflict"),
        };
      }
      return { success: false, error: t("translations") };
    }

    await revalidateBlog(post.id);
    return { success: true, id: post.id };
  } catch (error) {
    console.error("[createPost] unexpected:", error);
    return { success: false, error: t("create") };
  }
}
