"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { updateBlogPostSchema } from "@/features/blog/posts/schemas/blog.schema";
import { ensureSlug } from "@/features/blog/posts/lib/slug";
import type { BlogActionResult } from "@/features/blog/posts/types";
import type { Json } from "@/types/database.types";

async function revalidateBlog(id: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/blog`);
  revalidatePath(`/${locale}/admin/blog/${id}`);
}

export async function updatePost(
  raw: unknown,
): Promise<BlogActionResult> {
  const t = await getTranslations("admin.blog.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    const parsed = updateBlogPostSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: t("invalid") };
    }

    const { id, status, cover_image_url, translations } = parsed.data;
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("blog_posts")
      .select("id, status, published_at")
      .eq("id", id)
      .maybeSingle();

    if (existingError || !existing) {
      return { success: false, error: t("notFound") };
    }

    let published_at = existing.published_at;
    if (status === "published" && !published_at) {
      published_at = new Date().toISOString();
    }
    if (status !== "published" && existing.status === "published") {
      // keep published_at history when archiving/drafting
    }

    const { error: postError } = await supabase
      .from("blog_posts")
      .update({
        status,
        cover_image_url: cover_image_url || null,
        published_at,
      })
      .eq("id", id);

    if (postError) {
      console.error("[updatePost]", postError.message);
      return { success: false, error: t("update") };
    }

    const { data: currentTranslations } = await supabase
      .from("blog_post_translations")
      .select("id, locale")
      .eq("post_id", id);

    const incomingLocales = new Set<string>(
      translations.map((row) => row.locale),
    );
    const toDelete = (currentTranslations ?? [])
      .filter((row) => !incomingLocales.has(row.locale))
      .map((row) => row.id);

    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("blog_post_translations")
        .delete()
        .in("id", toDelete);
      if (deleteError) {
        console.error("[updatePost] delete translations:", deleteError.message);
        return { success: false, error: t("updateTranslations") };
      }
    }

    for (const row of translations) {
      const payload = {
        post_id: id,
        locale: row.locale,
        title: row.title,
        slug: ensureSlug(row.title, row.slug),
        excerpt: row.excerpt || null,
        content: row.content as Json,
        seo_title: row.seo_title || null,
        seo_description: row.seo_description || null,
      };

      const { error: upsertError } = await supabase
        .from("blog_post_translations")
        .upsert(payload, { onConflict: "post_id,locale" });

      if (upsertError) {
        console.error("[updatePost] upsert:", upsertError.message);
        if (upsertError.code === "23505") {
          return {
            success: false,
            error: t("slugConflict"),
          };
        }
        return { success: false, error: t("translations") };
      }
    }

    await revalidateBlog(id);
    return { success: true, id };
  } catch (error) {
    console.error("[updatePost] unexpected:", error);
    return { success: false, error: t("update") };
  }
}
