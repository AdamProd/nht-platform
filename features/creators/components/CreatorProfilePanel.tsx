"use client";

import {
  type ReactNode,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  deleteAvatar,
  updateManager,
  updateNotes,
  updatePlatforms,
  updateProfile,
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
import {
  displayName,
  formatDate,
  formatDateTime,
  formatList,
  formatMoney,
  initials,
} from "@/features/creators/lib/format";
import {
  getCreatorBiography,
  visiblePlatformAccounts,
  visiblePlatformCount,
} from "@/features/creators/lib/avatar";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import { Link } from "@/i18n/navigation";

const TABS = [
  "overview",
  "platforms",
  "notes",
  "documents",
  "finance",
  "tasks",
] as const;

type TabId = (typeof TABS)[number];

type Labels = {
  tabs: Record<TabId, string>;
  sidebar: {
    platformsCount: string;
    edit: string;
    back: string;
  };
  sections: {
    profile: string;
    contacts: string;
    platforms: string;
    revenue: string;
    manager: string;
    status: string;
    notes: string;
    timeline: string;
    quickStats: string;
  };
  fields: {
    displayName: string;
    legalName: string;
    fullName: string;
    birthday: string;
    country: string;
    languages: string;
    languagesPlaceholder: string;
    timezone: string;
    email: string;
    telegram: string;
    phone: string;
    biography: string;
    agency: string;
    platforms: string;
    onlyfans: string;
    fansly: string;
    manyvids: string;
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
  quickStats: {
    applications: string;
    revenue: string;
    tasks: string;
  };
  placeholders: {
    documents: { title: string; description: string };
    finance: { title: string; description: string };
    tasks: { title: string; description: string };
  };
  avatar: {
    upload: string;
    replace: string;
    delete: string;
    hint: string;
    preview: string;
    uploading: string;
    deleted: string;
  };
  agencyValue: string;
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
  const [tab, setTab] = useState<TabId>("overview");
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [error, setError] = useState<string | null>(null);
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    creator.status,
    (_current: CreatorStatus, next: CreatorStatus) => next,
  );
  const [optimisticNotes, setOptimisticNotes] = useOptimistic(
    creator.notes ?? "",
    (_current: string, next: string) => next,
  );
  const profileFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = displayName(creator);
  const biography = getCreatorBiography(creator.platform_accounts);
  const accounts = visiblePlatformAccounts(creator.platform_accounts);
  const platformCount = visiblePlatformCount(creator.platform_accounts);
  const avatarSrc = previewUrl || creator.avatar_url;

  function run(
    field: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage = labels.saved,
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
        setToast(successMessage);
      } catch (err) {
        console.error("[CreatorProfilePanel]", err);
        setPendingField(null);
        setError(labels.saveError);
        setToastTone("error");
        setToast(labels.saveError);
      }
    });
  }

  function onPickFile(file: File | null) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    const body = new FormData();
    body.set("id", creator.id);
    body.set("avatar", file);
    run("avatar", () => uploadAvatar(body), labels.saved);
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

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-lg font-medium text-[var(--nht-gold)]"
                aria-label={labels.avatar.preview}
              >
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(name)
                )}
              </div>
              <h1 className="mt-4 text-xl font-semibold text-white">{name}</h1>
              <div className="mt-3">
                <CreatorStatusBadge
                  status={optimisticStatus}
                  label={statusLabels[optimisticStatus] ?? optimisticStatus}
                />
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-left text-sm">
              <SidebarRow
                label={labels.fields.manager}
                value={creator.manager?.full_name ?? labels.unassigned}
              />
              <SidebarRow
                label={labels.fields.country}
                value={creator.country ?? "—"}
              />
              <SidebarRow
                label={labels.fields.platforms}
                value={labels.sidebar.platformsCount.replace(
                  "{count}",
                  String(platformCount),
                )}
              />
              <SidebarRow
                label={labels.fields.created}
                value={formatDate(creator.created_at, locale)}
              />
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setTab("overview");
                  requestAnimationFrame(() => {
                    profileFormRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
              >
                {labels.sidebar.edit}
              </button>
              <Link
                href="/admin/creators"
                className="rounded-full border border-white/10 px-4 py-2 text-center text-xs font-medium text-[var(--nht-text-secondary)] transition-colors hover:border-[var(--nht-border-hover)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)]"
              >
                {labels.sidebar.back}
              </Link>
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-6">
          <div
            role="tablist"
            aria-label={labels.sections.profile}
            className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3"
          >
            {TABS.map((id) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`creator-tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`creator-panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] ${
                    selected
                      ? "bg-white/[0.08] text-white"
                      : "text-[var(--nht-text-tertiary)] hover:text-white"
                  }`}
                >
                  {labels.tabs[id]}
                </button>
              );
            })}
          </div>

          {tab === "overview" ? (
            <div
              role="tabpanel"
              id="creator-panel-overview"
              aria-labelledby="creator-tab-overview"
              className="space-y-6"
            >
              <Section title={labels.sections.quickStats}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard
                    label={labels.quickStats.applications}
                    value={creator.application_id ? "1" : "0"}
                  />
                  <StatCard
                    label={labels.quickStats.revenue}
                    value={formatMoney(creator.revenue_current_month, locale)}
                  />
                  <StatCard label={labels.quickStats.tasks} value="—" />
                </div>
              </Section>

              <Section title={labels.avatar.upload}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-[var(--nht-gold)]">
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarSrc}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(name)
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--nht-text-tertiary)]">
                      {labels.avatar.hint}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                          onPickFile(event.target.files?.[0] ?? null);
                          event.target.value = "";
                        }}
                      />
                      <button
                        type="button"
                        disabled={isPending && pendingField === "avatar"}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white transition-colors hover:border-[var(--nht-border-hover)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] disabled:opacity-60"
                      >
                        {isPending && pendingField === "avatar"
                          ? labels.avatar.uploading
                          : creator.avatar_url || previewUrl
                            ? labels.avatar.replace
                            : labels.avatar.upload}
                      </button>
                      {creator.avatar_url || previewUrl ? (
                        <button
                          type="button"
                          disabled={isPending && pendingField === "avatar-delete"}
                          onClick={() => {
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                            const body = new FormData();
                            body.set("id", creator.id);
                            run(
                              "avatar-delete",
                              () => deleteAvatar(body),
                              labels.avatar.deleted,
                            );
                          }}
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-[var(--nht-text-secondary)] transition-colors hover:border-[var(--nht-border-hover)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-gold)] disabled:opacity-60"
                        >
                          {labels.avatar.delete}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Section>

              <Section title={labels.sections.profile}>
                <form
                  ref={profileFormRef}
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
                        biography: formData.get("biography"),
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
                    <Field label={labels.fields.fullName}>
                      <input
                        name="legal_name"
                        defaultValue={
                          creator.legal_name || creator.full_name || ""
                        }
                        className="nht-input"
                      />
                    </Field>
                    <Field label={labels.fields.email}>
                      <input
                        name="email"
                        type="email"
                        defaultValue={creator.email}
                        required
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
                    <Field label={labels.fields.agency}>
                      <input
                        value={labels.agencyValue}
                        readOnly
                        className="nht-input opacity-70"
                      />
                    </Field>
                    <Field label={labels.fields.telegram}>
                      <input
                        name="telegram"
                        defaultValue={creator.telegram ?? ""}
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
                    <div className="sm:col-span-2">
                      <Field label={labels.fields.biography}>
                        <textarea
                          name="biography"
                          rows={4}
                          defaultValue={biography ?? ""}
                          className="nht-input resize-y"
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReadonlyField
                      label={labels.fields.created}
                      value={formatDateTime(creator.created_at, locale)}
                    />
                    <ReadonlyField
                      label={labels.fields.updated}
                      value={formatDateTime(creator.updated_at, locale)}
                    />
                  </div>

                  <SaveButton
                    pending={isPending && pendingField === "profile"}
                    labels={labels}
                  />
                </form>
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

              <Section title={labels.sections.timeline}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReadonlyField
                    label={labels.fields.lastLogin}
                    value={formatDateTime(creator.last_login_at, locale)}
                  />
                  <ReadonlyField
                    label={labels.fields.lastActivity}
                    value={formatDateTime(creator.last_activity_at, locale)}
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
          ) : null}

          {tab === "platforms" ? (
            <div
              role="tabpanel"
              id="creator-panel-platforms"
              aria-labelledby="creator-tab-platforms"
            >
              <Section title={labels.sections.platforms}>
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  action={(formData) => {
                    run("platforms", () =>
                      updatePlatforms({
                        id: creator.id,
                        onlyfans_url: formData.get("onlyfans_url"),
                        fansly_url: formData.get("fansly_url"),
                        manyvids_url: formData.get("manyvids_url"),
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
                      ["onlyfans_url", "onlyfans", labels.fields.onlyfans],
                      ["fansly_url", "fansly", labels.fields.fansly],
                      ["manyvids_url", "manyvids", labels.fields.manyvids],
                      ["chaturbate_url", "chaturbate", labels.fields.chaturbate],
                      ["instagram_url", "instagram", labels.fields.instagram],
                      ["tiktok_url", "tiktok", labels.fields.tiktok],
                      ["twitter_url", "twitter", labels.fields.twitter],
                    ] as const
                  ).map(([fieldName, platform, label]) => (
                    <Field key={fieldName} label={label}>
                      <input
                        name={fieldName}
                        defaultValue={accounts[platform] ?? ""}
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
            </div>
          ) : null}

          {tab === "notes" ? (
            <div
              role="tabpanel"
              id="creator-panel-notes"
              aria-labelledby="creator-tab-notes"
            >
              <Section title={labels.sections.notes}>
                <form
                  action={(formData) => {
                    const next = String(formData.get("notes") ?? "");
                    startTransition(() => {
                      setOptimisticNotes(next);
                    });
                    run("notes", () => updateNotes(formData));
                  }}
                >
                  <input type="hidden" name="id" value={creator.id} />
                  <Field label={labels.fields.notes}>
                    <textarea
                      name="notes"
                      rows={10}
                      defaultValue={optimisticNotes}
                      key={optimisticNotes}
                      className="nht-input resize-y"
                    />
                  </Field>
                  <SaveButton
                    pending={isPending && pendingField === "notes"}
                    labels={labels}
                  />
                </form>
              </Section>
            </div>
          ) : null}

          {tab === "documents" ? (
            <PlaceholderPanel
              id="documents"
              labels={labels.placeholders.documents}
            />
          ) : null}
          {tab === "finance" ? (
            <PlaceholderPanel
              id="finance"
              labels={labels.placeholders.finance}
              extra={
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
              }
            />
          ) : null}
          {tab === "tasks" ? (
            <PlaceholderPanel id="tasks" labels={labels.placeholders.tasks} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel({
  id,
  labels,
  extra,
}: {
  id: string;
  labels: { title: string; description: string };
  extra?: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`creator-panel-${id}`}
      aria-labelledby={`creator-tab-${id}`}
      className="rounded-[var(--nht-radius-xl)] border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-10 text-center"
    >
      <div className="mx-auto mb-4 h-10 w-40 animate-pulse rounded-full bg-white/[0.04]" />
      <h2 className="text-sm font-medium text-white">{labels.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--nht-text-secondary)]">
        {labels.description}
      </p>
      {extra}
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-overline text-[var(--nht-text-tertiary)]">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--nht-radius-lg)] border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-overline text-[var(--nht-text-tertiary)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
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
