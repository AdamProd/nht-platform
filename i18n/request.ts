import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";
import enMessages from "../messages/en.json";

type MessageTree = Record<string, unknown>;

function isObject(value: unknown): value is MessageTree {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Deep-merge locale messages onto English so missing keys never surface as paths. */
function mergeMessages(base: MessageTree, override: MessageTree): MessageTree {
  const result: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    if (isObject(current) && isObject(value)) {
      result[key] = mergeMessages(current, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Explicit loaders so Turbopack/Webpack always include every locale JSON.
 * Template dynamic imports can miss individual locales (e.g. ru) at runtime.
 */
const localeLoaders: Record<
  Locale,
  () => Promise<{ default: MessageTree }>
> = {
  en: () => import("../messages/en.json"),
  ru: () => import("../messages/ru.json"),
  de: () => import("../messages/de.json"),
  fr: () => import("../messages/fr.json"),
  es: () => import("../messages/es.json"),
  it: () => import("../messages/it.json"),
  pt: () => import("../messages/pt.json"),
  pl: () => import("../messages/pl.json"),
  cs: () => import("../messages/cs.json"),
  uk: () => import("../messages/uk.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const loaded = await localeLoaders[locale]();
  const localeMessages = loaded.default;

  const messages =
    locale === "en"
      ? (enMessages as MessageTree)
      : mergeMessages(enMessages as MessageTree, localeMessages);

  return {
    locale,
    messages,
    onError(error) {
      if (error.code === "MISSING_MESSAGE") {
        console.warn(`[i18n:${locale}]`, error.message);
        return;
      }
      console.error(error);
    },
  };
});
