"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import GlowingSphere from "@/components/marketing/GlowingSphere";
import FloatingStatCards from "@/components/marketing/FloatingStatCards";
import DashboardMockup from "@/components/marketing/DashboardMockup";
import { fadeUp } from "@/components/motion/variants";

export default function Hero() {
  const t = useTranslations("hero");
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 600], [0, 60]);
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0.4]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_40%,var(--nht-gold-subtle),transparent_65%)]" />

      <Container className="relative pt-36 pb-24 lg:pt-40 lg:pb-32">
        <div className="grid items-center gap-20 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          <motion.div style={{ y: yParallax, opacity: opacityParallax }}>
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-overline mb-10 text-[var(--nht-text-tertiary)]"
            >
              {t("overline")}
            </motion.p>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.08 }}
              className="text-display max-w-[14ch] font-semibold text-white"
            >
              {t("title")}
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.16 }}
              className="mt-10 max-w-md text-lg leading-[var(--nht-leading-body)] text-[var(--nht-text-secondary)]"
            >
              {t("description")}
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ delay: 0.28 }}
              className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Button href="#contact" variant="primary">
                {t("ctaPrimary")}
              </Button>
              <Button href="#services" variant="secondary">
                {t("ctaSecondary")}
              </Button>
            </motion.div>
          </motion.div>

          <div className="relative min-h-[400px] lg:min-h-[540px]">
            <GlowingSphere />
            <FloatingStatCards />
            <div className="relative z-10">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
