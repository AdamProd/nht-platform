"use client";

import { type ReactNode, useOptimistic, useState, useTransition } from "react";
import {
  updateManager,
  updateNotes,
  updatePlatforms,
  updateProfile,
  updateStatus,
} from "@/features/creators/actions/update-creator";
import { creatorStatuses } from "@/features/creators/schemas/creator.schema";
import type {
  CreatorDetail,
  CreatorStatus,
} from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";
import {
  displayName,
  formatDate,
  formatDateTime,
  formatList,
  formatMoney,
  initials,
} from "@/features/creators/lib/format";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import { Link } from "@/i18n/navigation";

type Labels = {
  sections: {
    profile: string;
    contacts: string;
    platforms: string;
    revenue: string;
    manager: string;
    status: string;
    notes: string;
    timeline: string;
  };
  fields: {
    displayName: string;
    legalName: string;
    birthday: string;
    country: string;
    languages: string;
    languagesPlaceholder: string;
    timezone: string;
    email: string;
    telegram: string;
    phone: string;
    avatarUrl: string;
    onlyfans: string;
    fansly: string;
    chaturbate: string;
    instagram: string;
    tiktok: string;
    twitter: string;
    revenueCurrent: string;
    revenuePrevious: string;
    revenueLifetime: string;
    manager: string;
    status: string;
    notes: string;
    created: string;
    updated: string;
    lastLogin: string;
    lastActivity: string;
    application: string;
  };
  unassigned: string;
  noApplication: string;
  viewApplication: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
};

type CreatorProfilePanelProps = {
  creator: CreatorDetail;
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  locale: string;
  labels: Labels;
  statusLabels: Record<string, string>;
};

