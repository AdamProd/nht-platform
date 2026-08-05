"use client";

import { useTransition } from "react";
import { startImpersonation } from "@/features/cabinet/actions/impersonation";

export default function ImpersonateCreatorButton({
  creatorId,
  label,
}: {
  creatorId: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await startImpersonation(creatorId);
        });
      }}
      className="rounded-full border border-[var(--nht-gold)]/40 px-4 py-2 text-xs font-medium text-[var(--nht-gold)] hover:bg-[var(--nht-gold-muted)] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
    >
      {label}
    </button>
  );
}
