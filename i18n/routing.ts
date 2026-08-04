import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "ru",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "pl",
  "cs",
  "uk",
] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});
