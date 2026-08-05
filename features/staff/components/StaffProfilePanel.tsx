"use client";

import {
  useOptimistic,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { Link } from "@/i18n/navigation";
import {
  assignApplicationToStaff,
  assignCreatorToStaff,
  deleteStaff,
  transferOwnership,
  unassignCreatorFromStaff,
  updateStaffProfile,
  updateStaffRole,
  updateStaffStatus,
} from "@/features/staff/actions/staff";
import {
  ASSIGNABLE_STAFF_ROLES,
  STAFF_DEPARTMENTS,
  STAFF_STATUSES,
  type StaffDetail,
} from "@/features/staff/types";
import {
  formatStaffDate,
  formatStaffDateTime,
  staffDisplayName,
  staffInitials,
} from "@/features/staff/lib/format";
import FlashToast from "@/features/creators/components/FlashToast";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import type { ActivityLogRow } from "@/features/core/events/types";

type Props = {
  staff: StaffDetail;
  activity: ActivityLogRow[];
  locale: string;
  canEdit: boolean;
  isOwnerActor: boolean;
  canDelete: boolean;
  neverLabel: string;
  unassignedCreators: Array<{ id: string; display_name: string | null }>;
  unassignedApplications: Array<{ id: string; full_name: string }>;
  labels: {
    back: string;
    save: string;
    saving: string;
    saved: string;
    confirmDelete: string;
    confirmTransfer: string;
    cancel: string;
    delete: string;
    transferOwnership: string;
    sections: {
      profile: string;
      assignments: string;
      activity: string;
      danger: string;
    };
    fields: Record<string, string>;
    emptyAssignments: string;
    emptyActivity: string;
    unassign: string;
    assignCreator: string;
    assignApplication: string;
    expandPayload: string;
    collapsePayload: string;
  };
  roleLabels: Record<string, string>;
  departmentLabels: Record<string, string>;
  statusLabels: Record<string, string>;
};

export default function StaffProfilePanel({
  staff,
  activity,
  locale,
  canEdit,
  isOwnerActor,
  canDelete,
  neverLabel,
  unassignedCreators,
  unassignedApplications,
  labels,
  roleLabels,
  departmentLabels,
  statusLabels,
}: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(staff);
  const [payloadOpen, setPayloadOpen] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    null | "delete" | "transfer"
  >(null);

  const name = staffDisplayName(optimistic);

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      id: staff.id,
      full_name: form.get("full_name"),
      phone: form.get("phone") || null,
      department: form.get("department") || null,
      department_custom: form.get("department_custom") || null,
      timezone: form.get("timezone") || null,
      locale: form.get("locale") || null,
      biography: form.get("biography") || null,
      notes: form.get("notes") || null,
      avatar_url: form.get("avatar_url") || null,
    };

    startTransition(async () => {
      setOptimistic({
        ...optimistic,
        full_name: String(payload.full_name),
        phone: payload.phone ? String(payload.phone) : null,
        biography: payload.biography ? String(payload.biography) : null,
        notes: payload.notes ? String(payload.notes) : null,
        avatar_url: payload.avatar_url ? String(payload.avatar_url) : null,
      });
      const result = await updateStaffProfile(payload);
      if (!result.success) {
        setToastTone("error");
        setToast(result.error);
        return;
      }
      setToastTone("success");
      setToast(labels.saved);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-[var(--nht-gold)]">
            {optimistic.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={optimistic.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              staffInitials(name)
            )}
          </div>
          <div>
            <p className="text-overline text-[var(--nht-gold)]">
              {roleLabels[optimistic.role] ?? optimistic.role}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {name}
            </h1>
            <p className="mt-1 text-sm text-[var(--nht-text-secondary)]">
              {optimistic.email || "—"}
            </p>
          </div>
        </div>
        <Link
          href="/admin/staff"
          className="text-sm text-[var(--nht-gold)] hover:text-white"
        >
          {labels.back}
        </Link>
      </div>

      <form
        onSubmit={saveProfile}
        className="grid gap-6 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 lg:grid-cols-2"
      >
        <h2 className="lg:col-span-2 text-sm font-medium text-white">
          {labels.sections.profile}
        </h2>
        <Field
          label={labels.fields.fullName}
          name="full_name"
          defaultValue={optimistic.full_name ?? ""}
          disabled={!canEdit}
        />
        <Field
          label={labels.fields.avatarUrl}
          name="avatar_url"
          defaultValue={optimistic.avatar_url ?? ""}
          disabled={!canEdit}
        />
        <Field
          label={labels.fields.email}
          name="email"
          defaultValue={optimistic.email ?? ""}
          disabled
        />
        <Field
          label={labels.fields.phone}
          name="phone"
          defaultValue={optimistic.phone ?? ""}
          disabled={!canEdit}
        />
        <label className="block text-xs text-[var(--nht-text-tertiary)]">
          {labels.fields.department}
          <select
            name="department"
            defaultValue={optimistic.department ?? ""}
            disabled={!canEdit}
            className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            <option value="">—</option>
            {STAFF_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {departmentLabels[dept] ?? dept}
              </option>
            ))}
          </select>
        </label>
        <Field
          label={labels.fields.departmentCustom}
          name="department_custom"
          defaultValue={optimistic.department_custom ?? ""}
          disabled={!canEdit}
        />
        <Field
          label={labels.fields.timezone}
          name="timezone"
          defaultValue={optimistic.timezone ?? ""}
          disabled={!canEdit}
        />
        <Field
          label={labels.fields.language}
          name="locale"
          defaultValue={optimistic.locale ?? "en"}
          disabled={!canEdit}
        />
        <Field
          label={labels.fields.created}
          name="created"
          defaultValue={formatStaffDateTime(optimistic.created_at, locale)}
          disabled
        />
        <Field
          label={labels.fields.updated}
          name="updated"
          defaultValue={formatStaffDateTime(optimistic.updated_at, locale)}
          disabled
        />
        <Field
          label={labels.fields.lastLogin}
          name="last_login"
          defaultValue={formatStaffDateTime(
            optimistic.last_login_at,
            locale,
            neverLabel,
          )}
          disabled
        />
        <label className="lg:col-span-2 block text-xs text-[var(--nht-text-tertiary)]">
          {labels.fields.biography}
          <textarea
            name="biography"
            rows={3}
            defaultValue={optimistic.biography ?? ""}
            disabled={!canEdit}
            className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-60"
          />
        </label>
        <label className="lg:col-span-2 block text-xs text-[var(--nht-text-tertiary)]">
          {labels.fields.notes}
          <textarea
            name="notes"
            rows={3}
            defaultValue={optimistic.notes ?? ""}
            disabled={!canEdit}
            className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-60"
          />
        </label>
        {canEdit ? (
          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-[var(--nht-gold)]/40 bg-[var(--nht-gold-muted)] px-4 py-2 text-xs text-[var(--nht-gold)] disabled:opacity-60"
            >
              {isPending ? labels.saving : labels.save}
            </button>
            <label className="flex items-center gap-2 text-xs text-[var(--nht-text-tertiary)]">
              {labels.fields.role}
              <select
                defaultValue={optimistic.role}
                disabled={isPending}
                onChange={(event) => {
                  const body = new FormData();
                  body.set("id", staff.id);
                  body.set("role", event.target.value);
                  startTransition(async () => {
                    const result = await updateStaffRole(body);
                    setToastTone(result.success ? "success" : "error");
                    setToast(result.success ? labels.saved : result.error);
                  });
                }}
                className="rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {(isOwnerActor
                  ? ["owner", ...ASSIGNABLE_STAFF_ROLES]
                  : ASSIGNABLE_STAFF_ROLES
                ).map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role] ?? role}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-[var(--nht-text-tertiary)]">
              {labels.fields.status}
              <select
                defaultValue={optimistic.status ?? "active"}
                disabled={isPending}
                onChange={(event) => {
                  const body = new FormData();
                  body.set("id", staff.id);
                  body.set("status", event.target.value);
                  startTransition(async () => {
                    const result = await updateStaffStatus(body);
                    setToastTone(result.success ? "success" : "error");
                    setToast(result.success ? labels.saved : result.error);
                  });
                }}
                className="rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {STAFF_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status] ?? status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </form>

      <section className="space-y-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.assignments}
        </h2>
        <AssignmentList
          title={labels.fields.managedCreators}
          empty={labels.emptyAssignments}
          items={optimistic.managedCreators.map((item) => ({
            id: item.id,
            label: item.display_name || item.id,
            href: `/admin/creators/${item.id}`,
          }))}
          canEdit={canEdit}
          unassignLabel={labels.unassign}
          onUnassign={(creatorId) => {
            const body = new FormData();
            body.set("staff_id", staff.id);
            body.set("creator_id", creatorId);
            startTransition(async () => {
              const result = await unassignCreatorFromStaff(body);
              setToastTone(result.success ? "success" : "error");
              setToast(result.success ? labels.saved : result.error);
            });
          }}
        />
        {canEdit && unassignedCreators.length > 0 ? (
          <form
            className="flex flex-wrap items-end gap-2"
            action={(formData) => {
              formData.set("staff_id", staff.id);
              startTransition(async () => {
                const result = await assignCreatorToStaff(formData);
                setToastTone(result.success ? "success" : "error");
                setToast(result.success ? labels.saved : result.error);
              });
            }}
          >
            <label className="text-xs text-[var(--nht-text-tertiary)]">
              {labels.assignCreator}
              <select
                name="creator_id"
                className="mt-1.5 block rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {unassignedCreators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.display_name || creator.id}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-white"
            >
              {labels.assignCreator}
            </button>
          </form>
        ) : null}

        <AssignmentList
          title={labels.fields.assignedApplications}
          empty={labels.emptyAssignments}
          items={optimistic.assignedApplications.map((item) => ({
            id: item.id,
            label: `${item.full_name} · ${item.status}`,
            href: `/admin/applications/${item.id}`,
          }))}
        />
        {canEdit && unassignedApplications.length > 0 ? (
          <form
            className="flex flex-wrap items-end gap-2"
            action={(formData) => {
              formData.set("staff_id", staff.id);
              startTransition(async () => {
                const result = await assignApplicationToStaff(formData);
                setToastTone(result.success ? "success" : "error");
                setToast(result.success ? labels.saved : result.error);
              });
            }}
          >
            <label className="text-xs text-[var(--nht-text-tertiary)]">
              {labels.assignApplication}
              <select
                name="application_id"
                className="mt-1.5 block rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {unassignedApplications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.full_name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="rounded-full border border-white/10 px-3 py-2 text-xs text-white"
            >
              {labels.assignApplication}
            </button>
          </form>
        ) : null}

        <AssignmentList
          title={labels.fields.assignedTasks}
          empty={labels.emptyAssignments}
          items={optimistic.assignedTasks.map((item) => ({
            id: item.id,
            label: `${item.title} · ${item.status}`,
            href: `/admin/tasks/${item.id}`,
          }))}
        />
      </section>

      <section className="space-y-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.activity}
        </h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[var(--nht-text-secondary)]">
            {labels.emptyActivity}
          </p>
        ) : (
          <ul className="space-y-3">
            {activity.map((item) => (
              <li
                key={item.id}
                className="rounded-[var(--nht-radius-lg)] border border-white/[0.04] px-3 py-3"
              >
                <p className="text-sm text-white">{item.description}</p>
                <p className="mt-1 text-xs text-[var(--nht-text-tertiary)]">
                  {formatStaffDate(item.created_at, locale)} · {item.event_type}
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs text-[var(--nht-gold)]"
                  onClick={() =>
                    setPayloadOpen((value) =>
                      value === item.id ? null : item.id,
                    )
                  }
                >
                  {payloadOpen === item.id
                    ? labels.collapsePayload
                    : labels.expandPayload}
                </button>
                {payloadOpen === item.id ? (
                  <pre className="mt-2 overflow-x-auto text-[11px] text-[var(--nht-text-secondary)]">
                    {JSON.stringify(item.payload ?? {}, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {canEdit && (canDelete || isOwnerActor) ? (
        <section className="space-y-3 rounded-[var(--nht-radius-xl)] border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-sm font-medium text-red-200">
            {labels.sections.danger}
          </h2>
          {isOwnerActor && staff.role !== "owner" ? (
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-white"
              onClick={() => setConfirmAction("transfer")}
            >
              {labels.transferOwnership}
            </button>
          ) : null}
          {canDelete && staff.role !== "owner" ? (
            <button
              type="button"
              className="rounded-full border border-red-400/40 px-4 py-2 text-xs text-red-200"
              onClick={() => setConfirmAction("delete")}
            >
              {labels.delete}
            </button>
          ) : null}
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction === "transfer"
            ? labels.transferOwnership
            : labels.delete
        }
        description={
          confirmAction === "transfer"
            ? labels.confirmTransfer
            : labels.confirmDelete
        }
        confirmLabel={
          confirmAction === "transfer"
            ? labels.transferOwnership
            : labels.delete
        }
        cancelLabel={labels.cancel}
        tone={confirmAction === "delete" ? "danger" : "default"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          const action = confirmAction;
          setConfirmAction(null);
          if (!action) return;
          const body = new FormData();
          body.set("id", staff.id);
          startTransition(async () => {
            const result =
              action === "transfer"
                ? await transferOwnership(body)
                : await deleteStaff(body);
            setToastTone(result.success ? "success" : "error");
            setToast(result.success ? labels.saved : result.error);
          });
        }}
      />

      <FlashToast message={toast} tone={toastTone} />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled?: boolean;
}) {
  return (
    <label className="block text-xs text-[var(--nht-text-tertiary)]">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className="mt-1.5 w-full rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white disabled:opacity-60"
      />
    </label>
  );
}

function AssignmentList({
  title,
  empty,
  items,
  canEdit,
  unassignLabel,
  onUnassign,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; label: string; href: string }>;
  canEdit?: boolean;
  unassignLabel?: string;
  onUnassign?: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-[var(--nht-text-tertiary)]">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <Link
                href={item.href}
                className="text-[var(--nht-gold)] hover:text-white"
              >
                {item.label}
              </Link>
              {canEdit && onUnassign && unassignLabel ? (
                <button
                  type="button"
                  onClick={() => onUnassign(item.id)}
                  className="text-xs text-[var(--nht-text-tertiary)] hover:text-white"
                >
                  {unassignLabel}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
