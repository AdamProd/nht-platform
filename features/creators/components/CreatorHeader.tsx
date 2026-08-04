import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import type { CreatorDetail } from "@/features/creators/types";
import { initials } from "@/features/creators/lib/format";

type CreatorHeaderProps = {
  creator: CreatorDetail;
  statusLabel: string;
};

export default function CreatorHeader({
  creator,
  statusLabel,
}: CreatorHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-[var(--nht-gold)]">
        {creator.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.avatar_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials(creator.full_name)
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {creator.full_name}
          </h1>
          <CreatorStatusBadge status={creator.status} label={statusLabel} />
        </div>
        <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
          {creator.email}
        </p>
      </div>
    </div>
  );
}
