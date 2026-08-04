"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  loginAction,
  type LoginState,
} from "@/features/auth/actions/login";

const initialState: LoginState | null = null;

export default function LoginForm() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const forbidden = searchParams.get("error") === "forbidden";

  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {(forbidden || (state && !state.ok)) && (
        <p
          role="alert"
          className="rounded-[var(--nht-radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-[var(--nht-text-secondary)]"
        >
          {forbidden && (!state || state.ok)
            ? t("errors.forbidden")
            : state && !state.ok
              ? state.error
              : null}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
          className="nht-input"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
        >
          {t("passwordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder={t("passwordPlaceholder")}
          className="nht-input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="gold-gradient-bg mt-2 w-full rounded-full py-4 text-sm font-semibold text-[#090909] transition-shadow hover:shadow-[var(--nht-shadow-glow-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
