import type { CreatorPlatform } from "@/features/creators/types";

export const CREATOR_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type CreatorCurrency = (typeof CREATOR_CURRENCIES)[number];

export const CREATOR_AGENCY_PERCENTS = [30, 40, 50] as const;
export type CreatorAgencyPercent = (typeof CREATOR_AGENCY_PERCENTS)[number];

export const CREATOR_PAYOUT_METHODS = ["bank", "crypto", "paypal"] as const;
export type CreatorPayoutMethodOption = (typeof CREATOR_PAYOUT_METHODS)[number];

export const CREATOR_LANGUAGE_CODES = [
  "en",
  "ru",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "pl",
] as const;

export type CreatorLanguageCode = (typeof CREATOR_LANGUAGE_CODES)[number];

/** ISO country codes used in searchable country select. */
export const CREATOR_COUNTRY_CODES = [
  "LV",
  "DE",
  "US",
  "GB",
  "FR",
  "ES",
  "IT",
  "PT",
  "PL",
  "CZ",
  "UA",
  "RU",
  "EE",
  "LT",
  "SE",
  "NO",
  "FI",
  "DK",
  "NL",
  "BE",
  "AT",
  "CH",
  "IE",
  "CA",
  "AU",
  "NZ",
  "BR",
  "MX",
  "AR",
  "CL",
  "CO",
  "JP",
  "KR",
  "CN",
  "IN",
  "SG",
  "AE",
  "TR",
  "IL",
  "ZA",
] as const;

export type PhoneDialOption = {
  iso: string;
  dial: string;
};

export const PHONE_DIAL_OPTIONS: PhoneDialOption[] = [
  { iso: "LV", dial: "+371" },
  { iso: "DE", dial: "+49" },
  { iso: "US", dial: "+1" },
  { iso: "GB", dial: "+44" },
  { iso: "FR", dial: "+33" },
  { iso: "ES", dial: "+34" },
  { iso: "IT", dial: "+39" },
  { iso: "PT", dial: "+351" },
  { iso: "PL", dial: "+48" },
  { iso: "CZ", dial: "+420" },
  { iso: "UA", dial: "+380" },
  { iso: "RU", dial: "+7" },
  { iso: "EE", dial: "+372" },
  { iso: "LT", dial: "+370" },
  { iso: "SE", dial: "+46" },
  { iso: "NL", dial: "+31" },
  { iso: "BE", dial: "+32" },
  { iso: "AT", dial: "+43" },
  { iso: "CH", dial: "+41" },
  { iso: "IE", dial: "+353" },
  { iso: "CA", dial: "+1" },
  { iso: "AU", dial: "+61" },
  { iso: "BR", dial: "+55" },
  { iso: "JP", dial: "+81" },
  { iso: "AE", dial: "+971" },
  { iso: "TR", dial: "+90" },
];

export const PLATFORM_ICON_HINT: Record<CreatorPlatform, string> = {
  onlyfans: "OF",
  fansly: "FY",
  manyvids: "MV",
  chaturbate: "CB",
  instagram: "IG",
  tiktok: "TT",
  twitter: "X",
};

export const CREATE_CREATOR_DRAFT_KEY = "nht.create-creator.draft.v1";

export function normalizeTelegram(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withoutAt = trimmed.replace(/^@+/, "");
  if (!withoutAt) return "";
  return `@${withoutAt}`;
}

export function composePhone(dial: string, national: string): string | null {
  const digits = national.replace(/[^\d]/g, "");
  if (!digits) return null;
  const code = dial.startsWith("+") ? dial : `+${dial}`;
  return `${code}${digits}`;
}

export function parsePhone(value: string | null | undefined): {
  dial: string;
  national: string;
} {
  if (!value) return { dial: "+371", national: "" };
  const match = value.trim().match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) {
    return { dial: "+371", national: value.replace(/[^\d]/g, "") };
  }
  return {
    dial: match[1],
    national: match[2].replace(/[^\d]/g, ""),
  };
}

export function listTimeZones(): string[] {
  try {
    const values = Intl.supportedValuesOf("timeZone");
    return values.length > 0 ? values : FALLBACK_TIMEZONES;
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

const FALLBACK_TIMEZONES = [
  "Europe/Riga",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Warsaw",
  "Europe/Prague",
  "Europe/Kyiv",
  "Europe/Moscow",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Toronto",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
];
