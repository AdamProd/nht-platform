"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { fadeUp } from "@/components/motion/variants";
import { submitApplication } from "@/features/applications/actions/submit-application";

const platformKeys = [
  "onlyfans",
  "fansly",
  "manyvids",
  "multiple",
  "emerging",
] as const;

const benefitKeys = [
  "consultation",
  "architecture",
  "fees",
  "nda",
] as const;

export default function ContactForm() {
  const t = useTranslations("application");
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    try {
      const result = await submitApplication(formData);

      if (result.success) {
        setSubmitted(true);
        return;
      }

      setError(result.message ?? t("error.description"));
    } catch {
      setError(t("error.description"));
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="contact" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_100%,var(--nht-gold-subtle),transparent_60%)]" />

      <Container className="relative">
        <div className="grid items-start gap-20 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="text-overline mb-8 text-[var(--nht-gold)]">
              {t("label")}
            </span>

            <h2 className="text-h1 max-w-[16ch] font-semibold text-white">
              {t("title")}
            </h2>

            <p className="mt-8 max-w-md text-base leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)] sm:text-lg">
              {t("description")}
            </p>

            <ul className="mt-12 space-y-5">
              {benefitKeys.map((key, i) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--nht-gold)]" />
                  <span className="text-sm text-[var(--nht-text-secondary)]">
                    {t(`benefits.${key}`)}
                  </span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-14 space-y-5 border-t border-white/[0.06] pt-10">
              {[
                { label: t("contact.emailLabel"), value: t("contact.emailValue") },
                { label: t("contact.responseLabel"), value: t("contact.responseValue") },
                { label: t("contact.coverageLabel"), value: t("contact.coverageValue") },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="text-overline text-[var(--nht-text-muted)]">
                    {item.label}
                  </span>
                  <span className="text-sm text-[var(--nht-text-secondary)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong premium-border rounded-[var(--nht-radius-3xl)] p-8 sm:p-10 lg:p-12"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-20 text-center"
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--nht-gold-muted)]">
                  <svg
                    className="h-7 w-7 text-[var(--nht-gold)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {t("success.title")}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)]">
                  {t("success.description")}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
                  >
                    {t("form.nameLabel")}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder={t("form.namePlaceholder")}
                    className="nht-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
                  >
                    {t("form.emailLabel")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t("form.emailPlaceholder")}
                    className="nht-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="platform"
                    className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
                  >
                    {t("form.platformLabel")}
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    required
                    defaultValue=""
                    className="nht-input"
                  >
                    <option value="" disabled className="bg-[#090909]">
                      {t("form.platformPlaceholder")}
                    </option>
                    {platformKeys.map((key) => (
                      <option key={key} value={key} className="bg-[#090909]">
                        {t(`form.platforms.${key}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="text-overline mb-2.5 block text-[var(--nht-text-tertiary)]"
                  >
                    {t("form.messageLabel")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder={t("form.messagePlaceholder")}
                    className="nht-input resize-none"
                  />
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="text-sm leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)]"
                  >
                    {error}
                  </p>
                ) : null}

                <motion.button
                  type="submit"
                  disabled={pending}
                  whileHover={pending ? undefined : { scale: 1.01 }}
                  whileTap={pending ? undefined : { scale: 0.99 }}
                  className="gold-gradient-bg mt-2 w-full rounded-full py-4 text-sm font-semibold text-[#090909] transition-shadow hover:shadow-[var(--nht-shadow-glow-strong)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {pending ? t("form.submitting") : t("form.submit")}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
