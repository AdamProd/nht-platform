"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import Container from "@/components/ui/Container";
import { staggerContainer, fadeUp } from "@/components/motion/variants";

const creatorKeys = ["sophia", "mia", "alexandra"] as const;
const initials: Record<(typeof creatorKeys)[number], string> = {
  sophia: "SR",
  mia: "MK",
  alexandra: "AT",
};

export default function SuccessStories() {
  const t = useTranslations("creators");

  return (
    <section id="stories" className="section-padding relative">
      <Container>
        <SectionHeader
          label={t("label")}
          title={t("title")}
          description={t("description")}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {creatorKeys.map((key) => (
            <motion.div
              key={key}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4 }}
              className="glass-strong premium-border overflow-hidden rounded-[var(--nht-radius-2xl)] transition-shadow duration-500 hover:shadow-[var(--nht-shadow-glow)]"
            >
              <div className="border-b border-white/[0.05] px-8 pt-8 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-base font-semibold text-[var(--nht-gold)]">
                    {initials[key]}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {t(`items.${key}.name`)}
                    </p>
                    <p className="text-xs text-[var(--nht-text-tertiary)]">
                      {t(`items.${key}.country`)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <span className="text-overline rounded-full border border-white/10 px-3 py-1.5 text-[var(--nht-text-tertiary)]">
                    {t(`items.${key}.platform`)}
                  </span>
                  <span className="text-sm font-semibold text-[var(--nht-gold)]">
                    {t(`items.${key}.growth`)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                    <p className="text-overline text-[var(--nht-text-muted)]">
                      {t("before")}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white/40">
                      {t(`items.${key}.before`)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--nht-text-muted)]">
                      {t("perMonth")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--nht-border-hover)] bg-[var(--nht-gold-muted)] p-4">
                    <p className="text-overline text-[var(--nht-gold)]">
                      {t("after")}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {t(`items.${key}.after`)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[var(--nht-text-tertiary)]">
                      {t("perMonth")}
                    </p>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-[var(--nht-text-tertiary)]">
                  {t("footnote")}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
