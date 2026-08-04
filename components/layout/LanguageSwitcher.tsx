"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales } from "@/i18n/locales";
import { type Locale, routing } from "@/i18n/routing";

type LanguageSwitcherProps = {
  variant?: "desktop" | "mobile";
  onSelect?: () => void;
};

export default function LanguageSwitcher({
  variant = "desktop",
  onSelect,
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      setOpen(false);
      onSelect?.();
      return;
    }
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params always match the current pathname
        { pathname, params },
        { locale: nextLocale },
      );
    });
    setOpen(false);
    onSelect?.();
  }

  useEffect(() => {
    if (variant !== "desktop") return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [variant]);

  if (variant === "mobile") {
    return (
      <div className="border-t border-white/[0.06] px-4 py-4">
        <p className="text-overline mb-3 text-[var(--nht-text-muted)]">
          Language
        </p>
        <div className="grid grid-cols-5 gap-2">
          {routing.locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              disabled={isPending}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                code === locale
                  ? "bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {localeLabels[code]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
      >
        {localeLabels[locale]}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="glass-strong premium-border absolute top-full right-0 z-50 mt-2 min-w-[88px] overflow-hidden rounded-xl py-1 shadow-[var(--nht-shadow-md)]"
        >
          {locales.map((code) => (
            <li key={code} role="option" aria-selected={code === locale}>
              <button
                type="button"
                onClick={() => switchLocale(code)}
                className={`block w-full px-4 py-2 text-left text-xs font-semibold transition-colors ${
                  code === locale
                    ? "bg-[var(--nht-gold-muted)] text-[var(--nht-gold)]"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {localeLabels[code]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
