"use client";

import { useTranslations } from "next-intl";
import Container from "@/shared/ui/Container";

export default function LogoMarquee() {
  const t = useTranslations("logoMarquee");

  const logos = [
    "OnlyFans",
    "Fansly",
    "ManyVids",
    "Patreon",
    "LoyalFans",
    "JustForFans",
  ];

  const doubled = [...logos, ...logos];

  return (
    <section className="border-y border-white/[0.05] py-[7.5rem]">
      <Container>
        <p className="text-overline mb-14 text-center text-[var(--nht-text-muted)]">
          {t("overline")}
        </p>
      </Container>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#090909] to-transparent sm:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#090909] to-transparent sm:w-40" />

        <div className="animate-marquee flex w-max items-center gap-16 px-8 sm:gap-20">
          {doubled.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-sm font-medium tracking-wide text-white/30 transition-colors hover:border-[var(--nht-border-hover)] hover:text-white/55"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
