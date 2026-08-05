"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireStaffSession } from "@/lib/auth";
import { isOwner } from "@/lib/auth/roles";
import type { BlogActionResult } from "@/features/blog/posts/types";
import { z } from "zod";

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function deletePost(
  formData: FormData,
): Promise<BlogActionResult> {
  const t = await getTranslations("admin.blog.actionErrors");

  try {
    const session = await requireStaffSession();
    if (!session) {
      return { success: false, error: t("unauthorized") };
    }

    if (!isOwner(session.profile.role) && session.profile.role !== "admin") {
      return {
        success: false,
        error: t("adminOnly"),
      };
    }

    const parsed = deleteSchema.safeParse({ id: formData.get("id") });
    if (!parsed.success) {
      return { success: false, error: t("invalidId") };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", parsed.data.id);

    if (error) {
      console.error("[deletePost]", error.message);
      return { success: false, error: t("delete") };
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/admin/blog`);
    return { success: true };
  } catch (error) {
    console.error("[deletePost] unexpected:", error);
    return { success: false, error: t("delete") };
  }
}
