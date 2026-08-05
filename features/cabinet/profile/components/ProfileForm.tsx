"use client";

import { updateCreatorProfile } from "@/features/cabinet/profile/actions/cabinet";
import { FlashToast, useActionToast } from "@/features/cabinet/dashboard/FlashToast";
import type { Tables } from "@/types/database.types";

type Labels = {
  fields: {
    avatarUrl: string;
    displayName: string;
    biography: string;
    languages: string;
    languagesPlaceholder: string;
    country: string;
    timezone: string;
    telegram: string;
    phone: string;
    birthday: string;
    email: string;
  };
  actions: { save: string; saving: string; saved: string; saveError: string };
  readonlyHint: string;
};

export default function ProfileForm({
  creator,
  labels,
}: {
  creator: Tables<"creators">;
  labels: Labels;
}) {
  const { toast, tone, isPending, run } = useActionToast();

  return (
    <>
      <form
        className="grid gap-4 rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02] p-5 sm:grid-cols-2"
        action={(formData) => {
          run(
            () =>
              updateCreatorProfile({
                display_name: formData.get("display_name"),
                biography: formData.get("biography"),
                languages: String(formData.get("languages") ?? ""),
                country: formData.get("country"),
                timezone: formData.get("timezone"),
                telegram: formData.get("telegram"),
                phone: formData.get("phone"),
                birthday: formData.get("birthday"),
                avatar_url: formData.get("avatar_url"),
              }),
            labels.actions.saved,
            labels.actions.saveError,
          );
        }}
      >
        <label className="block sm:col-span-2">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.avatarUrl}
          </span>
          <input
            name="avatar_url"
            defaultValue={creator.avatar_url ?? ""}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.displayName}
          </span>
          <input
            name="display_name"
            required
            defaultValue={creator.display_name}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.email}
          </span>
          <input
            value={creator.email}
            readOnly
            aria-readonly="true"
            className="nht-input opacity-70"
          />
          <span className="mt-1 block text-xs text-[var(--nht-text-muted)]">
            {labels.readonlyHint}
          </span>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.biography}
          </span>
          <textarea
            name="biography"
            rows={4}
            defaultValue=""
            className="nht-input resize-y"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.languages}
          </span>
          <input
            name="languages"
            defaultValue={(creator.languages ?? []).join(", ")}
            placeholder={labels.fields.languagesPlaceholder}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.country}
          </span>
          <input
            name="country"
            defaultValue={creator.country ?? ""}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.timezone}
          </span>
          <input
            name="timezone"
            defaultValue={creator.timezone ?? ""}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.birthday}
          </span>
          <input
            name="birthday"
            type="date"
            defaultValue={creator.birthday ?? ""}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.telegram}
          </span>
          <input
            name="telegram"
            defaultValue={creator.telegram ?? ""}
            className="nht-input"
          />
        </label>
        <label className="block">
          <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
            {labels.fields.phone}
          </span>
          <input
            name="phone"
            defaultValue={creator.phone ?? ""}
            className="nht-input"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {isPending ? labels.actions.saving : labels.actions.save}
          </button>
        </div>
      </form>
      <FlashToast message={toast} tone={tone} />
    </>
  );
}
