import { Link } from "@/i18n/navigation";
import type { CreatorListItem } from "@/features/creators/types";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import { formatList, initials } from "@/features/creators/lib/format";

type CreatorCardProps = {
  creator: CreatorListItem;
  statusLabel: string;
  unassigned: string;
};

export default function CreatorCard({
  creator,
  statusLabel,
  unassigned,
}: CreatorCardProps) {
  return (
    <Link
      href={`/admin/creators/${creator.id}`}
      className="flex gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.04]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-medium text-[var(--nht-gold)]">
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
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-white">
            {creator.full_name}
          </p>
          <CreatorStatusBadge status={creator.status} label={statusLabel} />
        </div>
        <p className="mt-1 truncate text-xs text-[var(--nht-text-secondary)]">
          {creator.email}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--nht-text-tertiary)]">
          {formatList(creator.platforms)} ·{" "}
          {creator.manager?.full_name ?? unassigned}
        </p>
      </div>
    </Link>
  );
}
