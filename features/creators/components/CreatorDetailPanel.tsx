"use client";

import { useState, useTransition } from "react";
import {
  assignManager,
  updateNotes,
  updateStatus,
  uploadAvatar,
} from "@/features/creators/actions/update-creator";
import { creatorStatuses } from "@/features/creators/schemas/creator.schema";
import type {
  CreatorDetail,
  CreatorStatus,
} from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";

type Labels = {
  status: string;
  manager: string;
  notes: string;
  avatarUrl: string;
  unassigned: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
  uploadAvatar: string;
};

type CreatorDetailPanelProps = {
  creator: CreatorDetail;
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  labels: Labels;
  statusLabels: Record<string, string>;
};

export default function CreatorDetailPanel({
  creator,
  managers,
  canAssignManager,
  labels,
  statusLabels,
}: CreatorDetailPanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<CreatorStatus>(creator.status);
  const [managerId, setManagerId] = useState(creator.manager_id ?? "");
  const [notes, setNotes] = useState(creator.notes ?? "");
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url ?? "");

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
          const message = result.error ?? labels.saveError;
          setError(message);
          setToastTone("error");
          setToast(message);
          return;
        }
        setToastTone("success");
        setToast(labels.saved);
      } catch (err) {
        console.error("[CreatorDetailPanel]", err);
        rollback?.();
        setPendingField(null);
        setError(labels.saveError);
        setToastTone("error");
        setToast(labels.saveError);
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

      <div className="grid gap-4 lg:grid-cols-3">
        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => {
            const previous = status;
            const next = formData.get("status") as CreatorStatus;
            setStatus(next);
            runAction("status", updateStatus, formData, () => setStatus(previous));
          }}
        >
          <input type="hidden" name="id" value={creator.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.status}
            </span>
            <select
              name="status"
              value={status}
              disabled={isPending && pendingField === "status"}
              onChange={(e) => setStatus(e.target.value as CreatorStatus)}
              className="nht-input disabled:opacity-60"
            >
              {creatorStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value] ?? value}
                </option>
              ))}
            </select>
          </label>
          <SaveButton
            pending={isPending && pendingField === "status"}
            labels={labels}
          />
        </form>

        {canAssignManager ? (
          <form
            className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
            action={(formData) => {
              const previous = managerId;
              const next = String(formData.get("manager_id") ?? "");
              setManagerId(next);
              runAction("manager", assignManager, formData, () =>
                setManagerId(previous),
              );
            }}
          >
            <input type="hidden" name="id" value={creator.id} />
            <label className="block">
              <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
                {labels.manager}
              </span>
              <select
                name="manager_id"
                value={managerId}
                disabled={isPending && pendingField === "manager"}
                onChange={(e) => setManagerId(e.target.value)}
                className="nht-input disabled:opacity-60"
              >
                <option value="">{labels.unassigned}</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name ?? manager.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
            <SaveButton
              pending={isPending && pendingField === "manager"}
              labels={labels}
            />
          </form>
        ) : null}

        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => {
            runAction("avatar", uploadAvatar, formData);
          }}
        >
          <input type="hidden" name="id" value={creator.id} />
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.avatarUrl}
            </span>
            <input
              name="avatar_url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={isPending && pendingField === "avatar"}
              className="nht-input disabled:opacity-60"
              placeholder="https://"
            />
          </label>
          <SaveButton
            pending={isPending && pendingField === "avatar"}
            labels={{ ...labels, save: labels.uploadAvatar }}
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
        <input type="hidden" name="id" value={creator.id} />
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
