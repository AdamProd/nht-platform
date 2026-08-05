"use client";

import {
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Link, useRouter } from "@/i18n/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Banknote,
  FileText,
  ListTodo,
  Lock,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  archiveCreator,
  deleteCreator,
  updateCreatorProfile,
} from "@/features/creators/profile/actions/profile-actions";
import { deleteAvatar, uploadAvatar } from "@/features/creators/actions/update-creator";
import {
  displayName,
  formatDate,
  formatDateTime,
  formatList,
  formatMoney,
  formatPlatformList,
} from "@/features/creators/lib/format";
import CreatorStatusBadge from "@/features/creators/components/CreatorStatusBadge";
import FlashToast from "@/features/creators/components/FlashToast";
import ImpersonateCreatorButton from "@/features/cabinet/impersonation/components/ImpersonateCreatorButton";
import ActivityTimeline from "@/features/core/activity/components/ActivityTimeline";
import KpiCard from "@/shared/ui/KpiCard";
import Badge from "@/shared/ui/Badge";
import UserAvatar from "@/shared/ui/UserAvatar";
import EmptyState from "@/shared/ui/EmptyState";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import { creatorStatuses } from "@/features/creators/schemas/creator.schema";
import {
  CREATOR_PLATFORMS,
  type CreatorPlatform,
  type CreatorStatus,
} from "@/features/creators/types";
import { Constants } from "@/types/database.types";
import type {
  CreatorProfileBundle,
  CreatorProfileDocument,
  CreatorProfileTab,
  CreatorProfileTask,
  CreatorProfileTransaction,
} from "@/features/creators/profile/types";

const CABINET_TASK_STATUSES = Constants.public.Enums.cabinet_task_status;

/**
 * Labels consumed by CreatorProfileCrm. Every group is a flexible string
 * dictionary so the server page can supply exactly the keys it has
 * translations for; lookups below fall back to the raw id when a key is
 * missing.
 *
 * - tabs: one entry per `CreatorProfileTab` (overview, platforms,
 *   statistics, tasks, documents, finance, activity)
 * - fields: profile field labels (displayName, legalName, email, telegram,
 *   phone, country, timezone, languages, languagesPlaceholder, notes,
 *   manager, status, platforms, allStatuses, allAssignees, ...)
 * - platforms: platform id -> display name
 * - platformStatus: platform link status -> display name
 * - status: creator status -> display name
 * - stats: statistics tab KPI + chart labels (monthlyRevenue,
 *   lifetimeRevenue, previousMonth, subscribers, activeTasks,
 *   payoutBalance, averageMonthly)
 * - finance: finance tab KPI labels (income, commission, payouts, balance)
 * - tables: column headers (and raw-value lookups) per table — tasks,
 *   documents, payouts (unused, kept optional), transactions, platforms
 * - actions: edit, archive, delete, save, saving, cancel, createTask,
 *   upload, comingSoon, confirmArchiveTitle, confirmArchiveDesc,
 *   confirmDeleteTitle, confirmDeleteDesc, confirm, back, empty,
 *   unassigned, impersonate, registered, lastActivity, connected,
 *   notConnected (optional extras such as saved/archived/deleted/error
 *   toast copy fall back to nearby keys when absent)
 * - activity: empty, expand, collapse, unknownActor
 * - moduleLabels / roleLabels: activity feed module + role display names
 * - avatar: optional { upload, replace, delete, hint } for the avatar editor
 */
type Labels = {
  tabs: Record<CreatorProfileTab, string>;
  fields: Record<string, string>;
  platforms: Record<string, string>;
  platformStatus: Record<string, string>;
  status: Record<string, string>;
  stats: Record<string, string>;
  finance: Record<string, string>;
  tables: {
    tasks: Record<string, string>;
    documents: Record<string, string>;
    payouts?: Record<string, string>;
    transactions: Record<string, string>;
    platforms: Record<string, string>;
  };
  actions: Record<string, string>;
  activity: Record<string, string>;
  moduleLabels: Record<string, string>;
  roleLabels: Record<string, string>;
  avatar?: Record<string, string>;
};

type ProfileDraft = {
  display_name: string;
  legal_name: string;
  email: string;
  telegram: string;
  phone: string;
  country: string;
  timezone: string;
  languages: string;
  notes: string;
  status: CreatorStatus;
  manager_id: string;
  onlyfans_url: string;
  fansly_url: string;
  manyvids_url: string;
  chaturbate_url: string;
  instagram_url: string;
  tiktok_url: string;
  twitter_url: string;
};

