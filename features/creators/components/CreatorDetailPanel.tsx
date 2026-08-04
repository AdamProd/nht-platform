"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  updateManager,
  updateNotes,
  updatePlatforms,
  updateProfile,
  updateStatus,
} from "@/features/creators/actions/update-creator";
import { creatorStatuses } from "@/features/creators/schemas/creator.schema";
import {
  CREATOR_PLATFORMS,
  parsePlatformAccounts,
  type CreatorDetail,
  type CreatorPlatformAccounts,
  type CreatorStatus,
} from "@/features/creators/types";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";
import {
  displayNameOf,
  formatDate,
  formatDateTime,
  formatMoney,
} from "@/features/creators/lib/format";

type Labels = {
  sections: {
    profile: string;
    contacts: string;
    platforms: string;
    revenue: string;
    manager: string;
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
    status: string;
    manager: string;
    notes: string;
    revenueCurrent: string;
    revenuePrevious: string;
    revenueLifetime: string;
    payouts: string;
    created: string;
    updated: string;
    lastLogin: string;
    lastActivity: string;
  };
  unassigned: string;
  save: string;
  saving: string;
  saved: string;
  saveError: string;
};

type CreatorDetailPanelProps = {
  creator: CreatorDetail;
  managers: StaffManagerOption[];
  canAssignManager: boolean;
  locale: string;
  labels: Labels;
  statusLabels: Record<string, string>;
  platformLabels: Record<string, string>;
};

