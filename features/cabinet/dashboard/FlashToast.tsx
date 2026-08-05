"use client";

import { useState, useTransition } from "react";
import { FlashToast } from "@/shared/ui/Toast";

export { FlashToast };

export function useActionToast() {
  const [toast, setToast] = useState<string | null>(null);
  const [tone, setTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    errorFallback: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setTone("error");
        setToast(result.error ?? errorFallback);
        return;
      }
      setTone("success");
      setToast(successMessage);
    });
  }

  return { toast, tone, isPending, run, setToast };
}
