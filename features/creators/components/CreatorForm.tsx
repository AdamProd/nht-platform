"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import {
  createCreator,
  uploadAvatar,
} from "@/features/creators/actions/update-creator";
import { checkCreatorEmail } from "@/features/creators/actions/check-creator-email";
import type { StaffManagerOption } from "@/features/applications/types";
import FlashToast from "@/features/creators/components/FlashToast";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import SearchableSelect from "@/features/creators/components/create/SearchableSelect";
import MultiSelect from "@/features/creators/components/create/MultiSelect";
import PhoneInput from "@/features/creators/components/create/PhoneInput";
import PlatformPicker from "@/features/creators/components/create/PlatformPicker";
import AvatarUploadField from "@/features/creators/components/create/AvatarUploadField";
import ManagerSelect from "@/features/creators/components/create/ManagerSelect";
import {
  CREATE_CREATOR_DRAFT_KEY,
  CREATOR_AGENCY_PERCENTS,
  CREATOR_COUNTRY_CODES,
  CREATOR_CURRENCIES,
  CREATOR_LANGUAGE_CODES,
  CREATOR_PAYOUT_METHODS,
  composePhone,
  listTimeZones,
  normalizeTelegram,
} from "@/features/creators/lib/create-options";

type CreatorFormProps = {
  managers: StaffManagerOption[];
  canAssignManager: boolean;
};

type FormState = {
  display_name: string;
  legal_name: string;
  email: string;
  telegram: string;
  phoneDial: string;
  phoneNational: string;
  country: string;
  languages: string[];
  timezone: string;
  platforms: string[];
  manager_id: string;
  preferred_currency: string;
  agency_percent: number;
  payout_method: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  display_name: "",
  legal_name: "",
  email: "",
  telegram: "",
  phoneDial: "+371",
  phoneNational: "",
  country: "",
  languages: [],
  timezone: "",
  platforms: [],
  manager_id: "",
  preferred_currency: "USD",
  agency_percent: 40,
  payout_method: "bank",
  notes: "",
};

