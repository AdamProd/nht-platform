"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

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
    <section className="border-y border-white/[0.05] py-16">
      <Container>
        <p className="text-overline mb-12 text-center text-[var(--nht-text-muted)]">
          {t("overline")}
        </p>
      </Container>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#090909] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#090909] to-transparent" />

        <div className="animate-marquee flex w-max items-center gap-20 px-8">
          {doubled.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="shrink-0 text-sm font-medium tracking-wide text-white/25 transition-colors hover:text-white/45"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
