import type { CreatorStatus } from "@/features/creators/types";

type CreatorStatusBadgeProps = {
  status: CreatorStatus;
  label: string;
};

export default function CreatorStatusBadge({
  status,
  label,
}: CreatorStatusBadgeProps) {
  return (
    <span
      data-status={status}
      className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-[var(--nht-gold)]"
    >
      {label}
    </span>
  );
}
