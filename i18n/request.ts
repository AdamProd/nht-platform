import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
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

function readPath(tree: MessageTree, path: string): string | undefined {
  const parts = path.split(".").filter(Boolean);
  let cursor: unknown = tree;
  for (const part of parts) {
    if (!isObject(cursor) || !(part in cursor)) return undefined;
    cursor = cursor[part];
  }
  return typeof cursor === "string" ? cursor : undefined;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const localeMessages = (
    await import(`../messages/${locale}.json`)
  ).default as MessageTree;

  const messages =
    locale === "en"
      ? (enMessages as MessageTree)
      : mergeMessages(enMessages as MessageTree, localeMessages);

  return {
    locale,
    messages,
    getMessageFallback({ namespace, key }) {
      const path = [namespace, key].filter(Boolean).join(".");
      return (
        readPath(enMessages as MessageTree, path) ??
        readPath(enMessages as MessageTree, key) ??
        key
      );
    },
    onError(error) {
      if (error.code === "MISSING_MESSAGE") {
        console.warn(error.message);
        return;
      }
      console.error(error);
    },
  };
});