export default function CreatorForm({
  managers,
  canAssignManager,
}: CreatorFormProps) {
  const t = useTranslations("admin.creators");
  const tRoles = useTranslations("admin.roles");
  const locale = useLocale();
  const router = useRouter();
  const titleId = useId();
  const emailStatusId = useId();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");
  const [confirmClose, setConfirmClose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const draftLoaded = useRef(false);
  const emailTimer = useRef<number | null>(null);

  const countryNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale],
  );
  const languageNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "language" }),
    [locale],
  );

  const countryOptions = useMemo(
    () =>
      CREATOR_COUNTRY_CODES.map((code) => ({
        value: code,
        label: countryNames.of(code) ?? code,
        keywords: code,
      })).sort((a, b) => a.label.localeCompare(b.label, locale)),
    [countryNames, locale],
  );

  const timezoneOptions = useMemo(
    () =>
      listTimeZones().map((zone) => ({
        value: zone,
        label: zone,
      })),
    [],
  );

  const languageOptions = useMemo(
    () =>
      CREATOR_LANGUAGE_CODES.map((code) => ({
        value: code,
        label: languageNames.of(code) ?? code,
      })),
    [languageNames],
  );

  const roleLabels = useMemo(
    () => ({
      owner: tRoles("owner"),
      admin: tRoles("admin"),
      manager: tRoles("manager"),
      support: tRoles("support"),
      finance: tRoles("finance"),
      content_manager: tRoles("content_manager"),
    }),
    [tRoles],
  );

  const platformLabels = useMemo(
    () => ({
      onlyfans: t("platforms.onlyfans"),
      fansly: t("platforms.fansly"),
      manyvids: t("platforms.manyvids"),
      chaturbate: t("platforms.chaturbate"),
      instagram: t("platforms.instagram"),
      tiktok: t("platforms.tiktok"),
      twitter: t("platforms.twitter"),
    }),
    [t],
  );

  const platformDescriptions = useMemo(
    () => ({
      onlyfans: t("create.platformDescriptions.onlyfans"),
      fansly: t("create.platformDescriptions.fansly"),
      manyvids: t("create.platformDescriptions.manyvids"),
      chaturbate: t("create.platformDescriptions.chaturbate"),
      instagram: t("create.platformDescriptions.instagram"),
      tiktok: t("create.platformDescriptions.tiktok"),
      twitter: t("create.platformDescriptions.twitter"),
    }),
    [t],
  );

  const patch = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setDirty(true);
  }, []);

  const scheduleEmailCheck = useCallback((emailRaw: string) => {
    if (emailTimer.current) window.clearTimeout(emailTimer.current);
    const email = emailRaw.trim();
    if (!email) {
      setEmailStatus("idle");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("invalid");
      return;
    }
    setEmailStatus("checking");
    emailTimer.current = window.setTimeout(() => {
      void checkCreatorEmail(email).then((result) => {
        if (!result.success) {
          setEmailStatus("idle");
          return;
        }
        setEmailStatus(result.available ? "available" : "taken");
      });
    }, 450);
  }, []);

  function openWizard() {
    setError(null);
    if (!draftLoaded.current) {
      draftLoaded.current = true;
      try {
        const raw = window.localStorage.getItem(CREATE_CREATOR_DRAFT_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<FormState>;
          setForm((prev) => ({ ...prev, ...parsed }));
          setDirty(true);
          if (parsed.email) scheduleEmailCheck(String(parsed.email));
        }
      } catch {
        // ignore corrupt drafts
      }
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open || !dirty) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          CREATE_CREATOR_DRAFT_KEY,
          JSON.stringify(form),
        );
      } catch {
        // ignore quota errors
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [form, dirty, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [open, dirty]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (emailTimer.current) window.clearTimeout(emailTimer.current);
    };
  }, [avatarPreview]);

  function requestClose() {
    if (isPending) return;
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    closeModal(false);
  }

  function closeModal(clearDraft: boolean) {
    setOpen(false);
    setConfirmClose(false);
    setError(null);
    draftLoaded.current = false;
    if (clearDraft) {
      window.localStorage.removeItem(CREATE_CREATOR_DRAFT_KEY);
      setForm(EMPTY_FORM);
      setDirty(false);
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      setEmailStatus("idle");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (emailStatus === "taken") {
      setError(t("create.validation.emailTaken"));
      return;
    }
    if (emailStatus === "invalid") {
      setError(t("create.validation.emailInvalid"));
      return;
    }

    const payload = {
      display_name: form.display_name,
      legal_name: form.legal_name,
      email: form.email,
      telegram: normalizeTelegram(form.telegram) || null,
      phone: composePhone(form.phoneDial, form.phoneNational),
      country: form.country || null,
      languages: form.languages,
      timezone: form.timezone || null,
      platforms: form.platforms,
      manager_id: form.manager_id || null,
      preferred_currency: form.preferred_currency,
      agency_percent: form.agency_percent,
      payout_method: form.payout_method,
      notes: form.notes || null,
    };

    startTransition(async () => {
      const result = await createCreator(payload);
      if (!result.success) {
        setError(result.error);
        setToastTone("error");
        setToast(result.error);
        return;
      }

      if (result.id && avatarFile) {
        const body = new FormData();
        body.set("id", result.id);
        body.set("avatar", avatarFile);
        await uploadAvatar(body);
      }

      window.localStorage.removeItem(CREATE_CREATOR_DRAFT_KEY);
      setDirty(false);
      setToastTone("success");
      setToast(t("toast.created"));
      setOpen(false);
      draftLoaded.current = false;
      setForm(EMPTY_FORM);
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);

      if (result.id) {
        router.push(`/admin/creators/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openWizard}
        className="inline-flex items-center justify-center rounded-full bg-[var(--nht-accent)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nht-accent)]"
      >
        {t("create.label")}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t("form.cancel")}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={requestClose}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[var(--nht-radius-2xl)] border border-white/[0.08] bg-[var(--nht-black-elevated)] shadow-[var(--nht-shadow-lg)]"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <div>
                <p className="text-overline text-[var(--nht-accent)]">
                  {t("create.label")}
                </p>
                <h2
                  id={titleId}
                  className="mt-1 text-xl font-semibold tracking-tight text-white"
                >
                  {t("form.title")}
                </h2>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={isPending}
                className="focus-ring rounded-full border border-white/10 p-2 text-[var(--nht-text-tertiary)] transition hover:text-white disabled:opacity-50"
                aria-label={t("form.cancel")}
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="space-y-4">
                  <SectionCard title={t("create.sections.basic")}>
                    <AvatarUploadField
                      label={t("create.avatar.upload")}
                      hint={t("create.avatar.hint")}
                      previewUrl={avatarPreview}
                      disabled={isPending}
                      onFile={(file) => {
                        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                        setAvatarFile(file);
                        setAvatarPreview(file ? URL.createObjectURL(file) : null);
                        setDirty(true);
                      }}
                    />

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <TextField
                        label={t("fields.displayName")}
                        value={form.display_name}
                        required
                        disabled={isPending}
                        onChange={(value) => patch({ display_name: value })}
                      />
                      <TextField
                        label={t("fields.legalName")}
                        value={form.legal_name}
                        disabled={isPending}
                        onChange={(value) => patch({ legal_name: value })}
                      />
                      <div>
                        <TextField
                          label={t("fields.email")}
                          type="email"
                          value={form.email}
                          required
                          disabled={isPending}
                          describedBy={emailStatusId}
                          onChange={(value) => {
                            patch({ email: value });
                            scheduleEmailCheck(value);
                          }}
                        />
                        <p
                          id={emailStatusId}
                          className="mt-2 text-xs"
                          aria-live="polite"
                        >
                          {emailStatus === "checking" ? (
                            <span className="text-[var(--nht-text-tertiary)]">
                              {t("create.validation.emailChecking")}
                            </span>
                          ) : null}
                          {emailStatus === "available" ? (
                            <span className="text-emerald-300">
                              {t("create.validation.emailAvailable")}
                            </span>
                          ) : null}
                          {emailStatus === "taken" ? (
                            <span className="text-red-300">
                              {t("create.validation.emailTaken")}
                            </span>
                          ) : null}
                          {emailStatus === "invalid" ? (
                            <span className="text-red-300">
                              {t("create.validation.emailInvalid")}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <PhoneInput
                        label={t("fields.phone")}
                        dial={form.phoneDial}
                        national={form.phoneNational}
                        dialLabel={t("create.phone.dial")}
                        numberLabel={t("create.phone.number")}
                        disabled={isPending}
                        onDialChange={(phoneDial) => patch({ phoneDial })}
                        onNationalChange={(phoneNational) =>
                          patch({ phoneNational })
                        }
                      />
                      <TextField
                        label={t("fields.telegram")}
                        value={form.telegram}
                        disabled={isPending}
                        onChange={(value) => patch({ telegram: value })}
                        onBlur={() =>
                          patch({
                            telegram: normalizeTelegram(form.telegram),
                          })
                        }
                      />
                      <SearchableSelect
                        label={t("fields.country")}
                        value={form.country}
                        options={countryOptions}
                        placeholder={t("create.search.country")}
                        searchPlaceholder={t("create.search.placeholder")}
                        emptyLabel={t("create.search.empty")}
                        disabled={isPending}
                        onChange={(country) => patch({ country })}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title={t("create.sections.work")}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {canAssignManager ? (
                        <ManagerSelect
                          label={t("fields.manager")}
                          value={form.manager_id}
                          managers={managers}
                          unassignedLabel={t("unassigned")}
                          roleLabels={roleLabels}
                          disabled={isPending}
                          onChange={(manager_id) => patch({ manager_id })}
                        />
                      ) : (
                        <ReadonlyField
                          label={t("fields.manager")}
                          value={t("unassigned")}
                        />
                      )}
                      <ReadonlyField
                        label={t("fields.status")}
                        value={t("status.new")}
                      />
                      <SearchableSelect
                        label={t("fields.timezone")}
                        value={form.timezone}
                        options={timezoneOptions}
                        placeholder={t("create.search.timezone")}
                        searchPlaceholder={t("create.search.placeholder")}
                        emptyLabel={t("create.search.empty")}
                        disabled={isPending}
                        onChange={(timezone) => patch({ timezone })}
                      />
                      <MultiSelect
                        label={t("fields.languages")}
                        values={form.languages}
                        options={languageOptions}
                        disabled={isPending}
                        onChange={(languages) => patch({ languages })}
                      />
                    </div>
                  </SectionCard>

                  <SectionCard title={t("create.sections.platforms")}>
                    <PlatformPicker
                      label={t("fields.platforms")}
                      values={form.platforms}
                      platformLabels={platformLabels}
                      platformDescriptions={platformDescriptions}
                      disabled={isPending}
                      onChange={(platforms) => patch({ platforms })}
                    />
                  </SectionCard>

                  <SectionCard title={t("create.sections.finance")}>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <SelectField
                        label={t("create.finance.currency")}
                        value={form.preferred_currency}
                        disabled={isPending}
                        onChange={(preferred_currency) =>
                          patch({ preferred_currency })
                        }
                      >
                        {CREATOR_CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField
                        label={t("create.finance.agencyPercent")}
                        value={String(form.agency_percent)}
                        disabled={isPending}
                        onChange={(value) =>
                          patch({ agency_percent: Number(value) })
                        }
                      >
                        {CREATOR_AGENCY_PERCENTS.map((percent) => (
                          <option key={percent} value={percent}>
                            {percent}%
                          </option>
                        ))}
                      </SelectField>
                      <SelectField
                        label={t("create.finance.payoutMethod")}
                        value={form.payout_method}
                        disabled={isPending}
                        onChange={(payout_method) => patch({ payout_method })}
                      >
                        {CREATOR_PAYOUT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {t(`create.finance.methods.${method}`)}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </SectionCard>

                  <SectionCard title={t("create.sections.notes")}>
                    <label className="block">
                      <span className="sr-only">{t("fields.notes")}</span>
                      <textarea
                        rows={4}
                        disabled={isPending}
                        value={form.notes}
                        aria-label={t("fields.notes")}
                        placeholder={t("fields.notes")}
                        onChange={(event) =>
                          patch({ notes: event.target.value })
                        }
                        className="nht-input min-h-[120px] resize-y"
                      />
                    </label>
                  </SectionCard>

                  {error ? (
                    <p
                      className="rounded-[var(--nht-radius-lg)] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              </div>

              <footer className="sticky bottom-0 z-10 flex shrink-0 flex-col-reverse gap-2 border-t border-white/[0.06] bg-[var(--nht-black-elevated)]/95 px-5 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={isPending}
                  className="focus-ring rounded-full border border-white/10 px-5 py-2.5 text-sm text-[var(--nht-text-secondary)] transition hover:text-white disabled:opacity-50"
                >
                  {t("form.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isPending || emailStatus === "taken"}
                  aria-busy={isPending}
                  className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[var(--nht-accent)] px-6 py-2.5 text-sm font-medium text-white shadow-[var(--nht-shadow-glow)] transition hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {t("form.submitting")}
                    </>
                  ) : (
                    t("create.label")
                  )}
                </button>
              </footer>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmClose}
        title={t("create.unsaved.title")}
        description={t("create.unsaved.description")}
        confirmLabel={t("create.unsaved.leave")}
        cancelLabel={t("create.unsaved.stay")}
        tone="default"
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => closeModal(false)}
      />

      <FlashToast message={toast} tone={toastTone} />
    </>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      <p className="text-overline text-[var(--nht-accent)]">{title}</p>
      <h3 className="mt-1 text-base font-semibold tracking-tight text-white">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  required,
  disabled,
  describedBy,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="text-overline mb-2 block text-[var(--nht-text-tertiary)]"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[var(--nht-accent)]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        aria-label={label}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="nht-input"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="text-overline mb-2 block text-[var(--nht-text-tertiary)]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="nht-input"
      >
        {children}
      </select>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="block">
      <p className="text-overline mb-2 text-[var(--nht-text-tertiary)]">{label}</p>
      <p className="nht-input flex items-center text-[var(--nht-text-secondary)]">
        {value}
      </p>
    </div>
  );
}
