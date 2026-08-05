"use client";

import {
  createSupportTicket,
  deleteDocument,
  replySupportTicket,
  updateCreatorSettings,
  uploadDocument,
} from "@/features/cabinet/profile/actions/cabinet";
import { FlashToast, useActionToast } from "@/features/cabinet/dashboard/FlashToast";
import { Constants } from "@/types/database.types";
import { Link, useRouter } from "@/i18n/navigation";
import type { Tables } from "@/types/database.types";
import { routing } from "@/i18n/routing";

export function DocumentsPanel({
  documents,
  labels,
}: {
  documents: Tables<"creator_documents">[];
  labels: {
    types: Record<string, string>;
    actions: Record<string, string>;
    empty: string;
    dropHint: string;
    toastUploaded: string;
  };
}) {
  const { toast, tone, isPending, run } = useActionToast();

  return (
    <div className="space-y-6">
      <form
        className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => {
          run(
            () => uploadDocument(formData),
            labels.toastUploaded,
            labels.actions.uploadError,
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.types.passport}
            </span>
            <select name="doc_type" className="nht-input" defaultValue="passport">
              {Constants.public.Enums.creator_document_type.map((type) => (
                <option key={type} value={type}>
                  {labels.types[type] ?? type}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
              {labels.dropHint}
            </span>
            <input name="file" type="file" required className="nht-input" />
          </label>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {isPending ? labels.actions.uploading : labels.actions.upload}
        </button>
      </form>

      {documents.length === 0 ? (
        <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">{doc.file_name}</p>
                <p className="text-xs text-[var(--nht-text-tertiary)]">
                  {labels.types[doc.doc_type] ?? doc.doc_type}
                </p>
              </div>
              <form
                action={(formData) => {
                  run(
                    () => deleteDocument(formData),
                    labels.actions.delete,
                    labels.actions.uploadError,
                  );
                }}
              >
                <input type="hidden" name="id" value={doc.id} />
                <button
                  type="submit"
                  className="text-xs text-[var(--nht-text-tertiary)] hover:text-white"
                >
                  {labels.actions.delete}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <FlashToast message={toast} tone={tone} />
    </div>
  );
}

export function SupportCreateForm({
  labels,
}: {
  labels: {
    create: Record<string, string>;
    toastCreated: string;
    saveError: string;
  };
}) {
  const router = useRouter();
  const { toast, tone, isPending, run } = useActionToast();

  return (
    <>
      <form
        className="space-y-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => {
          run(
            async () => {
              const result = await createSupportTicket({
                subject: formData.get("subject"),
                message: formData.get("message"),
              });
              if (result.success && result.id) {
                router.push(`/creator/support/${result.id}`);
              }
              return result;
            },
            labels.toastCreated,
            labels.saveError,
          );
        }}
      >
        <h2 className="text-sm font-medium text-white">{labels.create.title}</h2>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.create.subject}
          </span>
          <input name="subject" required className="nht-input" />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.create.message}
          </span>
          <textarea name="message" required rows={4} className="nht-input resize-y" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {isPending ? labels.create.submitting : labels.create.submit}
        </button>
      </form>
      <FlashToast message={toast} tone={tone} />
    </>
  );
}

export function SupportThread({
  ticketId,
  messages,
  labels,
}: {
  ticketId: string;
  messages: Tables<"creator_support_messages">[];
  labels: {
    reply: string;
    send: string;
    sending: string;
    empty: string;
    you: string;
    staff: string;
    saved: string;
    saveError: string;
  };
}) {
  const { toast, tone, isPending, run } = useActionToast();

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--nht-text-secondary)]">{labels.empty}</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded-[var(--nht-radius-lg)] bg-white/[0.03] p-3">
              <p className="text-xs text-[var(--nht-gold)]">
                {message.is_staff ? labels.staff : labels.you}
              </p>
              <p className="mt-2 text-sm text-white whitespace-pre-wrap">{message.body}</p>
            </div>
          ))
        )}
      </div>
      <form
        className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => {
          run(
            () => replySupportTicket(formData),
            labels.saved,
            labels.saveError,
          );
        }}
      >
        <input type="hidden" name="ticket_id" value={ticketId} />
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.reply}
          </span>
          <textarea name="body" required rows={3} className="nht-input resize-y" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="mt-3 rounded-full border border-white/10 px-4 py-2 text-xs text-white disabled:opacity-50"
        >
          {isPending ? labels.sending : labels.send}
        </button>
      </form>
      <FlashToast message={toast} tone={tone} />
    </div>
  );
}

export function SettingsForm({
  settings,
  labels,
}: {
  settings: Tables<"creator_settings">;
  labels: {
    fields: Record<string, string>;
    themes: Record<string, string>;
    actions: Record<string, string>;
  };
}) {
  const { toast, tone, isPending, run } = useActionToast();

  return (
    <>
      <form
        className="space-y-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5"
        action={(formData) => {
          run(
            () => updateCreatorSettings(formData),
            labels.actions.saved,
            labels.actions.saveError,
          );
        }}
      >
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.theme}
          </span>
          <select name="theme" defaultValue={settings.theme} className="nht-input">
            {(["dark", "light", "system"] as const).map((theme) => (
              <option key={theme} value={theme}>
                {labels.themes[theme] ?? theme}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.language}
          </span>
          <select
            name="locale"
            defaultValue={settings.locale ?? ""}
            className="nht-input"
          >
            <option value="">—</option>
            {routing.locales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-white">
          <input
            type="checkbox"
            name="notify_telegram"
            defaultChecked={settings.notify_telegram}
            className="h-4 w-4"
          />
          {labels.fields.notifyTelegram}
        </label>
        <label className="flex items-center gap-3 text-sm text-white">
          <input
            type="checkbox"
            name="notify_email"
            defaultChecked={settings.notify_email}
            className="h-4 w-4"
          />
          {labels.fields.notifyEmail}
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          {isPending ? labels.actions.saving : labels.actions.save}
        </button>
      </form>
      <FlashToast message={toast} tone={tone} />
    </>
  );
}

export function TicketListLink({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={`/creator/support/${id}`} className="text-[var(--nht-gold)] hover:text-white">
      {children}
    </Link>
  );
}
