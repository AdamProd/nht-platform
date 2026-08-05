"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  UserRound,
  Clapperboard,
  MessagesSquare,
  TrendingUp,
  Sparkles,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import SectionHeader from "@/shared/ui/SectionHeader";
import Container from "@/shared/ui/Container";
import { staggerContainer, fadeUp } from "@/components/motion/variants";

const serviceKeys = [
  "accountManagement",
  "contentStrategy",
  "fanEngagement",
  "revenueArchitecture",
  "brandPositioning",
  "globalOperations",
] as const;

const serviceIcons: Record<(typeof serviceKeys)[number], LucideIcon> = {
  accountManagement: UserRound,
  contentStrategy: Clapperboard,
  fanEngagement: MessagesSquare,
  revenueArchitecture: TrendingUp,
  brandPositioning: Sparkles,
  globalOperations: Globe2,
};

export default function Services() {
  const t = useTranslations("services");

  return (
    <section id="services" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,var(--nht-accent-subtle),transparent_70%)]" />
      <Container className="relative">
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
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {serviceKeys.map((key, index) => {
            const Icon = serviceIcons[key];
            return (
              <motion.div
                key={key}
                variants={fadeUp}
                className="group nht-card relative overflow-hidden p-8 lg:p-10"
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[var(--nht-accent-muted)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mb-10 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--nht-border-hover)] bg-[var(--nht-accent-muted)] text-[var(--nht-accent-warm)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <span className="text-overline text-[var(--nht-text-muted)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="mt-4 text-sm leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)]">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
