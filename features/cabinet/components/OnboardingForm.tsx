"use client";

import { useActionState } from "react";
import {
  completeCreatorOnboarding,
  type OnboardingState,
} from "@/features/cabinet/actions/onboarding";

type Labels = {
  avatarUrl: string;
  biography: string;
  timezone: string;
  languages: string;
  languagesPlaceholder: string;
  phone: string;
  submit: string;
  submitting: string;
};

export default function OnboardingForm({
  defaults,
  labels,
}: {
  defaults: {
    avatar_url: string;
    biography: string;
    timezone: string;
    languages: string;
    phone: string;
  };
  labels: Labels;
}) {
  const [state, action, pending] = useActionState<OnboardingState | null, FormData>(
    completeCreatorOnboarding,
    null,
  );

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.avatarUrl}
        </span>
        <input
          name="avatar_url"
          defaultValue={defaults.avatar_url}
          disabled={pending}
          className="nht-input"
          placeholder="https://"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.biography}
        </span>
        <textarea
          name="biography"
          rows={4}
          defaultValue={defaults.biography}
          disabled={pending}
          className="nht-input resize-y"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.timezone}
        </span>
        <input
          name="timezone"
          required
          defaultValue={defaults.timezone}
          disabled={pending}
          className="nht-input"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.languages}
        </span>
        <input
          name="languages"
          required
          defaultValue={defaults.languages}
          placeholder={labels.languagesPlaceholder}
          disabled={pending}
          className="nht-input"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.phone}
        </span>
        <input
          name="phone"
          defaultValue={defaults.phone}
          disabled={pending}
          className="nht-input"
        />
      </label>
      {state && !state.ok ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="rounded-full bg-[var(--nht-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