export default function CreatorDetailPanel({
  creator,
  managers,
  canAssignManager,
  locale,
  labels,
  statusLabels,
  platformLabels,
}: CreatorDetailPanelProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(displayNameOf(creator));
  const [legalName, setLegalName] = useState(creator.legal_name ?? "");
  const [birthday, setBirthday] = useState(creator.birthday ?? "");
  const [country, setCountry] = useState(creator.country ?? "");
  const [languages, setLanguages] = useState(
    (creator.languages ?? []).join(", "),
  );
  const [timezone, setTimezone] = useState(creator.timezone ?? "");
  const [email, setEmail] = useState(creator.email);
  const [telegram, setTelegram] = useState(creator.telegram ?? "");
  const [phone, setPhone] = useState(creator.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url ?? "");
  const [status, setStatus] = useState<CreatorStatus>(creator.status);
  const [managerId, setManagerId] = useState(creator.manager_id ?? "");
  const [notes, setNotes] = useState(creator.notes ?? "");
  const [accounts, setAccounts] = useState<CreatorPlatformAccounts>(
    parsePlatformAccounts(creator.platform_accounts),
  );

  function run(
    field: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    rollback?: () => void,
  ) {
    setError(null);
    setPendingField(field);
    startTransition(async () => {
      try {
        const result = await action();
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

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.profile}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const previous = {
              displayName,
              legalName,
              birthday,
              country,
              languages,
              timezone,
              email,
              telegram,
              phone,
              avatarUrl,
            };
            run(
              "profile",
              () =>
                updateProfile({
                  id: creator.id,
                  display_name: displayName,
                  legal_name: legalName,
                  birthday,
                  country,
                  languages,
                  timezone,
                  email,
                  telegram,
                  phone,
                  avatar_url: avatarUrl,
                }),
              () => {
                setDisplayName(previous.displayName);
                setLegalName(previous.legalName);
                setBirthday(previous.birthday);
                setCountry(previous.country);
                setLanguages(previous.languages);
                setTimezone(previous.timezone);
                setEmail(previous.email);
                setTelegram(previous.telegram);
                setPhone(previous.phone);
                setAvatarUrl(previous.avatarUrl);
              },
            );
          }}
        >
          <Field label={labels.fields.displayName}>
            <input
              className="nht-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </Field>
          <Field label={labels.fields.legalName}>
            <input
              className="nht-input"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.birthday}>
            <input
              type="date"
              className="nht-input"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.country}>
            <input
              className="nht-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.languages}>
            <input
              className="nht-input"
              value={languages}
              placeholder={labels.fields.languagesPlaceholder}
              onChange={(e) => setLanguages(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.timezone}>
            <input
              className="nht-input"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.avatarUrl}>
            <input
              className="nht-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://"
            />
          </Field>
          <div className="sm:col-span-2">
            <SaveButton
              pending={isPending && pendingField === "profile"}
              labels={labels}
            />
          </div>
        </form>
      </section>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.contacts}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const previous = { email, telegram, phone };
            run(
              "contacts",
              () =>
                updateProfile({
                  id: creator.id,
                  display_name: displayName,
                  legal_name: legalName,
                  birthday,
                  country,
                  languages,
                  timezone,
                  email,
                  telegram,
                  phone,
                  avatar_url: avatarUrl,
                }),
              () => {
                setEmail(previous.email);
                setTelegram(previous.telegram);
                setPhone(previous.phone);
              },
            );
          }}
        >
          <Field label={labels.fields.email}>
            <input
              className="nht-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label={labels.fields.telegram}>
            <input
              className="nht-input"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </Field>
          <Field label={labels.fields.phone}>
            <input
              className="nht-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <div className="sm:col-span-3">
            <SaveButton
              pending={isPending && pendingField === "contacts"}
              labels={labels}
            />
          </div>
        </form>
      </section>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.platforms}
        </h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const previous = accounts;
            run(
              "platforms",
              () =>
                updatePlatforms({
                  id: creator.id,
                  platform_accounts: accounts,
                }),
              () => setAccounts(previous),
            );
          }}
        >
          {CREATOR_PLATFORMS.map((key) => (
            <Field key={key} label={platformLabels[key] ?? key}>
              <input
                className="nht-input"
                value={accounts[key] ?? ""}
                onChange={(e) =>
                  setAccounts((current) => ({
                    ...current,
                    [key]: e.target.value,
                  }))
                }
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
      </section>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.revenue}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnly
            label={labels.fields.revenueCurrent}
            value={formatMoney(creator.revenue_current_month, locale)}
          />
          <ReadOnly
            label={labels.fields.revenuePrevious}
            value={formatMoney(creator.revenue_previous_month, locale)}
          />
          <ReadOnly
            label={labels.fields.revenueLifetime}
            value={formatMoney(creator.revenue_lifetime, locale)}
          />
          <ReadOnly
            label={labels.fields.payouts}
            value={formatMoney(creator.payouts_total, locale)}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
          action={(formData) => {
            const previous = status;
            const next = formData.get("status") as CreatorStatus;
            setStatus(next);
            run(
              "status",
              () => updateStatus(formData),
              () => setStatus(previous),
            );
          }}
        >
          <input type="hidden" name="id" value={creator.id} />
          <h2 className="text-sm font-medium text-white">
            {labels.fields.status}
          </h2>
          <label className="mt-4 block">
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
              run(
                "manager",
                () => updateManager(formData),
                () => setManagerId(previous),
              );
            }}
          >
            <input type="hidden" name="id" value={creator.id} />
            <h2 className="text-sm font-medium text-white">
              {labels.sections.manager}
            </h2>
            <label className="mt-4 block">
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
        ) : (
          <div className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
            <h2 className="text-sm font-medium text-white">
              {labels.sections.manager}
            </h2>
            <p className="mt-4 text-sm text-[var(--nht-text-secondary)]">
              {creator.manager?.full_name ?? labels.unassigned}
            </p>
          </div>
        )}
      </div>

      <form
        className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => {
          const previous = notes;
          const next = String(formData.get("notes") ?? "");
          setNotes(next);
          run(
            "notes",
            () => updateNotes(formData),
            () => setNotes(previous),
          );
        }}
      >
        <input type="hidden" name="id" value={creator.id} />
        <h2 className="text-sm font-medium text-white">
          {labels.sections.notes}
        </h2>
        <textarea
          name="notes"
          rows={6}
          value={notes}
          disabled={isPending && pendingField === "notes"}
          onChange={(e) => setNotes(e.target.value)}
          className="nht-input mt-4 resize-y disabled:opacity-60"
        />
        <SaveButton
          pending={isPending && pendingField === "notes"}
          labels={labels}
        />
      </form>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white">
          {labels.sections.timeline}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnly
            label={labels.fields.created}
            value={formatDateTime(creator.created_at, locale)}
          />
          <ReadOnly
            label={labels.fields.updated}
            value={formatDateTime(creator.updated_at, locale)}
          />
          <ReadOnly
            label={labels.fields.lastLogin}
            value={formatDateTime(creator.last_login_at, locale)}
          />
          <ReadOnly
            label={labels.fields.lastActivity}
            value={formatDateTime(creator.last_activity_at, locale)}
          />
          <ReadOnly
            label={labels.fields.birthday}
            value={formatDate(creator.birthday, locale)}
          />
        </div>
      </section>
    </div>
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

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
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
