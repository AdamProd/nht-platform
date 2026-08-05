"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/shared/ui/Button";
import Container from "@/shared/ui/Container";
import HeroComposition from "@/components/marketing/HeroComposition";
import { fadeUp, staggerContainer } from "@/components/motion/variants";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="bg-noise relative flex min-h-screen items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_75%_35%,var(--nht-accent-subtle),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(109,40,217,0.08),transparent_60%)]" />

      <Container className="relative z-[1] pt-36 pb-28 lg:pt-44 lg:pb-36">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20 xl:gap-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-xl"
          >
            <motion.p
              variants={fadeUp}
              className="text-overline mb-8 text-[var(--nht-accent-warm)]"
            >
              {t("overline")}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-display max-w-[12ch] font-semibold text-white"
            >
              {t("title")}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-md text-lg leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)] sm:text-xl"
            >
              {t("description")}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Button href="#contact" variant="primary">
                {t("ctaPrimary")}
              </Button>
              <Button href="#services" variant="secondary">
                {t("ctaSecondary")}
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative min-h-[420px] lg:min-h-[520px]">
            <HeroComposition />
          </div>
        </div>
      </Container>
    </section>
  );
}
