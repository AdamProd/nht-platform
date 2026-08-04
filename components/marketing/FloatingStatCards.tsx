"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function FloatingStatCards() {
  const t = useTranslations("floatingStats");

  const cards = [
    {
      label: t("revenueGrowth"),
      value: t("revenueValue"),
      suffix: t("revenueSuffix"),
      position: "top-[6%] -left-[4%] lg:-left-[10%]",
      delay: 0.5,
    },
    {
      label: t("activeFans"),
      value: t("activeFansValue"),
      suffix: "",
      position: "top-[40%] -right-[2%] lg:-right-[6%]",
      delay: 0.75,
    },
    {
      label: t("retention"),
      value: t("retentionValue"),
      suffix: "",
      position: "bottom-[10%] left-[2%]",
      delay: 1,
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute ${card.position} z-20 hidden sm:block`}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 5 + cards.indexOf(card) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="glass-strong premium-border rounded-2xl px-5 py-4"
          >
            <p className="text-overline text-[var(--nht-text-muted)]">
              {card.label}
            </p>
            <p className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white">
              {card.value}
              {card.suffix && (
                <span className="ml-0.5 text-sm font-normal text-[var(--nht-text-tertiary)]">
                  {card.suffix}
                </span>
              )}
            </p>
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}
