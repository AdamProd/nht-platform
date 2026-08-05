"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import SectionHeader from "@/shared/ui/SectionHeader";
import Container from "@/shared/ui/Container";

const faqKeys = [
  "platforms",
  "fees",
  "control",
  "timeline",
  "confidentiality",
  "criteria",
] as const;

export default function FAQ() {
  const t = useTranslations("faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding relative">
      <Container className="max-w-[820px]">
        <SectionHeader
          label={t("label")}
          title={t("title")}
          description={t("description")}
        />

        <div className="overflow-hidden rounded-[var(--nht-radius-xl)] border border-white/[0.06] bg-white/[0.02]">
          {faqKeys.map((key, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={index > 0 ? "border-t border-white/[0.06]" : ""}
              >
                <button
                  type="button"
                  className="focus-ring flex w-full items-start justify-between gap-8 px-6 py-7 text-left sm:px-8"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-white">
                    {t(`items.${key}.question`)}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--nht-text-tertiary)]"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-7 text-sm leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)] sm:px-8">
                        {t(`items.${key}.answer`)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
