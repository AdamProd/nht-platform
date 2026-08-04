"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/brand/Logo";
import Container from "@/components/ui/Container";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  const links = [
    { label: tNav("services"), href: "#services" as const },
    { label: tNav("results"), href: "#why-us" as const },
    { label: tNav("creators"), href: "#stories" as const },
    { label: tNav("faq"), href: "#faq" as const },
    { label: tNav("apply"), href: "#contact" as const },
  ];

  const legal = [
    { label: t("legal.privacy"), href: "#" as const },
    { label: t("legal.terms"), href: "#" as const },
    { label: t("legal.nda"), href: "#" as const },
  ];

  return (
    <footer className="border-t border-white/[0.05]">
      <Container className="py-16 lg:py-20">
        <div className="flex flex-col items-start justify-between gap-12 sm:flex-row sm:items-center">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm text-[var(--nht-text-tertiary)]">
              {t("tagline")}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--nht-text-tertiary)] transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--nht-text-muted)]">
            &copy; {new Date().getFullYear()} {t("copyright")}
          </p>
          <div className="flex gap-8">
            {legal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs text-[var(--nht-text-muted)] transition-colors hover:text-[var(--nht-text-tertiary)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
