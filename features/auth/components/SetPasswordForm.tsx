"use client";

import { useActionState } from "react";
import {
  setPasswordAction,
  type SetPasswordState,
} from "@/features/auth/actions/set-password";

type Labels = {
  title: string;
  description: string;
  password: string;
  confirm: string;
  submit: string;
  submitting: string;
};

export default function SetPasswordForm({ labels }: { labels: Labels }) {
  const [state, action, pending] = useActionState<SetPasswordState | null, FormData>(
    setPasswordAction,
    null,
  );

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.password}
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={pending}
          className="nht-input"
        />
      </label>
      <label className="block">
        <span className="text-overline mb-2 block text-[var(--nht-text-tertiary)]">
          {labels.confirm}
        </span>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
        className="w-full rounded-full bg-[var(--nht-gold)] px-4 py-3 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
