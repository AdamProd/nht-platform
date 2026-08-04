"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import Container from "@/components/ui/Container";
import AnimatedGraph from "@/components/marketing/AnimatedGraph";
import { staggerContainer, fadeUp } from "@/components/motion/variants";

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate(motionVal, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${v}${suffix}`;
    });

    return () => {
      observer.disconnect();
      unsub();
    };
  }, [value, prefix, suffix, motionVal, rounded]);

  return (
    <span ref={ref} className="text-4xl font-semibold tracking-[-0.03em] text-white lg:text-5xl">
      {prefix}0{suffix}
    </span>
  );
}

const cardConfig = [
  { key: "creators", value: 500, suffix: "+", graph: [20, 35, 30, 50, 45, 65, 58, 80, 75, 95] },
  { key: "revenue", value: 50, prefix: "$", suffix: "M+", graph: [15, 28, 22, 40, 38, 55, 50, 72, 68, 90] },
  { key: "retention", value: 98, suffix: "%", graph: [88, 90, 89, 92, 91, 94, 93, 96, 95, 98] },
  { key: "uplift", value: 340, suffix: "%", graph: [40, 55, 70, 90, 110, 140, 180, 220, 280, 340] },
] as const;

export default function WhyChooseUs() {
  const t = useTranslations("results");

  return (
    <section id="why-us" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,var(--nht-gold-subtle),transparent_70%)]" />

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
          className="grid gap-5 sm:grid-cols-2 lg:gap-6"
        >
          {cardConfig.map((card) => (
            <motion.div
              key={card.key}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="glass-strong premium-border overflow-hidden rounded-[var(--nht-radius-2xl)] p-7 transition-shadow duration-500 hover:shadow-[var(--nht-shadow-glow)] lg:p-9"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-overline text-[var(--nht-text-tertiary)]">
                    {t(`cards.${card.key}.title`)}
                  </p>
                  <div className="mt-3">
                    <AnimatedNumber
                      value={card.value}
                      prefix={"prefix" in card ? card.prefix : undefined}
                      suffix={card.suffix}
                    />
                  </div>
                  <p className="mt-2 text-xs text-[var(--nht-text-tertiary)]">
                    {t(`cards.${card.key}.metric`)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.05] bg-black/40 p-4">
                <AnimatedGraph data={[...card.graph]} height={72} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
