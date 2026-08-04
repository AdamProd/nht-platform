"use client";

import { useState, useTransition } from "react";
import {
  assignManager,
  updateNotes,
  updatePriority,
  updateStatus,
} from "@/features/applications/actions/update-application";
import {
  applicationPriorities,
  applicationStatuses,
} from "@/features/applications/schemas/crm.schema";
import type {
  ApplicationDetail,
  StaffManagerOption,
} from "@/features/applications/types";
import FlashToast from "@/features/applications/components/FlashToast";
import { formatDateTime } from "@/features/applications/lib/format";

type Labels = {
  fullName: string;
  email: string;
  platform: string;
  locale: string;
  message: string;
  status: string;
  priority: string;
  manager: string;
  notes: string;
  created: string;
  updated: string;
  lastContact: string;
  unassigned: string;
  save: string;
  saving: string;
  saved: string;
  back: string;
};

type ApplicationDetailPanelProps = {
  application: ApplicationDetail;
  managers: StaffManagerOption[];
  locale: string;
  labels: Labels;
};

export default function ApplicationDetailPanel({
  application,
  managers,
  locale,
  labels,
}: ApplicationDetailPanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    field: string,
    action: (formData: FormData) => Promise<{ success: boolean; error?: string }>,
    formData: FormData,
  ) {
    setError(null);
    setPendingField(field);
    startTransition(async () => {
      const result = await action(formData);
      setPendingField(null);
      if (!result.success) {
        setError(result.error ?? "Unable to save changes.");
        return;
      }
      setToast(labels.saved);
    });
  }

  return (
    <div className="space-y-6">
      <FlashToast message={toast} />

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-[var(--nht-text-secondary)]"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2">
        <Field label={labels.fullName} value={application.full_name} />
        <Field label={labels.email} value={application.email} />
        <Field label={labels.platform} value={application.platform ?? "—"} />
        <Field label={labels.locale} value={application.locale} />
        <div className="sm:col-span-2">
          <Field label={labels.message} value={application.message ?? "—"} />
        </div>
        <Field
          label={labels.created}
          value={formatDateTime(application.created_at, locale)}
        />
        <Field
          label={labels.updated}
          value={formatDateTime(application.updated_at, locale)}
        />
        <Field
          label={labels.lastContact}
          value={formatDateTime(application.last_contact_at, locale)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => runAction("status", updateStatus, formData)}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.status}
            </span>
            <select
              name="status"
              defaultValue={application.status}
              className="nht-input"
            >
              {applicationStatuses.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <SaveButton
            pending={isPending && pendingField === "status"}
            labels={labels}
          />
        </form>

        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => runAction("priority", updatePriority, formData)}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.priority}
            </span>
            <select
              name="priority"
              defaultValue={application.priority}
              className="nht-input"
            >
              {applicationPriorities.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <SaveButton
            pending={isPending && pendingField === "priority"}
            labels={labels}
          />
        </form>

        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => runAction("manager", assignManager, formData)}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.manager}
            </span>
            <select
              name="assigned_manager"
              defaultValue={application.assigned_manager ?? ""}
              className="nht-input"
            >
              <option value="">{labels.unassigned}</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name ?? manager.id.slice(0, 8)} ({manager.role})
                </option>
              ))}
            </select>
          </label>
          <SaveButton
            pending={isPending && pendingField === "manager"}
            labels={labels}
          />
        </form>
      </div>

      <form
        className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => runAction("notes", updateNotes, formData)}
      >
        <input type="hidden" name="id" value={application.id} />
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.notes}
          </span>
          <textarea
            name="notes"
            rows={6}
            defaultValue={application.notes ?? ""}
            className="nht-input resize-y"
          />
        </label>
        <SaveButton
          pending={isPending && pendingField === "notes"}
          labels={labels}
        />
      </form>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-white">{value}</p>
    </div>
  );
}

function SaveButton({
  pending,
  labels,
}: {
  pending: boolean;
  labels: Pick<Labels, "save" | "saving">;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? labels.saving : labels.save}
    </button>
  );
}
