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
  ApplicationPriority,
  ApplicationStatus,
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
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [priority, setPriority] = useState<ApplicationPriority>(
    application.priority,
  );
  const [managerId, setManagerId] = useState(application.assigned_manager ?? "");
  const [notes, setNotes] = useState(application.notes ?? "");

  function runAction(
    field: string,
    action: (formData: FormData) => Promise<{ success: boolean; error?: string }>,
    formData: FormData,
    rollback?: () => void,
  ) {
    setError(null);
    setPendingField(field);
    startTransition(async () => {
      try {
        const result = await action(formData);
        setPendingField(null);
        if (!result.success) {
          rollback?.();
          const message = result.error ?? "Unable to save changes.";
          setError(message);
          setToastTone("error");
          setToast(message);
          return;
        }
        setToastTone("success");
        setToast(labels.saved);
      } catch (err) {
        console.error("[ApplicationDetailPanel]", err);
        rollback?.();
        setPendingField(null);
        const message = "Unable to save changes.";
        setError(message);
        setToastTone("error");
        setToast(message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <FlashToast message={toast} tone={toastTone} />

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
          action={(formData) => {
            const previous = status;
            const next = formData.get("status") as ApplicationStatus;
            setStatus(next);
            runAction("status", updateStatus, formData, () => setStatus(previous));
          }}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.status}
            </span>
            <select
              name="status"
              value={status}
              disabled={isPending && pendingField === "status"}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="nht-input disabled:opacity-60"
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
          action={(formData) => {
            const previous = priority;
            const next = formData.get("priority") as ApplicationPriority;
            setPriority(next);
            runAction("priority", updatePriority, formData, () =>
              setPriority(previous),
            );
          }}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.priority}
            </span>
            <select
              name="priority"
              value={priority}
              disabled={isPending && pendingField === "priority"}
              onChange={(e) =>
                setPriority(e.target.value as ApplicationPriority)
              }
              className="nht-input disabled:opacity-60"
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
          action={(formData) => {
            const previous = managerId;
            const next = String(formData.get("assigned_manager") ?? "");
            setManagerId(next);
            runAction("manager", assignManager, formData, () =>
              setManagerId(previous),
            );
          }}
        >
          <input type="hidden" name="id" value={application.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.manager}
            </span>
            <select
              name="assigned_manager"
              value={managerId}
              disabled={isPending && pendingField === "manager"}
              onChange={(e) => setManagerId(e.target.value)}
              className="nht-input disabled:opacity-60"
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
        action={(formData) => {
          const previous = notes;
          const next = String(formData.get("notes") ?? "");
          setNotes(next);
          runAction("notes", updateNotes, formData, () => setNotes(previous));
        }}
      >
        <input type="hidden" name="id" value={application.id} />
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.notes}
          </span>
          <textarea
            name="notes"
            rows={6}
            value={notes}
            disabled={isPending && pendingField === "notes"}
            onChange={(e) => setNotes(e.target.value)}
            className="nht-input resize-y disabled:opacity-60"
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
      <p className="mt-2 whitespace-pre-wrap text-sm break-words text-white">
        {value}
      </p>
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
      aria-busy={pending}
      className="mt-4 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? labels.saving : labels.save}
    </button>
  );
}
