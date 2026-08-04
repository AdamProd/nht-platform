import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = (await import(`../messages/${locale}.json`)).default;

  // Ensure nested admin namespaces are always present for Turbopack/HMR.
  if (!messages?.admin?.creators?.title) {
    console.error(
      `[i18n] Missing admin.creators messages for locale "${locale}"`,
    );
  }

  return {
    locale,
    messages,
    getMessageFallback({ namespace, key }) {
      return [namespace, key].filter(Boolean).join(".");
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
