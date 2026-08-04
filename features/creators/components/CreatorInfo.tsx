import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { CreatorDetail } from "@/features/creators/types";
import {
  formatDateTime,
  formatList,
} from "@/features/creators/lib/format";

type CreatorInfoProps = {
  creator: CreatorDetail;
  locale: string;
  labels: {
    email: string;
    telegram: string;
    country: string;
    languages: string;
    platforms: string;
    manager: string;
    status: string;
    notes: string;
    application: string;
    created: string;
    updated: string;
    unassigned: string;
    noApplication: string;
    viewApplication: string;
  };
  statusLabel: string;
};

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <div className="mt-2 text-sm break-words text-white">{value}</div>
    </div>
  );
}

export default function CreatorInfo({
  creator,
  locale,
  labels,
  statusLabel,
}: CreatorInfoProps) {
  return (
    <div className="grid gap-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2">
      <Field label={labels.email} value={creator.email} />
      <Field label={labels.telegram} value={creator.telegram ?? "—"} />
      <Field label={labels.country} value={creator.country ?? "—"} />
      <Field label={labels.languages} value={formatList(creator.languages)} />
      <Field label={labels.platforms} value={formatList(creator.platforms)} />
      <Field
        label={labels.manager}
        value={creator.manager?.full_name ?? labels.unassigned}
      />
      <Field label={labels.status} value={statusLabel} />
      <Field
        label={labels.application}
        value={
          creator.application_id ? (
            <Link
              href={`/admin/applications/${creator.application_id}`}
              className="text-[var(--nht-gold)] hover:text-white"
            >
              {labels.viewApplication}
            </Link>
          ) : (
            labels.noApplication
          )
        }
      />
      <div className="sm:col-span-2">
        <Field label={labels.notes} value={creator.notes ?? "—"} />
      </div>
      <Field
        label={labels.created}
        value={formatDateTime(creator.created_at, locale)}
      />
      <Field
        label={labels.updated}
        value={formatDateTime(creator.updated_at, locale)}
      />
    </div>
  );
}