export default function CreatorProfilePanel({
  creator,
  managers,
  canAssignManager,
  locale,
  labels,
  statusLabels,
}: CreatorProfilePanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    creator.status,
    (_current: CreatorStatus, next: CreatorStatus) => next,
  );

  function run(
    field: string,
    action: () => Promise<{ success: boolean; error?: string }>,
  ) {
    setError(null);
    setPendingField(field);
    startTransition(async () => {
      try {
        const result = await action();
        setPendingField(null);
        if (!result.success) {
          const message = result.error ?? labels.saveError;
          setError(message);
          setToastTone("error");
          setToast(message);
          return;
        }
        setToastTone("success");
        setToast(labels.saved);
      } catch (err) {
        console.error("[CreatorProfilePanel]", err);
        setPendingField(null);
        setError(labels.saveError);
        setToastTone("error");
        setToast(labels.saveError);
      }
    });
  }

  const name = displayName(creator);

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
            initials(name)
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {name}
            </h1>
            <CreatorStatusBadge
              status={optimisticStatus}
              label={statusLabels[optimisticStatus] ?? optimisticStatus}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--nht-text-secondary)]">
            {creator.email}
          </p>
        </div>
      </div>

      <Section title={labels.sections.profile}>
        <form
          className="space-y-6"
          action={(formData) => {
            run("profile", () =>
              updateProfile({
                id: creator.id,
                display_name: formData.get("display_name"),
                legal_name: formData.get("legal_name"),
                birthday: formData.get("birthday"),
                country: formData.get("country"),
                languages: String(formData.get("languages") ?? ""),
                timezone: formData.get("timezone"),
                email: formData.get("email"),
                telegram: formData.get("telegram"),
                phone: formData.get("phone"),
                avatar_url: formData.get("avatar_url"),
              }),
            );
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.fields.displayName}>
              <input
                name="display_name"
                defaultValue={creator.display_name || creator.full_name}
                required
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.legalName}>
              <input
                name="legal_name"
                defaultValue={creator.legal_name ?? ""}
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.birthday}>
              <input
                name="birthday"
                type="date"
                defaultValue={creator.birthday ?? ""}
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.country}>
              <input
                name="country"
                defaultValue={creator.country ?? ""}
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.languages}>
              <input
                name="languages"
                defaultValue={(creator.languages ?? []).join(", ")}
                placeholder={labels.fields.languagesPlaceholder}
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.timezone}>
              <input
                name="timezone"
                defaultValue={creator.timezone ?? ""}
                className="nht-input"
              />
            </Field>
            <Field label={labels.fields.avatarUrl}>
              <input
                name="avatar_url"
                defaultValue={creator.avatar_url ?? ""}
                className="nht-input"
                placeholder="https://"
              />
            </Field>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white">
              {labels.sections.contacts}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={labels.fields.email}>
                <input
                  name="email"
                  type="email"
                  defaultValue={creator.email}
                  required
                  className="nht-input"
                />
              </Field>
              <Field label={labels.fields.telegram}>
                <input
                  name="telegram"
                  defaultValue={creator.telegram ?? ""}
                  className="nht-input"
                />
              </Field>
              <Field label={labels.fields.phone}>
                <input
                  name="phone"
                  defaultValue={creator.phone ?? ""}
                  className="nht-input"
                />
              </Field>
            </div>
          </div>

          <SaveButton
            pending={isPending && pendingField === "profile"}
            labels={labels}
          />
        </form>
      </Section>

      <Section title={labels.sections.platforms}>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={(formData) => {
            run("platforms", () =>
              updatePlatforms({
                id: creator.id,
                onlyfans_url: formData.get("onlyfans_url"),
                fansly_url: formData.get("fansly_url"),
                chaturbate_url: formData.get("chaturbate_url"),
                instagram_url: formData.get("instagram_url"),
                tiktok_url: formData.get("tiktok_url"),
                twitter_url: formData.get("twitter_url"),
              }),
            );
          }}
        >
          {(
            [
              ["onlyfans_url", labels.fields.onlyfans],
              ["fansly_url", labels.fields.fansly],
              ["chaturbate_url", labels.fields.chaturbate],
              ["instagram_url", labels.fields.instagram],
              ["tiktok_url", labels.fields.tiktok],
              ["twitter_url", labels.fields.twitter],
            ] as const
          ).map(([name, label]) => (
            <Field key={name} label={label}>
              <input
                name={name}
                defaultValue={(creator[name] as string | null) ?? ""}
                className="nht-input"
                placeholder="https://"
              />
            </Field>
          ))}
          <div className="sm:col-span-2">
            <SaveButton
              pending={isPending && pendingField === "platforms"}
              labels={labels}
            />
          </div>
        </form>
      </Section>

      <Section title={labels.sections.revenue}>
        <div className="grid gap-4 sm:grid-cols-3">
          <ReadonlyField
            label={labels.fields.revenueCurrent}
            value={formatMoney(creator.revenue_current_month, locale)}
          />
          <ReadonlyField
            label={labels.fields.revenuePrevious}
            value={formatMoney(creator.revenue_previous_month, locale)}
          />
          <ReadonlyField
            label={labels.fields.revenueLifetime}
            value={formatMoney(creator.revenue_lifetime, locale)}
          />
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={labels.sections.status}>
          <form
            action={(formData) => {
              const next = formData.get("status") as CreatorStatus;
              startTransition(() => {
                setOptimisticStatus(next);
              });
              run("status", () => updateStatus(formData));
            }}
          >
            <input type="hidden" name="id" value={creator.id} />
            <Field label={labels.fields.status}>
              <select
                name="status"
                defaultValue={creator.status}
                className="nht-input"
              >
                {creatorStatuses.map((value) => (
                  <option key={value} value={value}>
                    {statusLabels[value] ?? value}
                  </option>
                ))}
              </select>
            </Field>
            <SaveButton
              pending={isPending && pendingField === "status"}
              labels={labels}
            />
          </form>
        </Section>

        {canAssignManager ? (
          <Section title={labels.sections.manager}>
            <form
              action={(formData) => {
                run("manager", () => updateManager(formData));
              }}
            >
              <input type="hidden" name="id" value={creator.id} />
              <Field label={labels.fields.manager}>
                <select
                  name="manager_id"
                  defaultValue={creator.manager_id ?? ""}
                  className="nht-input"
                >
                  <option value="">{labels.unassigned}</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name ?? manager.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </Field>
              <SaveButton
                pending={isPending && pendingField === "manager"}
                labels={labels}
              />
            </form>
          </Section>
        ) : (
          <Section title={labels.sections.manager}>
            <ReadonlyField
              label={labels.fields.manager}
              value={creator.manager?.full_name ?? labels.unassigned}
            />
          </Section>
        )}
      </div>

      <Section title={labels.sections.notes}>
        <form
          action={(formData) => {
            run("notes", () => updateNotes(formData));
          }}
        >
          <input type="hidden" name="id" value={creator.id} />
          <Field label={labels.fields.notes}>
            <textarea
              name="notes"
              rows={6}
              defaultValue={creator.notes ?? ""}
              className="nht-input resize-y"
            />
          </Field>
          <SaveButton
            pending={isPending && pendingField === "notes"}
            labels={labels}
          />
        </form>
      </Section>

      <Section title={labels.sections.timeline}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ReadonlyField
            label={labels.fields.created}
            value={formatDateTime(creator.created_at, locale)}
          />
          <ReadonlyField
            label={labels.fields.updated}
            value={formatDateTime(creator.updated_at, locale)}
          />
          <ReadonlyField
            label={labels.fields.lastLogin}
            value={formatDateTime(creator.last_login_at, locale)}
          />
          <ReadonlyField
            label={labels.fields.lastActivity}
            value={formatDateTime(creator.last_activity_at, locale)}
          />
          <ReadonlyField
            label={labels.fields.birthday}
            value={formatDate(creator.birthday, locale)}
          />
          <ReadonlyField
            label={labels.fields.application}
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
          <ReadonlyField
            label={labels.fields.languages}
            value={formatList(creator.languages)}
          />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <h2 className="text-sm font-medium text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <div className="mt-2 text-sm break-words text-white">{value}</div>
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