type SetField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void;

type EditFormProps = {
  draft: ProfileDraft;
  setField: SetField;
  isPending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

const PLATFORM_URL_FIELD: Record<CreatorPlatform, keyof ProfileDraft> = {
  onlyfans: "onlyfans_url",
  fansly: "fansly_url",
  manyvids: "manyvids_url",
  chaturbate: "chaturbate_url",
  instagram: "instagram_url",
  tiktok: "tiktok_url",
  twitter: "twitter_url",
};

function draftFromCreator(creator: CreatorProfileBundle["creator"]): ProfileDraft {
  return {
    display_name: creator.display_name ?? "",
    legal_name: creator.legal_name ?? "",
    email: creator.email ?? "",
    telegram: creator.telegram ?? "",
    phone: creator.phone ?? "",
    country: creator.country ?? "",
    timezone: creator.timezone ?? "",
    languages: (creator.languages ?? []).join(", "),
    notes: creator.notes ?? "",
    status: creator.status,
    manager_id: creator.manager_id ?? "",
    onlyfans_url: creator.onlyfans_url ?? "",
    fansly_url: creator.fansly_url ?? "",
    manyvids_url: creator.manyvids_url ?? "",
    chaturbate_url: creator.chaturbate_url ?? "",
    instagram_url: creator.instagram_url ?? "",
    tiktok_url: creator.tiktok_url ?? "",
    twitter_url: creator.twitter_url ?? "",
  };
}

export default function CreatorProfileCrm({
  bundle,
  locale,
  labels,
}: {
  bundle: CreatorProfileBundle;
  locale: string;
  labels: Labels;
}) {
  const router = useRouter();
  const { creator, canEdit, canDelete, canImpersonate, canReadFinance } = bundle;

  const [tab, setTab] = useState<CreatorProfileTab>("overview");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromCreator(creator));
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = displayName(creator);
  const avatarSrc = previewUrl || creator.avatar_url;

  function notify(message: string, tone: "success" | "error" = "success") {
    setToastTone(tone);
    setToast(message);
  }

  function run(action: () => Promise<{ success: boolean; error?: string }>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        notify(result.error || labels.actions.error, "error");
        return;
      }
      onSuccess?.();
    });
  }

  function setField<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleEditStart() {
    if (!canEdit) return;
    setDraft(draftFromCreator(creator));
    setEditing(true);
    setTab("overview");
  }

  function handleCancelEdit() {
    setDraft(draftFromCreator(creator));
    setEditing(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    run(
      () =>
        updateCreatorProfile({
          id: creator.id,
          display_name: draft.display_name,
          legal_name: draft.legal_name,
          email: draft.email,
          telegram: draft.telegram,
          phone: draft.phone,
          country: draft.country,
          timezone: draft.timezone,
          languages: draft.languages,
          notes: draft.notes,
          status: draft.status,
          manager_id: draft.manager_id || null,
          onlyfans_url: draft.onlyfans_url,
          fansly_url: draft.fansly_url,
          manyvids_url: draft.manyvids_url,
          chaturbate_url: draft.chaturbate_url,
          instagram_url: draft.instagram_url,
          tiktok_url: draft.tiktok_url,
          twitter_url: draft.twitter_url,
        }),
      () => {
        notify(labels.actions.saved ?? labels.actions.save);
        setEditing(false);
        router.refresh();
      },
    );
  }

  function handleAvatarPick(file: File | null) {
    if (!file || !canEdit) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    const body = new FormData();
    body.set("id", creator.id);
    body.set("avatar", file);
    run(() => uploadAvatar(body), () => router.refresh());
  }

  function handleAvatarDelete() {
    if (!canEdit) return;
    const body = new FormData();
    body.set("id", creator.id);
    run(() => deleteAvatar(body), () => router.refresh());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  function handleArchive() {
    setArchiveOpen(false);
    run(() => archiveCreator({ id: creator.id }), () => {
      notify(labels.actions.archived ?? labels.actions.archive);
      router.refresh();
    });
  }

  function handleDelete() {
    setDeleteOpen(false);
    run(() => deleteCreator({ id: creator.id }), () => {
      notify(labels.actions.deleted ?? labels.actions.delete);
      router.push("/admin/creators");
    });
  }

  function stub() {
    notify(labels.actions.comingSoon);
  }

  const tabs: CreatorProfileTab[] = [
    "overview",
    "platforms",
    "statistics",
    "tasks",
    "documents",
    "finance",
    "activity",
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/creators" className="inline-flex items-center gap-1.5 text-xs text-[var(--nht-text-tertiary)] transition hover:text-[var(--nht-accent)]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        {labels.actions.back}
      </Link>

      <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <UserAvatar name={name} src={avatarSrc} size="lg" tone="creator" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-semibold text-white">{name}</h1>
                <CreatorStatusBadge status={creator.status} label={labels.status[creator.status] ?? creator.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--nht-text-tertiary)]">
                <span>{labels.fields.manager}: {creator.manager?.full_name ?? labels.actions.unassigned}</span>
                <span>{labels.fields.country}: {creator.country || "—"}</span>
                <span>{labels.fields.timezone}: {creator.timezone || "—"}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(creator.platforms ?? []).length > 0 ? (
                  (creator.platforms ?? []).map((platform) => (
                    <Badge key={platform} tone="info">{labels.platforms[platform] ?? platform}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-[var(--nht-text-tertiary)]">—</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--nht-text-tertiary)]">
                <span>{labels.actions.registered}: {formatDate(creator.created_at, locale)}</span>
                <span>{labels.actions.lastActivity}: {formatDateTime(creator.last_activity_at, locale)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canImpersonate ? (
              <ImpersonateCreatorButton creatorId={creator.id} label={labels.actions.impersonate} />
            ) : null}
            {canEdit && !editing ? (
              <HeaderButton icon={Pencil} label={labels.actions.edit} onClick={handleEditStart} />
            ) : null}
            {canEdit ? (
              <HeaderButton icon={ShieldAlert} label={labels.actions.archive} onClick={() => setArchiveOpen(true)} />
            ) : null}
            {canDelete ? (
              <HeaderButton icon={Trash2} label={labels.actions.delete} tone="danger" onClick={() => setDeleteOpen(true)} />
            ) : null}
          </div>
        </div>
      </section>

      <div role="tablist" aria-label={name} className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-3">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              tab === id
                ? "bg-[var(--nht-accent-muted)] text-[var(--nht-accent)]"
                : "text-[var(--nht-text-tertiary)] hover:text-white"
            }`}
          >
            {labels.tabs[id]}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "overview" ? (
          <OverviewTab
            bundle={bundle}
            labels={labels}
            editing={editing && canEdit}
            draft={draft}
            setField={setField}
            isPending={isPending}
            avatarSrc={avatarSrc}
            fileInputRef={fileInputRef}
            onAvatarPick={handleAvatarPick}
            onAvatarDelete={handleAvatarDelete}
            onSubmit={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : null}

        {tab === "platforms" ? (
          <PlatformsTab
            bundle={bundle}
            labels={labels}
            locale={locale}
            editing={editing && canEdit}
            draft={draft}
            setField={setField}
            isPending={isPending}
            onSubmit={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : null}

        {tab === "statistics" ? <StatisticsTab bundle={bundle} labels={labels} locale={locale} /> : null}
        {tab === "tasks" ? <TasksTab tasks={bundle.tasks} labels={labels} locale={locale} onCreate={stub} /> : null}
        {tab === "documents" ? (
          <DocumentsTab documents={bundle.documents} labels={labels} locale={locale} onUpload={stub} />
        ) : null}
        {tab === "finance" ? (
          <FinanceTab bundle={bundle} labels={labels} locale={locale} canReadFinance={canReadFinance} />
        ) : null}
        {tab === "activity" ? (
          <ActivityTimeline
            items={bundle.activity}
            labels={{
              empty: labels.activity.empty,
              expand: labels.activity.expand,
              collapse: labels.activity.collapse,
              unknownActor: labels.activity.unknownActor,
            }}
            moduleLabels={labels.moduleLabels}
            roleLabels={labels.roleLabels}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title={labels.actions.confirmArchiveTitle}
        description={labels.actions.confirmArchiveDesc}
        confirmLabel={labels.actions.confirm}
        cancelLabel={labels.actions.cancel}
        tone="default"
        onConfirm={handleArchive}
        onCancel={() => setArchiveOpen(false)}
      />
      <ConfirmDialog
        open={deleteOpen}
        title={labels.actions.confirmDeleteTitle}
        description={labels.actions.confirmDeleteDesc}
        confirmLabel={labels.actions.confirm}
        cancelLabel={labels.actions.cancel}
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <FlashToast message={toast} tone={toastTone} />
    </div>
  );
}

function HeaderButton({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
        tone === "danger"
          ? "border-red-400/30 text-red-200 hover:bg-red-500/10"
          : "border-white/10 text-[var(--nht-text-secondary)] hover:text-white"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-overline text-[var(--nht-text-tertiary)]">{label}</dt>
      <dd className="mt-1 break-words text-white">{value}</dd>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="nht-input"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block sm:col-span-2">
      <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">{label}</span>
      <textarea value={value} disabled={disabled} rows={4} onChange={(event) => onChange(event.target.value)} className="nht-input min-h-[110px] resize-y" />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="nht-input">
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function FormActions({ isPending, onCancel, labels }: { isPending: boolean; onCancel: () => void; labels: Labels }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="submit" disabled={isPending} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-[var(--nht-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        <Save className="h-3.5 w-3.5" aria-hidden />
        {isPending ? labels.actions.saving : labels.actions.save}
      </button>
      <button type="button" onClick={onCancel} disabled={isPending} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-[var(--nht-text-secondary)] hover:text-white">
        <X className="h-3.5 w-3.5" aria-hidden />
        {labels.actions.cancel}
      </button>
    </div>
  );
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: { header: string; render: (row: T) => ReactNode }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="text-overline text-[var(--nht-text-tertiary)]">
            {columns.map((col) => (
              <th key={col.header} className="px-3 py-2 font-medium">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-white/[0.06]">
              {columns.map((col) => (
                <td key={col.header} className="px-3 py-3">{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewTab({
  bundle,
  labels,
  editing,
  avatarSrc,
  fileInputRef,
  onAvatarPick,
  onAvatarDelete,
  ...form
}: {
  bundle: CreatorProfileBundle;
  labels: Labels;
  editing: boolean;
  avatarSrc: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAvatarPick: (file: File | null) => void;
  onAvatarDelete: () => void;
} & EditFormProps) {
  const { creator, managers, canAssignManager } = bundle;
  const { draft, setField, isPending, onSubmit, onCancel } = form;

  if (!editing) {
    const info: [string, string][] = [
      [labels.fields.legalName, creator.legal_name || "—"],
      [labels.fields.email, creator.email],
      [labels.fields.telegram, creator.telegram || "—"],
      [labels.fields.phone, creator.phone || "—"],
      [labels.fields.country, creator.country || "—"],
      [labels.fields.timezone, creator.timezone || "—"],
      [labels.fields.languages, formatList(creator.languages)],
      [labels.fields.manager, creator.manager?.full_name ?? labels.actions.unassigned],
      [labels.fields.status, labels.status[creator.status] ?? creator.status],
      [labels.fields.platforms, formatPlatformList(creator.platforms, labels.platforms)],
    ];
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={labels.tabs.overview}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {info.map(([label, value]) => (
              <Info key={label} label={label} value={value} />
            ))}
          </dl>
        </Card>
        <Card title={labels.fields.notes}>
          <p className="whitespace-pre-wrap text-sm text-[var(--nht-text-secondary)]">{creator.notes || "—"}</p>
        </Card>
      </div>
    );
  }

  const simpleFields: { labelKey: string; key: "legal_name" | "telegram" | "phone" | "country" | "timezone" }[] = [
    { labelKey: labels.fields.legalName, key: "legal_name" },
    { labelKey: labels.fields.telegram, key: "telegram" },
    { labelKey: labels.fields.phone, key: "phone" },
    { labelKey: labels.fields.country, key: "country" },
    { labelKey: labels.fields.timezone, key: "timezone" },
  ];

  return (
    <Card title={labels.tabs.overview}>
      <form onSubmit={onSubmit} className="space-y-6">
        {labels.avatar ? (
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar name={displayName(creator)} src={avatarSrc} size="lg" tone="creator" />
            <div className="space-y-2">
              <p className="text-xs text-[var(--nht-text-tertiary)]">{labels.avatar.hint}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={isPending} onClick={() => fileInputRef.current?.click()} className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
                  {avatarSrc ? labels.avatar.replace : labels.avatar.upload}
                </button>
                {avatarSrc ? (
                  <button type="button" disabled={isPending} onClick={onAvatarDelete} className="focus-ring rounded-full border border-white/10 px-3 py-1.5 text-xs text-[var(--nht-text-secondary)]">
                    {labels.avatar.delete}
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => onAvatarPick(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label={labels.fields.displayName} value={draft.display_name} onChange={(v) => setField("display_name", v)} required disabled={isPending} />
          {simpleFields.map(({ labelKey, key }) => (
            <TextField key={key} label={labelKey} value={draft[key]} onChange={(v) => setField(key, v)} disabled={isPending} />
          ))}
          <TextField label={labels.fields.email} type="email" value={draft.email} onChange={(v) => setField("email", v)} required disabled={isPending} />
          <TextField
            label={labels.fields.languages}
            value={draft.languages}
            onChange={(v) => setField("languages", v)}
            placeholder={labels.fields.languagesPlaceholder}
            disabled={isPending}
          />
          <SelectField
            label={labels.fields.status}
            value={draft.status}
            onChange={(v) => setField("status", v as CreatorStatus)}
            disabled={isPending}
            options={creatorStatuses.map((value) => ({ value, label: labels.status[value] ?? value }))}
          />
          {canAssignManager ? (
            <SelectField
              label={labels.fields.manager}
              value={draft.manager_id}
              onChange={(v) => setField("manager_id", v)}
              disabled={isPending}
              options={[
                { value: "", label: labels.actions.unassigned },
                ...managers.map((manager) => ({ value: manager.id, label: manager.full_name ?? manager.id })),
              ]}
            />
          ) : null}
          <TextAreaField label={labels.fields.notes} value={draft.notes} onChange={(v) => setField("notes", v)} disabled={isPending} />
        </div>

        <div>
          <h3 className="text-overline mb-3 text-[var(--nht-text-tertiary)]">{labels.tabs.platforms}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {CREATOR_PLATFORMS.map((platform) => (
              <TextField
                key={platform}
                label={labels.platforms[platform] ?? platform}
                value={draft[PLATFORM_URL_FIELD[platform]]}
                onChange={(v) => setField(PLATFORM_URL_FIELD[platform], v)}
                placeholder="https://"
                disabled={isPending}
              />
            ))}
          </div>
        </div>

        <FormActions isPending={isPending} onCancel={onCancel} labels={labels} />
      </form>
    </Card>
  );
}

function PlatformsTab({
  bundle,
  labels,
  locale,
  editing,
  draft,
  setField,
  isPending,
  onSubmit,
  onCancel,
}: {
  bundle: CreatorProfileBundle;
  labels: Labels;
  locale: string;
  editing: boolean;
} & EditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {bundle.platforms.map((item) => {
          const connected = Boolean(item.connectedAt || item.link);
          return (
            <article key={item.platform} className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-white">{labels.platforms[item.platform] ?? item.platform}</h3>
                <Badge tone={connected ? "success" : "neutral"}>{connected ? labels.actions.connected : labels.actions.notConnected}</Badge>
              </div>
              <dl className="mt-3 space-y-2 text-xs text-[var(--nht-text-secondary)]">
                <Info label={labels.tables.platforms.username} value={item.username || "—"} />
                <Info label={labels.tables.platforms.link} value={item.link || "—"} />
                <Info label={labels.tables.platforms.status} value={item.status ? (labels.platformStatus[item.status] ?? item.status) : "—"} />
                <Info label={labels.tables.platforms.connectedAt} value={formatDate(item.connectedAt, locale)} />
              </dl>
            </article>
          );
        })}
      </div>

      {editing ? (
        <Card title={labels.tabs.platforms}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {CREATOR_PLATFORMS.map((platform) => (
                <TextField
                  key={platform}
                  label={labels.platforms[platform] ?? platform}
                  value={draft[PLATFORM_URL_FIELD[platform]]}
                  onChange={(v) => setField(PLATFORM_URL_FIELD[platform], v)}
                  placeholder="https://"
                  disabled={isPending}
                />
              ))}
            </div>
            <FormActions isPending={isPending} onCancel={onCancel} labels={labels} />
          </form>
        </Card>
      ) : null}
    </div>
  );
}

function RevenueBars({
  current,
  previous,
  lifetime,
  labels,
  locale,
}: {
  current: number;
  previous: number;
  lifetime: number;
  labels: Labels;
  locale: string;
}) {
  const max = Math.max(current, previous, lifetime, 1);
  const bars = [
    { key: "current", value: current, caption: labels.stats.monthlyRevenue },
    { key: "previous", value: previous, caption: labels.stats.previousMonth ?? labels.stats.monthlyRevenue },
    { key: "lifetime", value: lifetime, caption: labels.stats.lifetimeRevenue },
  ];

  return (
    <div className="flex items-end gap-6">
      {bars.map((bar) => {
        const height = Math.max(4, Math.round((bar.value / max) * 100));
        return (
          <div key={bar.key} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs font-medium text-white">{formatMoney(bar.value, locale)}</span>
            <div className="flex h-40 w-full items-end rounded-[var(--nht-radius-lg)] bg-white/[0.04] p-1">
              <div className="w-full rounded-[var(--nht-radius-md)] bg-[var(--nht-accent)]" style={{ height: `${height}%` }} />
            </div>
            <span className="text-overline text-center text-[var(--nht-text-tertiary)]">{bar.caption}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatisticsTab({ bundle, labels, locale }: { bundle: CreatorProfileBundle; labels: Labels; locale: string }) {
  const { stats } = bundle;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label={labels.stats.monthlyRevenue} value={formatMoney(stats.thisMonth, locale)} icon={Banknote} tone="accent" />
        <KpiCard label={labels.stats.lifetimeRevenue} value={formatMoney(stats.revenue, locale)} icon={Banknote} />
        <KpiCard label={labels.stats.subscribers} value={stats.subscribers == null ? "—" : stats.subscribers} icon={Users} />
        <KpiCard label={labels.stats.activeTasks} value={stats.tasks} icon={ListTodo} />
        <KpiCard label={labels.stats.payoutBalance} value={formatMoney(stats.payoutBalance, locale)} icon={Banknote} />
        <KpiCard label={labels.stats.averageMonthly} value={formatMoney(stats.averageMonthly, locale)} icon={Banknote} tone="muted" />
      </div>
      <Card title={labels.stats.monthlyRevenue}>
        <RevenueBars current={stats.thisMonth} previous={stats.lastMonth} lifetime={stats.revenue} labels={labels} locale={locale} />
      </Card>
    </div>
  );
}

function priorityTone(priority: string): "neutral" | "warning" | "danger" | "info" {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  if (priority === "low") return "neutral";
  return "info";
}

function taskStatusTone(status: string): "neutral" | "success" | "info" | "warning" {
  if (status === "completed") return "success";
  if (status === "cancelled") return "neutral";
  if (status === "in_progress") return "warning";
  return "info";
}

function TasksTab({
  tasks,
  labels,
  locale,
  onCreate,
}: {
  tasks: CreatorProfileTask[];
  labels: Labels;
  locale: string;
  onCreate: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const assignees = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      if (task.manager) map.set(task.manager.id, task.manager.full_name ?? task.manager.id);
    }
    return Array.from(map.entries());
  }, [tasks]);

  const filtered = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (assigneeFilter === "unassigned" && task.manager) return false;
    if (assigneeFilter && assigneeFilter !== "unassigned" && task.manager?.id !== assigneeFilter) return false;
    return true;
  });

  return (
    <Card
      title={labels.tabs.tasks}
      action={
        <button type="button" onClick={onCreate} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {labels.actions.createTask}
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="nht-input w-auto">
          <option value="">{labels.fields.allStatuses}</option>
          {CABINET_TASK_STATUSES.map((status) => (
            <option key={status} value={status}>{labels.tables.tasks[status] ?? status}</option>
          ))}
        </select>
        <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="nht-input w-auto">
          <option value="">{labels.fields.allAssignees}</option>
          <option value="unassigned">{labels.actions.unassigned}</option>
          {assignees.map(([id, managerName]) => (
            <option key={id} value={id}>{managerName}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title={labels.actions.empty} />
      ) : (
        <DataTable
          rows={filtered}
          rowKey={(task) => task.id}
          columns={[
            { header: labels.tables.tasks.title, render: (task) => <span className="text-white">{task.title}</span> },
            {
              header: labels.tables.tasks.priority,
              render: (task) => (
                <Badge tone={priorityTone(task.priority)}>{labels.tables.tasks[task.priority] ?? task.priority}</Badge>
              ),
            },
            {
              header: labels.tables.tasks.status,
              render: (task) => (
                <Badge tone={taskStatusTone(task.status)}>{labels.tables.tasks[task.status] ?? task.status}</Badge>
              ),
            },
            {
              header: labels.tables.tasks.dueDate,
              render: (task) => (
                <span className="text-[var(--nht-text-secondary)]">{formatDate(task.deadline, locale)}</span>
              ),
            },
            {
              header: labels.tables.tasks.assignedBy,
              render: (task) => (
                <span className="text-[var(--nht-text-secondary)]">{task.manager?.full_name ?? labels.actions.unassigned}</span>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}

function DocumentsTab({
  documents,
  labels,
  locale,
  onUpload,
}: {
  documents: CreatorProfileDocument[];
  labels: Labels;
  locale: string;
  onUpload: () => void;
}) {
  return (
    <Card
      title={labels.tabs.documents}
      action={
        <button type="button" onClick={onUpload} className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {labels.actions.upload}
        </button>
      }
    >
      {documents.length === 0 ? (
        <EmptyState icon={FileText} title={labels.actions.empty} />
      ) : (
        <DataTable
          rows={documents}
          rowKey={(doc) => doc.id}
          columns={[
            { header: labels.tables.documents.document, render: (doc) => <span className="text-white">{doc.file_name}</span> },
            {
              header: labels.tables.documents.type,
              render: (doc) => (
                <span className="text-[var(--nht-text-secondary)]">{labels.tables.documents[doc.doc_type] ?? doc.doc_type}</span>
              ),
            },
            {
              header: labels.tables.documents.status,
              render: () => <Badge tone="success">{labels.tables.documents.uploadedStatus}</Badge>,
            },
            {
              header: labels.tables.documents.uploaded,
              render: (doc) => (
                <span className="text-[var(--nht-text-secondary)]">{formatDateTime(doc.created_at, locale)}</span>
              ),
            },
            { header: labels.tables.documents.actions, render: () => <span className="text-[var(--nht-text-tertiary)]">—</span> },
          ]}
        />
      )}
    </Card>
  );
}

function transactionStatusTone(status: string): "neutral" | "success" | "warning" | "danger" | "info" {
  if (status === "paid" || status === "approved") return "success";
  if (status === "pending") return "warning";
  if (status === "disputed") return "danger";
  if (status === "cancelled") return "neutral";
  return "info";
}

function FinanceTab({
  bundle,
  labels,
  locale,
  canReadFinance,
}: {
  bundle: CreatorProfileBundle;
  labels: Labels;
  locale: string;
  canReadFinance: boolean;
}) {
  const { finance, transactions } = bundle;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={labels.finance.income} value={formatMoney(finance.income, locale)} icon={Banknote} tone="accent" />
        <KpiCard label={labels.finance.commission} value={formatMoney(finance.commission, locale)} icon={Banknote} />
        <KpiCard label={labels.finance.payouts} value={formatMoney(finance.paid, locale)} icon={Banknote} />
        <KpiCard label={labels.finance.balance} value={formatMoney(finance.balance, locale)} icon={Banknote} tone="muted" />
      </div>

      <Card title={labels.tabs.finance}>
        {!canReadFinance ? (
          <EmptyState icon={Lock} title={labels.actions.empty} />
        ) : transactions.length === 0 ? (
          <EmptyState icon={Banknote} title={labels.actions.empty} />
        ) : (
          <DataTable
            rows={transactions}
            rowKey={(row: CreatorProfileTransaction) => row.id}
            columns={[
              {
                header: labels.tables.transactions.date,
                render: (row) => (
                  <span className="text-[var(--nht-text-secondary)]">{formatDate(row.transaction_date, locale)}</span>
                ),
              },
              {
                header: labels.tables.transactions.amount,
                render: (row) => <span className="text-white">{formatMoney(row.gross_revenue, locale, row.currency)}</span>,
              },
              {
                header: labels.tables.transactions.status,
                render: (row) => (
                  <Badge tone={transactionStatusTone(row.status)}>{labels.tables.transactions[row.status] ?? row.status}</Badge>
                ),
              },
              {
                header: labels.tables.transactions.method,
                render: (row) => (
                  <span className="text-[var(--nht-text-secondary)]">
                    {row.payment_method ? (labels.tables.transactions[row.payment_method] ?? row.payment_method) : "—"}
                  </span>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
